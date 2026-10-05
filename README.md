# Braai-Platform Enterprise Ecosystem

The Braai-Platform is a scalable web application designed to manage products, customer enquiries, quotes, and custom braai and fireplace installations.

The system is split into a customer-facing website, an internal staff dashboard, and a backend API. This separation makes the different parts of the application easy to manage while allowing the backend to handle the main business logic, authentication, database access, and communication between services.

---

## 1. System Architecture

The platform consists of three main applications:

1. **Public Customer Web App**
   A Next.js application where customers can browse the product catalogue, search for products, and submit enquiries.

2. **Staff & Admin Dashboard**
   A secure Next.js application used by staff to manage products, customers, leads, and quotes.

3. **Enterprise Backend API**
   An ASP.NET Core REST API written in C#. The API handles business logic, authentication, database operations, and communication with external services.

### 1.1 Architecture Diagram

<img width="392" height="512" alt="Inflame Architecture diagram drawio" src="https://github.com/user-attachments/assets/140543b4-64e3-407a-939c-49b2f8522af0" />


---

# 2. Core Algorithms

Three algorithms power the catalogue and quoting features:

| Algorithm | Problem it solves |
| :-------- | :---------------- |
| Search Relevance Scoring | Shows the best-matching products first |
| Dimensional Quote Estimation | Gives staff a fast, consistent first estimate for custom builds |
| Multi-Criteria Filtering | Lets customers narrow the catalogue by brand, material, etc. |

---

## 2.1 Search Relevance Scoring

**Why:** A customer searching Built-in Braai should see built-in braais first, not an unrelated fireplace. Each product gets a score from 0 to 1, and results are sorted high to low.

```text
Score = (0.5 × Title Score) + (0.3 × Category Score) + (0.2 × Keyword Score)
```

| Part | What it measures |
| :--- | :--------------- |
| Title Score (weight 0.5) | Share of search words found in the product name (0–1) |
| Category Score (weight 0.3) | 1 if the product is in the expected category, otherwise 0 |
| Keyword Score (weight 0.2) | Average of `1 ÷ distance` across matched keywords (closer = higher) |

```text
Search term ──► Title / Category / Keyword scores ──► Weighted total ──► Sort ──► Results
```

**Example:** search Built-in Braai, expected category Braais

```text
Built-in Braai 1200 Stainless Steel
  Title    = 2/2 words                  = 1.00
  Category = match                      = 1.00
  Keyword  = avg(1/1, 1/2)              = 0.75
  Score    = 0.5×1.00 + 0.3×1.00 + 0.2×0.75 = 0.95

Outdoor Fireplace
  Title    = 0/2 words                  = 0.00
  Category = no match                   = 0.00
  Keyword  = avg(1/4, 0)                = 0.125
  Score    = 0 + 0 + 0.2×0.125          = 0.03
```

The braai ranks first (0.95 vs 0.03).

---

## 2.2 Dimensional Quote Estimation

**Why:** Custom installs vary in size, so bigger builds need more material and labour. This gives staff a consistent starting estimate; a person still confirms the final quote.

```text
Volume = Length × Width × Height
Quote  = (Volume × Material Factor × Base Cost) × (1 + Market Adjustment) + Labour
```

| Term | Meaning |
| :--- | :------ |
| Volume | Size of the build in m³ |
| Material Factor | Multiplier for material cost (1.0 = standard, higher = premium) |
| Base Cost | Material cost per m³ |
| Market Adjustment | Allowance for price swings (0.08 = +8%) |
| Labour | Fixed labour charge |

```text
Dimensions ──► Volume ──► × Material × Base Cost ──► × (1 + Market Adj.) ──► + Labour ──► Quote
```

**Example:** 2 m × 1 m × 1 m, Material Factor 1.2, Base Cost R4,500/m³, Market Adjustment 0.08, Labour R6,000

```text
Volume        = 2 × 1 × 1          = 2 m³
Material cost = 2 × 1.2 × 4,500    = R10,800
Market adj.   = 10,800 × 1.08      = R11,664
Add labour    = 11,664 + 6,000     = R17,664

Estimated Quote = R17,664
```


---

## 2.3 Multi-Criteria Product Filtering

**Why:** Customers narrow a large catalogue with several filters at once. A product must match all selected filters (AND logic) to appear.

```text
All products ──► Brand ──► Material ──► Heat Output ──► Filtered results
```

**Example:** Brand = Weber, Material = Stainless Steel, Heat Output = High

```text
Start (6 products)
  Brand = Weber           → 4 left
  Material = Stainless    → 3 left
  Heat Output = High      → 2 left (Weber Compact, Weber Elite)
```

In code, each selected filter adds one chained `.Where(...)` to the query (Builder pattern), and unselected filters are skipped. Redis caches popular filter results so the database isn't queried every time.

---

# 3. Software Architecture & Design Patterns

The backend uses several established design patterns to keep the code organised and separate different responsibilities.

| Pattern                     | Category      | Purpose                                                                                                                    |
| :-------------------------- | :------------ | :------------------------------------------------------------------------------------------------------------------------- |
| **CQRS**                    | Architectural | Used to separate read and write operations so they can be handled independently.                                           |
| **Repository**              | Architectural | Used to separates database access from the rest of the application through repositories such as `baseRepo`.                |
| **Mediator**                | Behavioral    | Uses `MediatR` to route requests to the appropriate handler without placing business logic inside controllers.             |
| **Command**                 | Behavioral    | Represents write operations as separate command objects.                                                                   |
| **Singleton**               | Creational    | Allows shared resources such as Redis connections to be reused instead of creating unnecessary connections.                |
| **Factory Method**          | Creational    | Creates the appropriate product type, such as `BraaiProduct` or `FireplaceProduct`, from DTO data.                         |
| **Builder**                 | Creational    | Builds dynamic product filtering queries using chainable LINQ operations.                                                  |
| **Adapter**                 | Structural    | Uses `IStorageAdapter` to keep the application independent from the specific storage implementation.                       |
| **Decorator**               | Structural    | Adds Redis caching around repository operations before data is requested from PostgreSQL.                                  |
| **Facade**                  | Structural    | `ProductCatalogueFacade` provides a simpler interface for more complex catalogue operations.                               |
| **Observer**                | Behavioral    | Allows events such as creating a `QuoteLead` to trigger additional actions such as notifications and logging.              |
| **State**                   | Behavioral    | Controls the different stages of a `QuoteLead`, such as `New → Under Review → Contacted → Converted`.                      |
| **Chain of Responsibility** | Behavioral    | Uses the ASP.NET Core middleware pipeline for authentication, JWT validation, rate limiting, and other request processing. |

These patterns help keep the backend modular and make it easier to change or extend individual parts of the system without affecting the entire application.

---

# 4. Development & Deployment

## 4.1 Local Development

Docker is used to run the different parts of the application together during development.

The complete environment can be started with:

```bash
docker-compose up --build -d
```

The local services are available at:

| Service      | Address                 |
| ------------ | ----------------------- |
| Public Web   | `http://localhost:3000` |
| Admin Portal | `http://localhost:3001` |
| Backend API  | `http://localhost:5282` |

Using Docker also helps keep the development environment consistent across different machines.

---

## 4.2 CI/CD Pipeline

GitHub Actions is used to automate testing and deployment.

### Continuous Integration

When a pull request is opened against `develop`, the pipeline runs checks such as:

<img width="122" height="182" alt="Untitled Diagram drawio" src="https://github.com/user-attachments/assets/c8111f4e-2500-466a-bc4b-3b574e5e10d4" />

The backend uses xUnit tests, while the Next.js applications are checked using:

```bash
npm run lint
```

This helps identify problems before changes are merged.

### Continuous Deployment

After changes are merged into `main`, the deployment process is triggered.

<img width="122" height="232" alt="Untitled Diagram drawio (1)" src="https://github.com/user-attachments/assets/05a3c598-0f57-42df-945e-02c2ea074a6b" />

This reduces the amount of manual work needed to deploy new versions of the application.

---

# 5. Database & Data Storage

The backend uses **Entity Framework Core Code-First** with a **PostgreSQL database hosted through Supabase**.

Database changes are managed using Entity Framework migrations.

To apply the latest migrations:

```bash
dotnet ef database update --project src/Inflame-Backend
```

Supabase is also used for object storage, which allows the application to store files such as:

* Product images
* Customer documents
* Quote-related files

Redis, through Upstash, is used separately for caching frequently accessed information.

---

# 6. Production Hosting

The production environment uses several services, with each service handling a specific part of the application.

### Cloudflare

Cloudflare sits in front of the applications and handles:

* DNS
* SSL/TLS
* Edge caching
* Traffic protection

This means requests pass through the Cloudflare layer before reaching the application servers.

### Vercel

The two Next.js applications are hosted on Vercel:

* Public Customer Website
* Staff & Admin Dashboard

Vercel provides global delivery for the frontend applications and handles the deployment of the Next.js projects.

### Render

The ASP.NET Core backend is deployed as a Docker container on Render.

### Uptime Robot

Uptime Robot is configured to send a request to the backend health-check endpoint every 14 minutes. This helps prevent the backend from becoming inactive when using Render's free tier.

The production setup can therefore be summarised as:

<img width="452" height="462" alt="Untitled Diagram drawio" src="https://github.com/user-attachments/assets/490205d4-a9ae-41e5-9974-11c677b70c68" />

---

# 7. Security

Security is handled at both the backend and frontend levels.

## 7.1 Backend Security

The ASP.NET Core API includes the following security measures:

### Identity & Role-Based Access Control

ASP.NET Core Identity is used together with role-based access control.

The main roles are:

<img width="122" height="202" alt="Untitled Diagram drawio" src="https://github.com/user-attachments/assets/dda40f53-ab9e-40b9-b4ce-06ca444b6fee" />


Each role can be given different permissions depending on what the user needs to access.

### Account Lockout

The login system uses a five-attempt lockout policy. After five unsuccessful login attempts, the account is locked for 15 minutes.

This helps reduce the risk of repeated brute-force login attempts.

### Input Sanitization

The custom `XssSanitizationFilter` checks incoming JSON values and removes potentially harmful script content before the data is processed.

### API Rate Limiting

Rate limiting is applied through ASP.NET Core middleware to control how frequently endpoints can be requested.

This helps prevent excessive requests from affecting the availability of the API.

### Data Protection

ASP.NET Core Data Protection is used to securely manage the cryptographic keys required by the application.

---

# 8. Frontend Security

The Next.js applications also include several security measures.

### XSS Protection

React automatically escapes values rendered in components. This helps prevent malicious scripts from being inserted through normal user input.

### HTTP Security Headers

Security headers are configured through `next.config.ts`.

The main headers include:

* `Strict-Transport-Security (HSTS)` – forces browsers to use HTTPS.
* `X-Frame-Options: SAMEORIGIN` – helps prevent clickjacking.
* `X-Content-Type-Options: nosniff` – prevents browsers from incorrectly interpreting file types.
* `X-XSS-Protection: 1; mode=block` – provides additional XSS protection for older browsers.

### API Proxying

The frontend can use Next.js proxy/rewrite rules to route API requests through the application's configured routes.

This keeps the frontend communication with the backend structured and avoids exposing unnecessary API details directly to the client.

---

# 9. Video Presentation

[Video Link](Placeholder)

---

# 10. AI Usage Declaration

Generative AI tools were used during the development of the Inflame platform as learning and productivity aid. AI assisted in generating boilerplate code such as the files needed for each repository, optimizing methods and debugging. The core architecture, business logic, service usage/integration, and design choices are entirely original to my group. The AI-assisted code which was used was thoroughly reviewed, modified, and tested to ensure that we understood what was being done and that it met the requirements of our project scope. 
