# YTECH Solutions Web App - UML & Architecture Analysis

This document provides a comprehensive architectural and UML analysis of the YTECH Solutions application.

## 1. System Architecture (Component Diagram)

This diagram illustrates the high-level Dockerized architecture and how the frontend, backend, database, and external services interact.

```mermaid
graph TD
    subgraph Docker Compose
        Nginx[Nginx Proxy\nFrontend Container\nPort 80]
        Backend[Node.js Express\nBackend Container\nPort 3001]
        DB[(MySQL Database\nDB Container\nPort 3306)]
        StripeCLI[Stripe CLI\nContainer]
    end

    ClientBrowser([Client Browser])
    StripeAPI([Stripe Payment Gateway])
    GeminiAPI([Google Gemini AI])

    %% Client Interactions
    ClientBrowser <-->|HTTP/HTTPS Request| Nginx
    
    %% Internal Routing
    Nginx -->|/api/*| Backend
    Nginx -->|Static Assets| Nginx
    
    %% Backend Interactions
    Backend <-->|SQL Queries| DB
    Backend <-->|Checkout/Verification| StripeAPI
    Backend <-->|AI Prompts| GeminiAPI
    
    %% Stripe Webhooks
    StripeAPI -->|Webhook Events| StripeCLI
    StripeCLI -->|Forward to /api/stripe/webhook| Backend
```

---

## 2. Entity-Relationship (ER) Diagram

This diagram maps out the structure and relationships of the MySQL database.

```mermaid
erDiagram
    Users {
        INT id
        VARCHAR username
        VARCHAR password
        ENUM role
        VARCHAR full_name
        TIMESTAMP created_at
    }
    
    Projects {
        INT id
        INT client_id
        INT manager_id
        ENUM status
        INT current_phase
        TIMESTAMP created_at
    }
    
    Invoices {
        INT id
        INT project_id
        VARCHAR invoice_number
        DECIMAL amount
        ENUM status
        TIMESTAMP created_at
    }
    
    Transactions {
        INT id
        INT invoice_id
        VARCHAR cardholder_name
        VARCHAR card_details_string
        VARCHAR zipcode
        VARCHAR company_name
        VARCHAR email
        ENUM status
        TIMESTAMP created_at
    }
    
    Messages {
        INT id
        INT project_id
        INT sender_id
        TEXT message_text
        VARCHAR file_url
        VARCHAR file_name
        TIMESTAMP created_at
    }
    
    ContactInquiries {
        INT id
        VARCHAR name
        VARCHAR email
        TEXT message
        ENUM status
        TIMESTAMP created_at
    }

    Users ||--o{ Projects : "client_id"
    Users ||--o{ Projects : "manager_id"
    Projects ||--o{ Invoices : "project_id"
    Invoices ||--o{ Transactions : "invoice_id"
    Projects ||--o{ Messages : "project_id"
    Users ||--o{ Messages : "sender_id"
```

### ER Table Details

| Table | Column | Type | Constraint |
|-------|--------|------|-----------|
| **Users** | id | INT | PRIMARY KEY, AUTO_INCREMENT |
| | username | VARCHAR(255) | UNIQUE, NOT NULL |
| | password | VARCHAR(255) | NOT NULL |
| | role | ENUM | CLIENT, MANAGER, ADMIN |
| | full_name | VARCHAR(255) | |
| | created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| **Projects** | id | INT | PRIMARY KEY, AUTO_INCREMENT |
| | client_id | INT | FOREIGN KEY → Users(id) |
| | manager_id | INT | FOREIGN KEY → Users(id), NULLABLE |
| | status | ENUM | PENDING, PAID, IN_PROGRESS, COMPLETED |
| | current_phase | INT | DEFAULT 0 |
| | created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| **Invoices** | id | INT | PRIMARY KEY, AUTO_INCREMENT |
| | project_id | INT | FOREIGN KEY → Projects(id) |
| | invoice_number | VARCHAR(255) | UNIQUE, NOT NULL |
| | amount | DECIMAL(10,2) | NOT NULL |
| | status | ENUM | UNPAID, PAID |
| | created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| **Transactions** | id | INT | PRIMARY KEY, AUTO_INCREMENT |
| | invoice_id | INT | FOREIGN KEY → Invoices(id) |
| | cardholder_name | VARCHAR(255) | |
| | card_details_string | VARCHAR(255) | |
| | zipcode | VARCHAR(20) | |
| | company_name | VARCHAR(255) | |
| | email | VARCHAR(255) | |
| | status | ENUM | SUCCESS, FAILED |
| | created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| **Messages** | id | INT | PRIMARY KEY, AUTO_INCREMENT |
| | project_id | INT | FOREIGN KEY → Projects(id) |
| | sender_id | INT | FOREIGN KEY → Users(id) |
| | message_text | TEXT | NOT NULL |
| | file_url | VARCHAR(255) | NULLABLE |
| | file_name | VARCHAR(255) | NULLABLE |
| | created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| **ContactInquiries** | id | INT | PRIMARY KEY, AUTO_INCREMENT |
| | name | VARCHAR(255) | NOT NULL |
| | email | VARCHAR(255) | NOT NULL |
| | message | TEXT | NOT NULL |
| | status | ENUM | UNREAD, READ |
| | created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

## 3. Checkout & Payment Flow (Sequence Diagram)

This diagram shows step-by-step what happens when a visitor buys a web package on the landing page.

```mermaid
sequenceDiagram
    actor Visitor
    participant React as React Frontend
    participant API as Node.js Backend
    participant DB as MySQL
    participant Stripe as Stripe API

    Note over Visitor,Stripe: Step 1 - Visitor chooses a package and fills in payment form

    Visitor->>React: Clicks "Order Showcase" button
    React->>React: Opens CheckoutModal with card form

    Note over Visitor,Stripe: Step 2 - Frontend sends payment data to backend

    Visitor->>React: Fills card info and clicks Pay
    React->>API: POST /api/public/checkout

    Note over Visitor,Stripe: Step 3 - Backend processes the payment with Stripe

    API->>Stripe: Create PaymentIntent with card details
    Stripe->>API: Returns payment result

    Note over Visitor,Stripe: Step 4a - If payment FAILS

    API->>React: Returns error message
    React->>Visitor: Shows "Payment failed" alert

    Note over Visitor,Stripe: Step 4b - If payment SUCCEEDS

    API->>DB: INSERT new User (or find existing)
    API->>DB: INSERT new Project (status PAID, phase 1)
    API->>DB: INSERT new Invoice (status PAID)
    API->>DB: INSERT new Transaction record
    API->>React: Returns JWT token + user data
    React->>Visitor: Redirects to Client Dashboard

    Note over Visitor,Stripe: Step 5 - Stripe sends webhook confirmation (async)

    Stripe->>API: POST /api/stripe/webhook (via Stripe CLI container)
    API->>DB: Confirms payment status in database
```

---

## 4. Admin Dispatch Flow (Activity Diagram)

This diagram models the process of an Administrator assigning a new Client project to a Manager.

```mermaid
stateDiagram-v2
    [*] --> ClientPays: Client successfully checks out
    ClientPays --> ProjectCreated: Project state = PAID, Manager = NULL
    
    state Admin_Portal {
        ProjectCreated --> AdminReviews: Admin logs in
        AdminReviews --> SelectsManager: Admin views Unassigned Projects
        SelectsManager --> AssignManager: Admin selects Manager from dropdown
    }
    
    AssignManager --> DatabaseUpdate: API call to /api/admin/projects/:id/assign
    DatabaseUpdate --> ManagerAssigned: Project manager_id = updated
    ManagerAssigned --> [*]: Manager logs in to see new project
```

---

## 5. Use Case Diagram

This diagram shows the different actions each user role can perform in the system.

```mermaid
graph LR
    subgraph Actors
        V([Visitor])
        C([Client])
        M([Manager])
        A([Admin])
    end

    subgraph "Public Actions"
        UC1[View Landing Page]
        UC2[Chat with AI Bot]
        UC3[Submit Contact Form]
        UC4[Purchase Web Package]
        UC5[Login / Signup]
    end

    subgraph "Client Actions"
        UC6[View Project Progress]
        UC7[Chat with Manager]
        UC8[Send File Attachments]
        UC9[View Invoices]
        UC10[Submit Questionnaire]
    end

    subgraph "Manager Actions"
        UC11[View Assigned Projects]
        UC12[Update Project Phase]
        UC13[Chat with Client]
        UC14[Upload Design Files]
    end

    subgraph "Admin Actions"
        UC15[View All Projects]
        UC16[Assign Manager to Project]
        UC17[Create/Edit/Delete Managers]
        UC18[Read Contact Inquiries]
    end

    V --> UC1
    V --> UC2
    V --> UC3
    V --> UC4
    V --> UC5

    C --> UC6
    C --> UC7
    C --> UC8
    C --> UC9
    C --> UC10

    M --> UC11
    M --> UC12
    M --> UC13
    M --> UC14

    A --> UC15
    A --> UC16
    A --> UC17
    A --> UC18
```
