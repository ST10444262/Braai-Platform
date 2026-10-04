# Inflame Platform

## 1. System Overview & Architecture

### Executive Summary

Inflame is a full-stack web platform for a Cape Town-based fireplace and braai business. The repository contains:

- a **public customer website** for browsing fireplaces and braais, viewing product details, submitting quote/enquiry requests, and submitting custom-build requests;
- an **admin dashboard** for authenticated Inflame staff to manage products, clients, enquiries, staff accounts, account security, and related CRM information;
- a **.NET 10 Web API** that provides the application/business layer between the frontends and backing services;
- **PostgreSQL/Supabase** for application data and ASP.NET Core Identity data;
- **Redis/Upstash** for repository-level caching;
- **Supabase Storage** for uploaded files/images;
- SMTP email notifications for quote requests;
- Docker and GitHub Actions support for deployment and CI.

The backend follows a **layered architecture** combined with **CQRS/MediatR**, the **Repository pattern**, cached repository decorators, a product **Facade**, a product **Query Builder**, and several explicit behavioural/creational patterns. Authentication is implemented with ASP.NET Core Identity, JWT bearer authentication, role-based authorization, TOTP 2FA, and trusted-device cookies.

### High-Level Architecture

```text
                         ┌───────────────────────────┐
                         │       Public Website      │
                         │      Next.js / React      │
                         └─────────────┬─────────────┘
                                       │ HTTPS
                         ┌─────────────▼─────────────┐
                         │       Admin Website       │
                         │      Next.js / React      │
                         └─────────────┬─────────────┘
                                       │
                              HTTP / JSON / Forms
                                       │
                              ┌────────▼────────┐
                              │ Cloudflare/WAF   │
                              └────────┬────────┘
                                       │
                              ┌────────▼────────┐
                              │  ASP.NET Core   │
                              │    Web API      │
                              │     .NET 10     │
                              └────────┬────────┘
                                       │
             ┌─────────────────────────┼─────────────────────────┐
             │                         │                         │
      ┌──────▼──────┐          ┌──────▼──────┐          ┌──────▼──────┐
      │ ASP.NET     │          │ Supabase    │          │ Redis /     │
      │ Identity +  │          │ PostgreSQL  │          │ Upstash      │
      │ EF Core     │          │ + PostgREST │          │ Cache        │
      └─────────────┘          └──────┬──────┘          └─────────────┘
                                      │
                               ┌──────▼──────┐
                               │ Supabase    │
                               │ Storage     │
                               └─────────────┘

                               ┌─────────────┐
                               │ SMTP /      │
                               │ MailKit     │
                               └─────────────┘
```

The intended deployment documentation in the project describes Render as the API hosting platform, Cloudflare as the public perimeter, Upstash as the managed Redis service, and Supabase as the managed PostgreSQL/object-storage provider.

### Core Features & Domain Logic

#### Public catalogue

The public API exposes product catalogue endpoints with filtering and pagination. Products are modelled around a base `Product` entity with specialised `BraaiProduct` and `FireplaceProduct` records.

Supported catalogue behaviour includes:

- product type/category filtering;
- brand filtering;
- price range filtering;
- visibility filtering;
- search by product name or brand;
- sorting by price ascending/descending;
- braai fuel-type filtering;
- fireplace heat-output filtering;
- pagination;
- product image retrieval.

The `ProductCatalogueFacade` combines product, braai, fireplace and image repositories so controllers do not need to orchestrate those repositories directly.

#### Customer enquiries and quote requests

Customers can submit quote/enquiry requests through the public API. The backend creates CRM records and uses observer-based notification/logging components.

The enquiry lifecycle is represented using the State pattern:

```text
New
 │
 ├──────────────► Dead
 │
 ▼
Under Review
 │
 ▼
Contacted
 ├──────────────► Dead
 │
 ▼
Converted
```

Backward transitions are rejected by the state classes.

#### Custom builds

The public site can submit custom-build dimensions/details. The backend persists the corresponding custom-build data through the CustomBuild feature and repositories.

#### CRM

The admin API supports:

- client creation, retrieval, update and deletion;
- client internal notes;
- client invoice uploads;
- invoice deletion;
- enquiry retrieval;
- enquiry status updates;
- overview/dashboard metrics.

#### Product management

Authenticated staff can view products. Product creation, editing, deletion and image-management operations are restricted to `SuperAdmin` and `Admin`.

Product image functionality includes:

- upload;
- delete;
- primary-image selection;
- image handling during product create/update.

Employees have reduced product-management permissions. The product command layer also contains explicit logic preventing an Employee from changing product price.

#### Staff/account management

The application uses two related user representations:

1. `ApplicationUser` — ASP.NET Core Identity entity responsible for authentication, passwords, 2FA, roles and Identity account state.
2. `StaffAccount` — CRM/domain entity containing staff-specific application data and the `IdentityUserId` link to the Identity account.

The staff API supports:

- staff listing;
- role filtering;
- search;
- pagination;
- staff creation;
- staff editing;
- staff deletion;
- profile image upload/replacement;
- account activation/deactivation;
- administrator-controlled password replacement;
- personal password changes;
- quote-email notification preference;
- 2FA setup;
- trusted-device management.

Role rules implemented in the current backend are:

| Action | SuperAdmin | Admin | Employee |
|---|---:|---:|---:|
| Create Employee | Yes | Yes | No |
| Create Admin | Yes | No | No |
| Create SuperAdmin through staff endpoint | No | No | No |
| Edit Employee | Yes | Yes | No |
| Edit Admin | Yes | No | No |
| Edit SuperAdmin | No | No | No |
| Assign Admin role | Yes | No | No |
| Assign SuperAdmin role through staff edit | No | No | No |
| Delete Employee | Yes | Yes | No |
| Delete Admin | Yes | No | No |
| Delete SuperAdmin | No | No | No |
| Delete own account through staff deletion | No | No | No |
| Manage own account/security | Yes | Yes | Yes |

#### Authentication and security

The backend uses:

- ASP.NET Core Identity;
- password hashing through Identity;
- JWT bearer authentication;
- Identity roles;
- TOTP-based authenticator 2FA;
- short-lived 2FA challenge tokens;
- optional trusted-device cookies;
- account activation checks;
- lockout configuration;
- global request rate limiting;
- global XSS sanitisation filter;
- security headers;
- CSP;
- forwarded-header handling for reverse-proxy deployments;
- optional Cloudflare shared-secret perimeter check in production.

### Design Patterns and Architectural Patterns

The implementation contains the following patterns:

| Pattern | Implementation | Purpose |
|---|---|---|
| Layered/N-Tier | Controllers → Features/Facades → Repositories | Separation of concerns |
| CQRS | MediatR Commands/Queries | Separates write/read use cases |
| Mediator | MediatR | Decouples controllers from handlers |
| Repository | `IBaseRepository<T>` and concrete repositories | Abstracts data access |
| Decorator | `CachedBaseRepository<T>` and cached repositories | Adds Redis caching without changing base repositories |
| Facade | `ProductCatalogueFacade` | Simplifies catalogue orchestration |
| Builder | `ProductQueryBuilder` | Composes product filters dynamically |
| Factory | `ProductFactory` | Creates specialised braai/fireplace product records |
| Adapter | `IStorageAdapter` / `SupabaseStorageAdapter` | Decouples storage usage from Supabase |
| Observer | Quote/product notifier and observers | Handles secondary actions such as email/logging |
| State | `QuoteLeadManager` and enquiry states | Controls valid enquiry lifecycle transitions |
| Chain of Responsibility | ASP.NET middleware pipeline | Request processing, authentication, rate limiting and security middleware |
| Dependency Injection | ASP.NET Core DI | Manages application dependencies/lifetimes |

---

## 2. Directory & Solution Structure

### Repository tree

```text
Braai-Platform/
├── .github/
│   └── workflows/
│       └── backend-ci.yml
│
├── backend/
│   └── src/
│       └── Inflame-Backend/
│           ├── Inflame-Backend.slnx
│           │
│           ├── Inflame-Backend/
│           │   ├── Builders/
│           │   │   └── ProductQueryBuilder.cs
│           │   ├── Controllers/
│           │   │   ├── Admin/
│           │   │   │   ├── AccountController.cs
│           │   │   │   ├── CRMController.cs
│           │   │   │   ├── EnquiriesController.cs
│           │   │   │   ├── OverviewController.cs
│           │   │   │   └── ProductController.cs
│           │   │   └── Public/
│           │   │       ├── CustomBuildController.cs
│           │   │       ├── HealthController.cs
│           │   │       ├── ProductController.cs
│           │   │       └── QuoteController.cs
│           │   ├── Data/
│           │   │   ├── Adapters/
│           │   │   ├── Context/
│           │   │   ├── DataLayer/
│           │   │   ├── Instances/
│           │   │   └── Repositories/
│           │   │       ├── CRM/
│           │   │       ├── CustomBuild/
│           │   │       └── ProductCatalog/
│           │   ├── Facades/
│           │   ├── Factories/
│           │   ├── Features/
│           │   │   ├── Authentication/
│           │   │   ├── Client/
│           │   │   ├── CustomBuild/
│           │   │   ├── Enquiries/
│           │   │   ├── Overview/
│           │   │   ├── Product/
│           │   │   └── Staff/
│           │   ├── Filters/
│           │   ├── Identity/
│           │   ├── Models/
│           │   │   ├── CRM/
│           │   │   ├── CustomBuild/
│           │   │   └── ProductCatalog/
│           │   ├── Migrations/
│           │   ├── Observers/
│           │   ├── Services/
│           │   ├── States/
│           │   │   └── EnquiryStates/
│           │   ├── Program.cs
│           │   ├── Dockerfile
│           │   └── Inflame-Backend.csproj
│           │
│           └── Inflame-Backend.Tests/
│               ├── ApplicationLayer/
│               ├── Controllers/
│               ├── DataAccess/
│               ├── DesignPatterns/
│               ├── Security/
│               └── Inflame-Backend.Tests.csproj
│
├── frontend/
│   └── src/
│       ├── Admin-Website/
│       │   ├── src/app/
│       │   │   ├── (dashboard)/
│       │   │   │   ├── clients/
│       │   │   │   ├── leads/
│       │   │   │   ├── overview/
│       │   │   │   ├── products/
│       │   │   │   ├── profile/
│       │   │   │   └── users/
│       │   │   └── login/
│       │   ├── src/components/
│       │   ├── src/lib/
│       │   ├── public/
│       │   ├── package.json
│       │   └── next.config.ts
│       │
│       └── Public-Website/
│           ├── src/app/
│           │   ├── braais/
│           │   ├── fireplaces/
│           │   ├── custom-products/
│           │   ├── contact/
│           │   └── specials/
│           ├── src/components/
│           ├── src/hooks/
│           ├── src/services/
│           ├── src/types/
│           └── package.json
│
├── docs/
│   └── INSY7315 Task 1.pdf
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

### Backend directory responsibilities

- `Controllers/` — HTTP/API boundary. Controllers authenticate/authorize requests and dispatch use cases through MediatR.
- `Features/` — use-case-oriented application logic. Commands represent writes and Queries represent reads. DTOs define API payloads.
- `Models/` — Supabase/PostgREST domain persistence models.
- `Identity/` — ASP.NET Core Identity user model, role seeding and JWT generation.
- `Data/DataLayer/` — generic repository abstractions and implementations.
- `Data/Repositories/` — entity-specific repository contracts and concrete/cached implementations.
- `Data/Adapters/` — external storage abstraction and Supabase Storage adapter.
- `Data/Instances/` — long-lived Redis and Supabase client instances.
- `Facades/` — orchestration of multiple repositories for higher-level use cases.
- `Builders/` — composable product catalogue filtering.
- `Factories/` — specialised product construction.
- `Observers/` — event-style notification/logging behaviour.
- `States/` — enquiry/lead lifecycle state machine.
- `Services/` — cross-cutting services such as SMTP, 2FA challenges and trusted devices.
- `Filters/` — MVC request filters; the XSS filter is registered globally.
- `Migrations/` — EF Core migrations for the Identity database only.

### Frontend responsibilities

**Admin Website**

Provides authenticated dashboard pages for:

- overview;
- clients;
- leads/enquiries;
- products;
- users;
- profile/security.

`src/lib/api.ts` provides the central browser API client and token handling. `next.config.ts` proxies `/api/*` requests to the backend.

**Public Website**

Provides:

- product catalogue;
- product detail pages;
- quote/enquiry forms;
- custom-build forms;
- specials;
- contact page;
- fireplace/braai navigation.

---

## 3. Database Schema & Data Models

### Important persistence distinction

The repository currently uses **two database access mechanisms against PostgreSQL/Supabase**:

1. **ASP.NET Core Identity database**
   - accessed through Entity Framework Core/Npgsql;
   - managed by `IdentityDbContext`;
   - has an EF migration in `Migrations/`.

2. **Application/CRM/catalogue database**
   - accessed through the Supabase .NET/PostgREST client;
   - models inherit from `Supabase.Postgrest.Models.BaseModel`;
   - table/column names are declared with Supabase attributes such as `[Table]`, `[Column]`, `[PrimaryKey]`, and `[Reference]`.

No SQL migration scripts for the Supabase/PostgREST application tables are included in this repository. Their physical schema therefore needs to exist in the configured Supabase project.

### Identity schema

The included initial EF migration creates the standard ASP.NET Core Identity structures, including:

- `AspNetUsers`
- `AspNetRoles`
- `AspNetUserRoles`
- `AspNetUserClaims`
- `AspNetRoleClaims`
- `AspNetUserLogins`
- `AspNetUserTokens`

`ApplicationUser` extends `IdentityUser<Guid>` with:

| Property | Purpose |
|---|---|
| `Id` | Identity primary key |
| `FullName` | Staff display name |
| `IsActive` | Application-level account activation |
| `CreatedAt` | Account creation timestamp |
| Identity inherited fields | Email, username, password hash, phone, 2FA, lockout, etc. |

### CRM entities

#### `staff_account`

Primary key: `staff_id`

Important fields:

- `staff_id`
- `identity_user_id`
- `email`
- `full_name`
- `profile_image_url`
- `role`
- `is_active`
- `receive_quote_emails`
- `created_at`
- `updated_at`

`identity_user_id` links the CRM staff record to the corresponding ASP.NET Identity user.

Relationships represented in the model:

- Staff → Internal Notes
- Staff → Invoice Records
- Staff → Gallery Images

#### `client`

Primary key: `client_id`

Fields include:

- first name;
- last name;
- email;
- phone;
- physical address;
- created/updated timestamps.

Relationships:

- Client → Enquiries
- Client → Invoice Records
- Client → Internal Notes

#### `enquiry`

Primary key: `enquiry_id`

Fields include:

- enquiry type;
- customer name/contact information;
- optional `product_id`;
- optional `custom_option_id`;
- message;
- status;
- created/updated timestamps;
- optional `client_id`.

References connect enquiries to products, custom options and clients.

#### `internal_note`

Primary key: `note_id`

Foreign-key-like fields:

- `client_id`
- `staff_account_id`

The note model references the client and the staff member who authored the note.

#### `invoice_record`

Primary key: `invoice_id`

Fields include:

- file name;
- file URL;
- upload timestamp;
- `client_id`;
- `staff_account_id`.

Actual invoice files are stored externally; the relational record stores metadata and URL information.

#### `analytics_logs`

Primary key: `log_id`

Stores:

- action;
- details;
- created timestamp.

### Product catalogue

#### `product`

Primary key: `product_id`

Core fields:

- name;
- category;
- product type;
- brand;
- imported flag;
- customisable flag;
- price;
- description;
- special price;
- visibility;
- created/updated timestamps.

A product can reference multiple `product_image` records.

#### `braai_product`

Uses `product_id` as its primary key/reference to the base product.

Additional attributes:

- fuel type;
- braai type.

#### `fireplace_product`

Uses `product_id` as its primary key/reference to the base product.

Additional attributes:

- heat output in kW;
- fireplace type.

#### `product_image`

Primary key: `image_id`

Fields:

- product ID;
- URL;
- primary-image flag.

### Custom-build entities

#### `custom_braai_option`

Primary key: `custom_option_id`

Contains:

- option type;
- material;
- style;
- dimensions;
- additional message.

#### `custom_braai_part`

Primary key: `part_id`

References `custom_option_id`.

#### `custom_fireplace_part`

Primary key: `part_id`

References `custom_option_id`.

#### `gallery_photo`

Primary key: `photo_id`

Fields include:

- uploader/staff ID;
- title;
- URL;
- description;
- upload timestamp.

### Relationship overview

```text
ApplicationUser (ASP.NET Identity)
        │
        │ IdentityUserId
        ▼
   StaffAccount
     │  │  │
     │  │  └──────────────► GalleryImage
     │  ├─────────────────► InvoiceRecord
     │  └─────────────────► InternalNote
     │
     └──────────────┐
                    │
Client ────────────┼────► Enquiry
  │                │          │
  ├──► Invoice     │          ├──► Product
  └──► Note        │          └──► CustomOption

Product
  ├──► ProductImage
  ├──► BraaiProduct
  └──► FireplaceProduct

CustomOption
  ├──► CustomBraaiPart
  └──► CustomFireplacePart
```

The `[Reference]` attributes describe object relationships for Supabase/PostgREST models. The repository does not contain a complete SQL DDL definition for these application tables, so exact database-level FK constraints should be verified in the deployed Supabase database.

---

## 4. Setup, Installation & Execution

### Prerequisites

#### Backend

The backend targets:

- **.NET SDK 10**
- ASP.NET Core 10
- PostgreSQL-compatible database for Identity
- Supabase project for application data
- Redis-compatible service for caching
- SMTP account if email notifications are required

The CI workflow explicitly uses `.NET 10.0.x`.

#### Frontends

Both frontends use:

- Node.js/npm;
- Next.js `16.3.5`;
- React `19.2.8`;
- TypeScript;
- Tailwind CSS 4;
- ESLint 9.

### Backend configuration

The application reads the following configuration keys:

```text
ConnectionStrings:Redis
ConnectionStrings:IdentityDatabase

Supabase:Url
Supabase:Key

Jwt:Key
Jwt:Issuer
Jwt:Audience
Jwt:ExpiryMinutes

Authentication:TwoFactorChallengeMinutes
Authentication:TrustedDeviceDays

EmailSettings:FromEmail
EmailSettings:FromName
EmailSettings:SmtpServer
EmailSettings:SmtpPort
EmailSettings:SmtpUsername
EmailSettings:SmtpPassword

AllowedOrigins[]

Cloudflare:Secret

Identity:SeedAdmin:Email
Identity:SeedAdmin:Password
```

A safe production configuration should look conceptually like:

```json
{
  "ConnectionStrings": {
    "Redis": "<redis connection string>",
    "IdentityDatabase": "<postgres connection string>"
  },
  "Supabase": {
    "Url": "<supabase project URL>",
    "Key": "<supabase service/API key>"
  },
  "Jwt": {
    "Key": "<long random signing key>",
    "Issuer": "Inflame-Backend",
    "Audience": "Inflame-Admin",
    "ExpiryMinutes": 60
  },
  "Authentication": {
    "TwoFactorChallengeMinutes": 5,
    "TrustedDeviceDays": 14
  },
  "EmailSettings": {
    "FromEmail": "<sender>",
    "FromName": "Inflame Quotes",
    "SmtpServer": "<smtp host>",
    "SmtpPort": "587",
    "SmtpUsername": "<smtp username>",
    "SmtpPassword": "<smtp password>"
  },
  "AllowedOrigins": [
    "https://<admin-domain>",
    "https://<public-domain>"
  ],
  "Identity": {
    "SeedAdmin": {
      "Email": "<initial-superadmin-email>",
      "Password": "<initial-superadmin-password>"
    }
  }
}
```

`Cloudflare:Secret` is optional according to the current middleware. When configured in production, requests are expected to carry the matching `X-Cloudflare-Secret` header.

### Identity database setup

The project includes an initial EF Core migration:

```text
backend/src/Inflame-Backend/Inflame-Backend/Migrations/
    20260927200911_InitialIdentity.cs
```

From the backend solution directory:

```bash
cd backend/src/Inflame-Backend

dotnet restore Inflame-Backend.slnx

dotnet build Inflame-Backend.slnx --configuration Release
```

For a database update using EF Core tooling:

```bash
dotnet ef database update \
  --project Inflame-Backend/Inflame-Backend.csproj \
  --startup-project Inflame-Backend/Inflame-Backend.csproj
```

The exact connection string must be supplied through the active ASP.NET Core configuration.

### Supabase application schema

The repository contains C# Supabase models but **does not contain SQL migrations for the CRM/catalogue/custom-build tables**.

Before running the application, verify that the configured Supabase project contains at least the tables represented by:

```text
staff_account
client
enquiry
internal_note
invoice_record
analytics_logs

product
product_image
braai_product
fireplace_product

custom_braai_option
custom_braai_part
custom_fireplace_part
gallery_photo
```

Column names should match the `[Column(...)]` attributes in the models.

### Redis setup

The backend expects:

```text
ConnectionStrings:Redis
```

The implementation accepts a Redis URI such as:

```text
redis://...
```

or TLS Redis:

```text
rediss://...
```

`RedisInstance` parses the URI and creates a StackExchange.Redis `ConnectionMultiplexer`.

### Backend local execution

From:

```bash
cd backend/src/Inflame-Backend
```

Run:

```bash
dotnet restore Inflame-Backend.slnx
dotnet build Inflame-Backend.slnx
dotnet run --project Inflame-Backend/Inflame-Backend.csproj
```

The Docker Compose configuration maps the backend container's port 8080 to host port 5282:

```text
http://localhost:5282
```

### Frontend local execution

#### Admin Website

```bash
cd frontend/src/Admin-Website
npm ci
npm run dev
```

The default Next.js development URL is:

```text
http://localhost:3000
```

The admin Next.js application proxies:

```text
/api/*
```

to the backend URL defined by:

```text
BACKEND_URL
```

The default is:

```text
http://localhost:5282
```

#### Public Website

```bash
cd frontend/src/Public-Website
npm ci
npm run dev
```

Public API services use:

```text
NEXT_PUBLIC_API_BASE_URL
```

When empty, requests are relative to the current origin.

### Docker Compose

The repository provides:

```text
docker-compose.yml
```

with three services:

```text
backend
public-website
admin-website
```

Start them with:

```bash
docker compose up --build
```

Ports configured by the compose file:

| Service | Host port | Container port |
|---|---:|---:|
| Backend | 5282 | 8080 |
| Public Website | 3000 | 3000 |
| Admin Website | 3001 | 3000 |

The public and admin containers receive:

```text
BACKEND_URL=http://backend:8080
```

The Docker setup assumes the external PostgreSQL/Supabase and Redis services are configured through the backend's runtime configuration.

### Testing

Testing is currently still in progress and is therefore not documented as a completed part of the project in this README.

The repository contains a backend test project under:

```text
backend/src/Inflame-Backend/Inflame-Backend.Tests/
```

The test suite and CI test/coverage configuration are still being developed.

---

## 5. API Endpoint Reference / Interfaces

Base API route:

```text
/api
```

### Authentication and staff accounts

Controller:

```text
Controllers/Admin/AccountController.cs
```

Base route:

```text
/api/admin/account
```

| Method | Route | Authorization | Purpose |
|---|---|---|---|
| POST | `/login` | Anonymous | Email/password login |
| POST | `/login/2fa` | Anonymous | Verify login TOTP challenge |
| POST | `/2fa/setup` | Anonymous | Generate TOTP setup data from setup challenge |
| POST | `/2fa/verify` | Anonymous | Verify/enable TOTP |
| POST | `/2fa/reset` | SuperAdmin/Admin | Reset another user's 2FA |
| GET | `/me` | Authenticated | Retrieve signed-in user's staff profile |
| POST | `/change-password` | Authenticated | Change current password |
| PUT | `/me/preferences` | Authenticated | Update quote-email preference |
| GET | `/me/devices` | Authenticated | List active trusted devices |
| DELETE | `/me/devices/{deviceId}` | Authenticated | Revoke a trusted device |
| POST | `/me/2fa/setup` | Authenticated | Start 2FA setup for current user |
| POST | `/staff` | SuperAdmin/Admin | Create staff account |
| PUT | `/staff/{staffId}` | SuperAdmin/Admin | Edit staff account |
| DELETE | `/staff/{staffId}` | SuperAdmin/Admin | Delete staff account |
| GET | `/staff` | SuperAdmin/Admin | List/filter/paginate staff |

#### Login request

```json
{
  "email": "user@example.com",
  "password": "..."
}
```

The response can either contain a JWT or indicate that a 2FA challenge/setup is required.

#### Create staff

The current endpoint consumes `multipart/form-data`.

Fields:

```text
email
password
fullName
role
profileImage (optional file)
```

#### Update staff

The current endpoint consumes `multipart/form-data`.

Fields:

```text
email
fullName
role
isActive
newPassword (optional)
profileImage (optional file)
```

#### Staff list query parameters

`GET /api/admin/account/staff`

Supports:

```text
staffAccountId
role
searchTerm
pageNumber
pageSize
```

The query defaults to:

```text
pageNumber = 1
pageSize = 20
```

Filtering is currently performed in application memory after retrieving the staff collection from the repository.

### CRM

Controller:

```text
Controllers/Admin/CRMController.cs
```

Base route:

```text
/api/admin/crm
```

| Method | Route | Authorization | Purpose |
|---|---|---|---|
| GET | `/clients` | SuperAdmin/Admin/Employee | List clients |
| POST | `/clients` | SuperAdmin/Admin/Employee | Create client |
| PUT | `/clients/{id}` | SuperAdmin/Admin/Employee | Update client |
| DELETE | `/clients/{id}` | SuperAdmin/Admin/Employee | Delete client |
| POST | `/clients/{id}/invoices` | SuperAdmin/Admin | Upload invoice |
| POST | `/clients/{id}/notes` | SuperAdmin/Admin | Add internal note |
| DELETE | `/clients/{id}/notes/{noteId}` | SuperAdmin/Admin | Delete note |
| DELETE | `/clients/{id}/invoices/{invoiceId}` | SuperAdmin/Admin | Delete invoice |

### Enquiries

Controller:

```text
Controllers/Admin/EnquiriesController.cs
```

Base route:

```text
/api/admin/enquiries
```

| Method | Route | Authorization | Purpose |
|---|---|---|---|
| GET | `/` | SuperAdmin/Admin/Employee | Retrieve enquiries |
| PUT | `/{enquiryId}/status` | SuperAdmin/Admin/Employee | Update enquiry status |

The status update is passed through the enquiry State implementation, which prevents invalid lifecycle transitions.

### Overview

```text
GET /api/admin/overview
```

Authorization:

```text
SuperAdmin, Admin, Employee
```

Returns:

- lead pipeline metrics;
- catalogue totals;
- recent quote requests;
- system-health indicators.

### Admin products

Controller:

```text
Controllers/Admin/ProductController.cs
```

Base route:

```text
/api/admin/products
```

| Method | Route | Authorization | Purpose |
|---|---|---|---|
| GET | `/` | SuperAdmin/Admin/Employee | Retrieve catalogue |
| POST | `/` | SuperAdmin/Admin | Create product |
| PUT | `/{productId}` | SuperAdmin/Admin | Update product |
| DELETE | `/{productId}` | SuperAdmin/Admin | Delete product |
| POST | `/{productId}/images` | SuperAdmin/Admin | Upload product images |
| PUT | `/{productId}/images/{imageId}/primary` | SuperAdmin/Admin | Set primary image |
| DELETE | `/{productId}/images/{imageId}` | SuperAdmin/Admin | Delete product image |

### Public products

Controller:

```text
Controllers/Public/ProductController.cs
```

Base route:

```text
/api/public/products
```

| Method | Route | Authorization | Purpose |
|---|---|---|---|
| GET | `/` | Anonymous | Public product catalogue |
| GET | `/{id}` | Anonymous | Public product detail |

Catalogue query options include category/product type, brand, price ranges, fuel type, heat-output ranges, sorting, search, page number and page size.

### Public quote requests

```text
POST /api/public/quotes
```

Anonymous.

The request is represented by `CreateQuoteCommand` and supports customer contact information plus optional product/custom-option context.

### Public custom builds

```text
POST /api/public/customBuilds
```

Anonymous.

The current DTO includes:

```text
optionType
widthMm
heightMm
depthMm
firstName
lastName
email
phone
```

### Public health

```text
GET /api/public/health
```

Anonymous health/ping endpoint.

---

## 6. Caching & Performance Considerations

### Redis repository decorator

The generic `CachedBaseRepository<T>` wraps the normal repository implementation.

For every entity type it uses keys of the form:

```text
{type}:all
{type}:{guid}
```

Examples conceptually include:

```text
product:all
product:<guid>
staffaccount:all
client:<guid>
```

### Cache behaviour

`GetAllAsync()`:

1. checks Redis;
2. returns the cached JSON when present;
3. otherwise calls the underlying repository;
4. serializes the result;
5. stores it in Redis for five minutes.

`GetByIdAsync()` follows the same cache-aside pattern.

Writes call the underlying repository first and then invalidate:

```text
{type}:all
{type}:{id}
```

This prevents stale collection and entity cache entries after CRUD operations.

### Repository registration

The application registers concrete PostgreSQL/Supabase repositories and exposes cached implementations through the interface:

```text
IProductRepository
    └── CachedProductRepository
            └── PostgresProductRepository

IClientRepository
    └── CachedClientRepository
            └── PostgresClientRepository
```

The same structure is used for CRM, product-catalogue and custom-build repositories.

### Catalogue performance

`ProductCatalogueFacade`:

- loads products through the cached product repository;
- applies filters through `ProductQueryBuilder`;
- applies pagination;
- loads images for only the paginated products.

This is intended to avoid returning the entire catalogue to public clients.

### Current performance limitation

The underlying repository abstraction currently exposes `GetAllAsync()` and then many feature handlers perform filtering/pagination in application memory.

For a small catalogue this is straightforward, but for a substantially larger production dataset it can become a scalability bottleneck because the database is not doing the filtering, sorting and pagination.

A future implementation should introduce database-side query methods such as:

```text
GetPagedAsync(...)
SearchAsync(...)
GetByRoleAsync(...)
GetByClientIdAsync(...)
```

using Supabase/PostgREST filters rather than retrieving every row.

### Staff pagination

The staff API supports `pageNumber` and `pageSize`, with a default of 20.

However, the current Admin Website users page requests up to 1000 staff records and performs its visible filtering/pagination on the client. The UI currently displays eight rows per page.

Therefore the backend supports server-side pagination, but the current frontend does **not** yet fully exploit the intended 20-record server-side pagination model.

---

## 7. Known Limitations & Recommendations

### 7.1 Secrets must not remain in source control

The supplied repository contains credential-looking values in `appsettings.json`.

**Recommendation:**

- rotate any real credentials;
- remove secrets from Git history if they were committed;
- use environment variables, hosting-platform secrets or ASP.NET Core user secrets;
- use a safe example configuration file for documentation.

### 7.2 Supabase application schema is external to the repository

Only the Identity schema has EF migrations in this repository.

The application tables represented by the Supabase models do not have versioned SQL migrations in the repository.

**Recommendation:**

Add a version-controlled database migration strategy for:

```text
staff_account
client
enquiry
internal_note
invoice_record
analytics_logs
product
product_image
braai_product
fireplace_product
custom_braai_option
custom_braai_part
custom_fireplace_part
gallery_photo
```

### 7.3 Staff pagination is not currently end-to-end

The backend supports:

```text
pageNumber
pageSize
```

but the Admin Website requests a large page and performs filtering/pagination locally.

**Recommendation:**

Change the Admin Users page to send:

```text
pageNumber=1
pageSize=20
role=...
searchTerm=...
```

and have the API return a paginated response containing metadata such as:

```json
{
  "items": [],
  "pageNumber": 1,
  "pageSize": 20,
  "totalCount": 0,
  "totalPages": 0
}
```

This is preferable to returning a bare array.

### 7.4 Admin user edit/delete UI is not finished

The backend already exposes staff update/delete endpoints, but the current Admin Website user-detail page explicitly leaves the Edit and Delete buttons disabled.

**Recommendation:**

Connect the existing UI to:

```text
PUT /api/admin/account/staff/{staffId}
DELETE /api/admin/account/staff/{staffId}
```

and add the corresponding form/confirmation flows.

### 7.5 Personal profile editing is incomplete

The current `/api/admin/account/me` endpoint exposes the current profile, but the current dashboard profile page primarily provides:

- password change;
- quote-email preference;
- 2FA management;
- trusted-device management.

It does not currently provide a general personal-details/email edit operation.

**Recommendation:**

If the final UI requires users to edit their own name/email, add a dedicated authenticated endpoint and command that updates both:

```text
ApplicationUser
StaffAccount
```

consistently.

### 7.6 Cross-store consistency

Staff creation/update/deletion can involve:

```text
ASP.NET Identity
Supabase staff_account
Supabase Storage
```

These are separate persistence systems.

There is no distributed transaction spanning all three.

The current code contains compensating behaviour in some create/delete paths, but partial failure remains possible.

**Recommendation:**

Use a clear consistency strategy:

- validate all inputs before mutation;
- perform changes in a deliberate order;
- use compensating actions;
- log failed compensations;
- consider asynchronous cleanup for storage objects;
- add integration tests for partial failures.

### 7.7 Profile-image validation

Profile-image uploads are accepted through `IFormFile`.

The current implementation derives the storage filename extension from the supplied filename.

**Recommendation:**

Add:

- maximum file-size enforcement;
- allowlisted MIME types;
- extension/content validation;
- image decoding validation;
- optional image dimension limits;
- malware scanning if required by the production threat model.

### 7.8 Public Supabase storage URLs

The storage adapter uses Supabase public URLs for uploaded files.

**Recommendation:**

For private business documents such as invoices, use private buckets and short-lived signed URLs rather than public URLs.

Product/public-gallery assets can remain public if that matches the business requirement.

### 7.9 XSS sanitisation is intentionally simple

`XssSanitizationFilter` strips HTML tags using a regular expression.

This is useful as a defence-in-depth measure, but regex-based HTML sanitisation is not a complete HTML security model.

**Recommendation:**

- prefer output encoding by default;
- avoid rendering untrusted HTML;
- use a mature HTML sanitisation library if rich HTML is ever required;
- keep the CSP;
- test dangerous URL/script payloads.

### 7.10 Rate limiting is global and IP-based

The backend uses a fixed-window limiter:

```text
100 requests / minute / IP
queue = 5
```

This is useful as a baseline but can be restrictive for shared networks and does not distinguish expensive endpoints from cheap endpoints.

**Recommendation:**

Introduce endpoint-specific policies for:

- login;
- 2FA;
- public enquiry submission;
- custom-build submission;
- file uploads.

Consider user/account-based limits for authenticated endpoints.

### 7.11 JWT invalidation

JWTs are configured with a finite expiry, but JWTs are otherwise stateless.

Deactivating a user prevents future login, but an already-issued token may remain usable until it expires.

**Recommendation:**

For high-security requirements, add token revocation/versioning or a security-stamp validation mechanism.

### 7.12 Trusted-device security

Trusted devices use an HttpOnly, Secure, SameSite cookie and are stored in the Identity database.

This is a good baseline.

**Recommendation:**

- log security events for device creation/revocation;
- consider rotating trusted-device tokens;
- provide a "revoke all devices" operation;
- ensure production HTTPS is always enforced.

### 7.13 SMTP error handling

The SMTP service opens a new SMTP connection per send operation.

**Recommendation:**

For higher traffic:

- use a background queue;
- batch notifications where possible;
- retry transient SMTP failures;
- add structured logging;
- avoid blocking request completion on email delivery.

The quote observer already supports a BCC batch operation, which is a useful optimisation.

### 7.14 Observer uses `async void`

`EmailNotificationObserver.Update` is asynchronous but uses `async void`.

This makes error propagation and lifecycle control harder.

**Recommendation:**

Prefer an asynchronous observer contract such as:

```csharp
Task UpdateAsync(...)
```

and await notification execution.

For production-scale notifications, a background queue is preferable.

### 7.15 Frontend API topology differs between applications

The Admin Website proxies API requests through Next.js using `BACKEND_URL`.

The Public Website services use:

```text
NEXT_PUBLIC_API_BASE_URL
```

directly.

This creates two different API configuration models.

**Recommendation:**

Standardise the API URL strategy, particularly for local development and production deployment.

### 7.16 Documentation drift

The supplied project documentation describes the intended architecture, patterns and deployment model, while the implementation has evolved beyond some of the original design assumptions.

Examples include:

- current authentication using ASP.NET Identity + JWT;
- current staff CRUD implementation;
- current frontend user-management limitations;
- application-table schema being external to the repository.

**Recommendation:**

Treat this README as the implementation-oriented reference and update the academic/design documentation whenever the architecture materially changes.

### 7.17 Generated/build files should not be committed

The archive contains Visual Studio `.vs`, `bin`, `obj` and generated build artefacts.

The `.gitignore` already excludes most of these.

**Recommendation:**

Keep source repositories clean by removing generated artefacts from version control and ensuring future commits contain only source/configuration/documentation required for development.

---

## CI/CD

The repository contains:

```text
.github/workflows/backend-ci.yml
```

The workflow triggers on pushes and pull requests targeting:

```text
main
develop
```

when backend files or the workflow change.

The pipeline currently provides **backend CI** for restoring and building the backend.

Testing and coverage are still under development, so the README does not treat the test pipeline as final or complete.

The repository does not currently contain an equivalent finalized GitHub Actions workflow for frontend validation.

---

## Deployment

The backend Dockerfile is a multi-stage .NET 10 container build:

```text
mcr.microsoft.com/dotnet/sdk:10.0
        │
        ├── restore
        ├── build
        └── publish
                │
                ▼
mcr.microsoft.com/dotnet/aspnet:10.0
```

The final container runs:

```text
dotnet Inflame-Backend.dll
```

Docker Compose starts:

```text
backend
public-website
admin-website
```

The architecture described in the supplied project documentation uses:

```text
Internet
   │
   ▼
Cloudflare
   │
   ▼
Render
   │
   ├── Upstash Redis
   ├── Supabase PostgreSQL
   ├── Supabase Storage
   └── SMTP
```

Backing services are intended to be accessed by the API rather than directly by browser clients where the API is acting as the integration boundary.

---

## Security Configuration Summary

The backend currently configures:

- JWT issuer and audience validation;
- JWT signing-key validation;
- lifetime validation with zero clock skew;
- Identity password requirements;
- unique email addresses;
- five failed-attempt lockout;
- 15-minute lockout duration;
- role-based authorization;
- TOTP 2FA;
- trusted-device cookies;
- global 100/minute IP rate limit;
- HTTPS redirection;
- HSTS outside Development;
- `X-Content-Type-Options: nosniff`;
- `X-Frame-Options: DENY`;
- `X-XSS-Protection`;
- strict referrer policy;
- Content Security Policy;
- global request-string sanitisation;
- optional Cloudflare network segregation header;
- forwarded-header support for reverse proxies.

The strongest remaining production concerns are secret management, complete database migration/versioning for Supabase application tables, end-to-end staff-management UI completion, and stronger consistency/validation around multi-store operations.

---

## Useful Development Commands

### Backend

```bash
cd backend/src/Inflame-Backend

dotnet restore Inflame-Backend.slnx
dotnet build Inflame-Backend.slnx
dotnet run --project Inflame-Backend/Inflame-Backend.csproj
```

### Admin frontend

```bash
cd frontend/src/Admin-Website

npm ci
npm run lint
npm run build
npm run dev
```

### Public frontend

```bash
cd frontend/src/Public-Website

npm ci
npm run lint
npm run build
npm run dev
```

### Docker

From the repository root:

```bash
docker compose up --build
```

Stop:

```bash
docker compose down
```

---

## Project Documentation

The repository includes the original:

```text
docs/INSY7315 Task 1.pdf
```

That document provides the project's requirements, user roles, non-functional requirements, domain/design artefacts, architecture rationale, deployment plan, data-schema rationale, security discussion, testing plan and CI/CD plan.

This README is intended to describe the **implemented repository**, rather than replace the original academic/project documentation.
