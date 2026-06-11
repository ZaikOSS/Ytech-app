# YTECH Solutions Web App

A comprehensive full-stack web application designed to manage client projects, facilitate communication, handle invoicing, and streamline administrative workflows for a digital agency.

## 🌟 Features

### 🏢 For Clients
- **Client Dashboard:** Track the real-time lifecycle of your premium web packages.
- **Project Chat:** Communicate directly with your dedicated manager securely.
- **File Attachments:** Attach images and PDF documents directly in the chat.
- **Invoicing:** View digital receipts and transaction history.

### 💼 For Managers
- **Manager Workspace:** View assigned projects and update project lifecycle phases.
- **Direct Communication:** Chat with clients directly and manage project requirements.

### 🛡️ For Administrators
- **System Overview:** View total active clients, unassigned projects, and available managers.
- **Project Dispatch:** Assign available managers to incoming client projects.
- **Manager Accounts:** Full CRUD interface to add, edit, and safely delete manager accounts.
- **Contact Inquiries:** Read, review, and manage public contact form submissions.

## 🛠️ Technology Stack

- **Frontend:** React, Tailwind CSS, Vite
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** JSON Web Tokens (JWT)
- **File Uploads:** Multer

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MySQL](https://www.mysql.com/)

### 1. Clone the repository
```bash
git clone https://github.com/ZaikOSS/Ytech-app.git
cd Ytech-app
```

### 2. Database Setup
1. Create a MySQL database named `YT_solutions`.
2. Run the SQL script located in `backend/db/init.sql` to generate the schema.
3. Default credentials expected by the backend are `root` for username and `rootpassword` for the password. Update the `mysql.createPool` block in `backend/server.js` if yours differ.

### 3. Backend Setup
```bash
cd backend
npm install

# Start the backend server (runs on port 3001)
node server.js
```
*Note: Make sure to run `node migrate_messages_attachment.js` if you need to apply the latest database schema updates for file attachments.*

### 4. Frontend Setup
```bash
cd client
npm install

# Start the Vite development server (runs on port 5173)
npm run dev
```

## 🔒 Default Accounts
Upon registering a new client account, you can access the portal. To test different roles, manually update a user's role in the `Users` table to `ADMIN` or `MANAGER`.

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
└── README.md
```

## 📝 License
This project is proprietary and created for YTECH Solutions.
