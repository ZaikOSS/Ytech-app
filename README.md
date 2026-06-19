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

- **Frontend:** React, Tailwind CSS, Vite
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** JSON Web Tokens (JWT)
- **File Uploads:** Multer
- **AI Engine:** Google Gemini (`gemini-flash-latest`)
- **Payments:** Stripe API

## 🔒 Security Warning (API Keys)

> **CRITICAL:** Do NOT push your API keys to GitHub! 

The root directory contains a `.gitignore` file that is configured to block `.env` files. 
You must create a `backend/.env` file locally with the following secrets:

```env
PORT=3001
JWT_SECRET=super_secret_jwt_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
GEMINI_API_KEY=AIzaSy...
```
**Never commit this file!**

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Docker & Docker Compose](https://www.docker.com/) (For the database)
- [Stripe CLI](https://stripe.com/docs/stripe-cli) (For local webhook testing)

### 1. Clone the repository
```bash
git clone https://github.com/ZaikOSS/Ytech-app.git
cd Ytech-app
```

### 2. Database Setup (Docker)
We use Docker to instantly spin up the MySQL database and PHPMyAdmin.

```bash
# Start the database and PHPMyAdmin in the background
docker-compose up -d
```
*   The database runs on port `3306`.
*   PHPMyAdmin runs on port `8080`.
*   The database schema is automatically seeded from `backend/db/init.sql` on the first run.

### 3. Backend Setup
```bash
cd backend
npm install

# Start the backend server (runs on port 3001)
node server.js
```

### 4. Stripe Webhooks Setup
To test Stripe payments locally, you must forward webhooks to your local backend using the Stripe CLI. Open a new terminal window:
```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```
*Copy the Webhook Signing Secret (`whsec_...`) printed in your terminal and put it in your `backend/.env` file!*

### 5. Frontend Setup
Open a new terminal window:
```bash
cd client
npm install

# Start the Vite development server
npm run dev
```
The frontend will run on port `5173` (or `5174`).

## 📁 Project Structure

```
YTECH SOLUTIONS/
├── backend/                  # Node/Express API
│   ├── db/                   # Database scripts and init.sql
│   ├── uploads/              # Local file storage for chat attachments
│   └── server.js             # Main server logic and routes
├── client/                   # React Frontend
│   ├── src/
│   │   ├── components/       # Dashboards, Modals, Chat, and Landing Pages
│   │   ├── context/          # JWT Auth Context
│   │   └── App.jsx           # Routing and Protected Routes
├── docker-compose.yml        # MySQL + PHPMyAdmin Docker config
└── README.md
```

## 📝 License
This project is proprietary and created for YTECH Solutions.
