# Braai-Platform Enterprise Ecosystem

The Braai-Platform is a full-stack web application developed to support a braai and fireplace business. It brings product browsing, customer enquiries, quotation requests, and custom installation requirements into one system.

It consists of three main parts: a public website for customers, a administration dashboard for staff and a backend API. Each application has their specific responsibility. The backend connects the different parts and manages the core business rules, authentication, data access, and external services.

---

## 1. System Architecture

The system is divided into three main applications:

1. **Public Customer Web App**
   The customer-facing website is built with Next.js. Customers use the public web application to browse the product catalogue, search for products, view product information and submit enquiries or quotation requests.

2. **Staff & Admin Dashboard**
   The staff dashboard is a separate Next.js application with authenticated access. It was designed with the intention to be used strictly by staff within the business, it provides staff with tools for managing products, customers, leads and quotes.

3. **Enterprise Backend API**
   The backend is an ASP.NET Core REST API developed in C#. It acts as the central application layer and is responsible for all business logic, authentication, database operations and communication with supporting services.

### 1.1 Architecture Diagram

<img width="392" height="512" alt="Inflame Architecture diagram drawio" src="https://github.com/user-attachments/assets/140543b4-64e3-407a-939c-49b2f8522af0" />


---

# 2. Core Algorithms

Three algorithms are used to support important catalogue and quotation features within the platform:

| Algorithm | Problem it solves |
| :-------- | :---------------- |
| Search Relevance Scoring | This ranks products according to how closely they match a customer's search |
| Dimensional Quote Estimation | It produces an initial estimate for custom braai and fireplace builds |
| Multi-Criteria Filtering | This allows customers to narrow products using several catalogue filters |

---

## 2.1 Search Relevance Scoring

The search system gives each product a relevance score based on how closely it matches the customer's search. This helps customers find exactly what they are looking for, the relevant products will appear near the top of the results instead of relying only on a basic text match.

**Why:** A customer searching Built-in Braai should see built-in braais first, not an unrelated fireplace. Each product gets a score from 0 to 1, and results are sorted from high to low.

**The score is calculated using three factors:**
```text
Score = (0.5 × Title Score) + (0.3 × Category Score) + (0.2 × Keyword Score)
```

| Part | What it measures |
| :--- | :--------------- |
| Title Score (weight 0.5) | This measures how many of the search terms occur in the product name |
| Category Score (weight 0.3) | It gives a full match when the product belongs to the expected category |
| Keyword Score (weight 0.2) | It uses the distance between the search term and matching keywords, with closer matches receiving a higher value |

Each part produces a value between 0 and 1. The weighted values are then combined to output the final relevance score. Products with higher scores are placed before products with lower scores.

**Example:** For example a customer searches "Built-in Braai" the expected category output is Braais, consider these two products

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

The Built-in Braai 1200 Stainless Steel will receive a score of 0.95, compared with 0.03 for the Outdoor Fireplace. The higher score causes the braai to appear first in the search results.

---

## 2.2 Dimensional Quote Estimation

Custom installations can vary in size, material requirements, and labour. The quotation algorithm provides staff with a consistent starting estimate based on the dimensions and selected cost factors.

**Why:** Because custom installs differ in size the bigger builds need more material and labour. This gives staff a consistent starting estimate. Although a staff member will still confirm the final quote.

**The calculation begins by determining the approximate volume of the build:**
```text
Volume = Length × Width × Height

The estimated quotation is then calculated using the material cost, material factor, market adjustment, and labour charge:

Quote  = (Volume × Material Factor × Base Cost) × (1 + Market Adjustment) + Labour
```

| Term | Meaning |
| :--- | :------ |
| Volume | Approximate size of the build in m³ |
| Material Factor | Multiplier for material cost (1.0 = standard, higher = premium) |
| Base Cost | Material cost per m³ |
| Market Adjustment | Percentage allowance for changes in material prices |
| Labour | Labour cost included in the estimate |

The result is intended as an initial estimate rather than a final customer quotation. Staff can review the calculation and confirm the actual requirements before providing the final price.

**Example:** Let's say a custom build has these values:
2 m × 1 m × 1 m, Material Factor 1.2, Base Cost R4,500/m³, Market Adjustment 0.08, Labour R6,000

```text
Volume        = 2 × 1 × 1          = 2 m³
Material cost = 2 × 1.2 × 4,500    = R10,800
Market adj.   = 10,800 × 1.08      = R11,664
Add labour    = 11,664 + 6,000     = R17,664

Estimated Quote = R17,664
```


---

## 2.3 Multi-Criteria Product Filtering

The product catalogue has multiple filters which allows customers to narrow down a large number of products without having to search through the entire catalogue manually.

**Why:** A large catalogue is hard to scroll through. With filters in place a customer can look for something they specifically want, like a stainless steel Weber with high heat output and see only products that fit that criteria. A product has to match every selected filter to appear, so each extra filter makes the results more precise and shows the customer what they actually want.

The available criteria can include values such as:
- Brand
- Material
- Heat Output
- Product Type
- Price Range
- Other product-specific attributes

The filters use "AND logic" meaning a product must satisfy every filter selected by the customer to remain in the result set.

**Example:** Let's say a customer selects:
Brand = Weber, Material = Stainless Steel, Heat Output = High

**The filtering process progressively reduces the available products:**
```text
Start (6 products)
  Brand = Weber            4 left
  Material = Stainless     3 left
  Heat Output = High       2 left (Weber Compact, Weber Elite)
```
The final result will contain only the products that satisfy all three conditions.

In the backend, each selected filter adds one chained `.Where(...)` to the query. Filters that have not been selected are ignored. Redis is also used to cache commonly requested filter results, reducing the number of repeated database queries for frequently accessed catalogue data.

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
