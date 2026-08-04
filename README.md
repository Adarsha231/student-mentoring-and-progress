# Inpulse — Student Mentoring & Progress Tracking System

> **Production-Ready Full-Stack Mentoring Platform** designed to complement existing College ERP (Inpulse) systems.
> Provides faculty mentors with automated student risk detection, session scheduling, structured meeting notes, action item tracking, and real-time student progress analytics.

---

## 🌟 Key Features

- **Automated Risk Engine**:
  - **Low Risk**: Attendance $> 75\%$ AND Average CIE $> 70$
  - **Medium Risk**: Attendance $60-75\%$ OR Average CIE $40-70$
  - **High Risk**: Attendance $< 60\%$ OR Average CIE $< 40$
  - **Assignment Modifier**: Assignment completion $< 50\%$ automatically escalates risk tier by $+1$.
- **Automated Alert Generation**:
  - Instant alerts on Attendance drops, CIE marks decline, assignment defaults, or High Risk escalation.
- **Mentor Session Scheduler**:
  - Offline (Cabin), Google Meet, or Microsoft Teams meeting link generator with automated student notification.
- **Mentor Notes & Action Items**:
  - Record discussion, identified problems, recommendations, due dates, and interactive checklist items.
- **Role-Based Access Control**:
  - **Admin**: User creation & Mentor-Mentee mapping matrix (Read-only for academic data).
  - **Mentor**: Risk monitoring, student profile deep dive, scheduling, notes, and progress tracking.
  - **Student**: Read-only ERP performance view (Attendance, CIE, Assignments), upcoming sessions, mentor feedback, action checklist, and session request.
- **Instant Demo Switcher**:
  - Top bar pill allows switching between **Admin**, **Mentor**, and **Student** personas with zero setup!

---

## 🚀 Technology Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS (Dark Mode Design System inspired by Notion, Linear & Vercel)
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **State & Data Fetching**: Axios & TanStack React Query v5
- **Routing**: React Router v6

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB & Mongoose ODM (includes `mongodb-memory-server` fallback for zero-dependency standalone running!)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs password hashing

---

## ⚙️ Quick Start & Installation Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 3. Run Initial Seed Data (10 Mentors, 100 Students)
```bash
cd ../backend
npm run seed
```

### 4. Start the Application
- **Start Backend API (Port 5000)**:
  ```bash
  cd backend
  npm start
  ```
- **Start Frontend Dev Server (Port 3000)**:
  ```bash
  cd frontend
  npm run dev
  ```

Access the application in your browser at `http://localhost:3000`.

---

## 🔑 Demo Account Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@inpulse-mentoring.edu` | `AdminPassword123!` |
| **Mentor** | `mentor1@inpulse-mentoring.edu` | `MentorPassword123!` |
| **Student** | `student1@inpulse-mentoring.edu` | `StudentPassword123!` |

*(You can also click **"Switch Role Demo"** at the top right of the application header to switch personas instantly!)*

---

## 📁 Project Architecture

```
hackthon/
├── backend/
│   ├── config/          # Database connection & MongoMemoryServer fallback
│   ├── middleware/      # JWT Authentication & Authorization middleware
│   ├── models/          # Mongoose schemas (User, Student, Mentor, Attendance, Marks, etc.)
│   ├── routes/          # Express REST API endpoints (Auth, Admin, Mentor, Student, Meetings, Notes, Analytics)
│   ├── seed/            # Robust seed script for 10 Mentors, 100 Students & Academic Data
│   ├── utils/           # Risk calculation engine & Alert generator
│   └── server.js        # Express API Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components (RiskBadge, StatCard, Sidebar, Header, Modals)
│   │   ├── context/     # AuthContext & role switching
│   │   ├── pages/       # AdminDashboard, MentorDashboard, StudentProfilePage, StudentDashboard, etc.
│   │   ├── services/    # Axios API client methods
│   │   └── App.jsx      # React Router definition
│   ├── index.html
│   └── vite.config.js
└── README.md
```

---

## 📊 Deployment Guide

### Production Build
1. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```
2. **Environment Variables (`backend/.env`)**:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/inpulse_mentoring
   JWT_SECRET=your_production_jwt_secret_key_2026
   NODE_ENV=production
   ```
3. **Deploy Backend**:
   Deploy the `backend` directory to Vercel, Render, Railway, or AWS Elastic Beanstalk.
