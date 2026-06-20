# YTECH Solutions Web App

A comprehensive full-stack web application designed to manage client projects, facilitate communication, handle invoicing, and streamline administrative workflows for a digital agency.

## 🌟 Features

### 🏢 For Clients
- **Client Dashboard:** Track the real-time lifecycle of your premium web packages.
- **Project Chat:** Communicate directly with your dedicated manager securely.
- **File Attachments:** Attach images and PDF documents directly in the chat.
- **Invoicing:** View digital receipts and transaction history via Stripe.

### 💼 For Managers
- **Manager Workspace:** View assigned projects and update project lifecycle phases.
- **Direct Communication:** Chat with clients directly and manage project requirements.

### 🛡️ For Administrators
- **System Overview:** View total active clients, unassigned projects, and available managers.
- **Project Dispatch:** Assign available managers to incoming client projects.
- **Manager Accounts:** Full CRUD interface to add, edit, and safely delete manager accounts.
- **Contact Inquiries:** Read, review, and manage public contact form submissions.

### 🤖 AI Integration & Payments
- **Gemini AI Sales Bot:** A public-facing AI Assistant built with `@google/generative-ai` to answer visitor questions on the landing page about pricing and services.
- **Stripe Payments:** Integrated secure checkout flow with Stripe Webhooks to automatically advance projects to the "Requirements Gathering" phase upon successful payment.

## 🛠️ Technology Stack

- **Frontend:** React, Tailwind CSS, Vite, Nginx (Dockerized)
- **Backend:** Node.js, Express.js (Dockerized)
- **Database:** MySQL (Dockerized)
- **Authentication:** JSON Web Tokens (JWT)
- **File Uploads:** Multer
- **AI Engine:** Google Gemini (`gemini-flash-latest`)
- **Payments:** Stripe API (Webhook handled by Stripe CLI Container)

## 🔒 Security Warning (API Keys)

> **CRITICAL:** Do NOT push your API keys to GitHub! 

You must create a `backend/.env` file locally with the following secrets. The `.gitignore` prevents it from being pushed.

```env
PORT=3001
JWT_SECRET=super_secret_jwt_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
GEMINI_API_KEY=AIzaSy...
DB_HOST=db
```
**Never commit this file!**

## 🚀 Getting Started (Fully Dockerized)

This app is fully containerized. With one command, you can run the Frontend, Backend, Database, and Stripe Webhook listener.

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/)

### 1. Clone the repository
```bash
git clone https://github.com/ZaikOSS/Ytech-app.git
cd Ytech-app
```

### 2. Setup your `.env`
Create `backend/.env` and fill in your Stripe and Gemini keys as shown in the Security Warning above.

### 3. Build & Run
Run the entire stack in the background:
```bash
docker-compose up -d --build
```

### 4. Access the Application
- **Frontend App:** http://localhost (Running on standard port 80)
- **Database Admin (phpMyAdmin):** http://localhost:8080
- **Backend API:** internally handles requests via the Nginx proxy
- **Stripe Webhooks:** A `stripe-cli` container automatically runs in the background and forwards webhooks to the backend securely.

> **Local Development Tip:** If you want to make live changes to the React code with hot-reloading, you can still run `cd client && npm run dev`. The Vite server will proxy requests to the Docker backend automatically!

## 📁 Project Structure

```
YTECH SOLUTIONS/
├── backend/                  # Node/Express API (Dockerfile included)
│   ├── db/                   # Database scripts and init.sql
│   ├── routes/               # Modular Express API Routes
│   ├── uploads/              # Local file storage for chat attachments
│   └── server.js             # Main server logic
├── client/                   # React Frontend (Dockerfile & nginx.conf included)
│   ├── src/
│   │   ├── components/       # Dashboards, Modals, Chat, and Landing Pages
│   │   ├── context/          # JWT Auth Context
│   │   └── App.jsx           # Routing and Protected Routes
├── docker-compose.yml        # Orchestrates Frontend, Backend, DB, phpMyAdmin, and Stripe CLI
└── README.md
```

## 📝 License
This project is proprietary and created for YTECH Solutions.
