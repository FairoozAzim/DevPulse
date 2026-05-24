# Issue Management and Feature Tracker

## Live URL
🚀 Production Server: https://dev-pulse-seven-brown.vercel.app

---

# Project Overview

This is a scalable and structured REST API built with Express.js and TypeScript. The project follows a modular architecture with centralized error handling, validation, authentication, and database integration. It is designed to keep track of created issue, feature request from authorized users and a role-based access control (RBAC).

---

# Features

- RESTful API architecture
- User authentication & authorization
- JWT-based secure login system
- Centralized error handling
- Request validation
- Modular folder structure
- PostgreSQL database integration
- Environment variable configuration
- Async error handling middleware
- CRUD operations
- Secure password hashing with JWT Token
- Role-based access control

---

# Tech Stack

## Backend
- Node.js
- Express.js
- TypeScript


## Database
- PostgreSQL

## Authentication
- JWT (JSON Web Token)
- bcrypt

## Validation & Utilities
- dotenv
- cors


---

# Project Structure

```bash
src/
│
├── config/
├── db/
├── modules - route -> controller -> service
├── middleware
├── types
├── utils
├── app.ts
└── server.ts
```

---

# Setup Instructions

## 1. Clone the Repository

```bash
git clone https://github.com/FairoozAzim/DevPulse.git
```

## 2. Navigate to Project Folder

```bash
cd project-name
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
CONNECTION_STRING = your_database_connection_string
JWT_SECRET=your_secret_key

```

## 5. Run the Development Server

```bash
npm run dev
```

Server will start at:

```bash
http://localhost:5000
```

---

# API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/issues` | Create an Issue(Only accessible to authorized users) |
| GET | `/api/issues` | Get all issues (Public Access)|
| GET | `/api/issues/:id` | Get a single issue (Public Access) |
| PATCH | `/api/issues/:id` | Update an Issue (Authorized Role-based Access) |
| DELETE | `/api/issues/:id` | Delete an Issue (Authorized Role-based Access) |


---

# Database Schema Summary

## User Schema

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique user identifier |
| name | String | User full name |
| email | String | Unique email |
| password | String | Hashed password |
| role | String | User role |
| createdAt | Date | Account creation date |
| updatedAt | Date | Account update date |

## Issue Schema

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique user identifier |
| title | String | Issue Title |
| description | String | Detailed explanation of the problem or suggestion |
| type | String | Type of the problem. Must be either 'bug' or 'feature_request'|
| status | String | Workflow status. Must be either 'open', 'in-progress', 'resolved' |
| reporter_id | Number | ID of the user who submitted the issue. |
| createdAt | Date | Issue creation date |
| updatedAt | Date | Issue update date |


---

# Error Handling

The project uses centralized error-handling middleware to:
- Catch synchronous and asynchronous errors
- Return consistent API responses
- Handle validation, authentication, and database errors properly


