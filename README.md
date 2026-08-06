# 🎓 Student Mentoring & Progress Tracking System

> A comprehensive, full-stack, AI-powered web platform designed for higher education institutions to monitor student academic progress, automate mentor-mentee allocation, detect early risk indicators, and power faculty interventions using Google Gemini AI.

---

## 🌟 Key Features & Highlights

### 🛡️ 1. HOD & Administrator Portal
* **Automated Mentee Allocation**: Smart algorithm to automatically assign unallocated students to department mentors based on mentor capacity.
* **Departmental Analytics**: Real-time stats on total mentors, total students, assigned vs. unassigned mentees, and overall department performance.
* **Faculty Management**: Add and manage department mentors with auto-generated default password policies.

### 👨‍🏫 2. Faculty Mentor Portal
* **Early Risk Identification**: Automated risk engine classifying students into **High**, **Medium**, or **Low** risk based on attendance (<60%) and CIE marks (<25/50).
* **Multi-Semester Academic Transcript**: View complete historical records across Semesters 1 to 5 (Attendance, CIE Marks, Assignments).
* **Mentoring Session Scheduler**: Schedule 1-on-1 counseling meetings with mentees, complete with calendar integration and automated notifications.
* **Mentoring Notes & Action Items**: Record meeting discussions and assign trackable action items with status updates (Pending / In Progress / Completed).
* **WhatsApp Report Generator**: Export structured academic summary reports directly to WhatsApp for parent/guardian communication.

### 🤖 3. Google Gemini AI Copilot
* **AI Academic Health Diagnostic**: Integrates with **Google Gemini 1.5 Flash** to generate real-time academic standing summaries.
* **Root Cause Analysis**: Identifies top 3 underlying causes for student performance drops.
* **Intervention Plan**: Generates actionable 4-step mentor intervention strategies and 14-day student action items.
* **Parent Communication Draft**: Creates professional, encouraging email drafts ready to send to parents.
* **Smart Fallback Engine**: Built-in fallback rule engine ensures seamless AI feature operation even without an external API key.

### 🎓 4. Student Portal
* **Personalized Academic Dashboard**: Real-time attendance percentage, CIE average score, assignment completion rate, and risk posture.
* **Meeting Requests**: Request 1-on-1 mentoring sessions directly with assigned department mentors.
* **Action Item Tracker**: Monitor and mark progress on action items assigned by faculty mentors.

### 🔐 5. Security & Authentication
* **Role-Based Access Control (RBAC)**: Enforced authorization for `ADMIN`, `MENTOR`, and `STUDENT` roles.
* **Show/Hide Password Toggle**: Interactive eye icon toggle on login and profile settings forms.
* **Self-Service Profile Management**: Students and Mentors can update their full name, phone number, and change passwords securely.

---

## 🛠️ Technology Stack

| Component | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, TailwindCSS, Lucide Icons, Recharts, Axios, React Router v6 |
| **Backend** | Node.js, Express.js, Mongoose, JWT (JSON Web Tokens), BcryptJS |
| **AI Integration** | Google Generative AI SDK (`@google/generative-ai` - Gemini 1.5 Flash) |
| **Database** | MongoDB Atlas (Production) / MongoMemoryServer (Fallback) |
| **Deployment** | Render.com (Full-stack unified service) / GitHub Actions |

---

## 🔑 Demo Login Credentials

You can test all three roles out of the box using these credentials:

| Role | Username / Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin (HOD)** | `admin@mentoring.edu` | `ADMIN@123` | Full Department Control |
| **Mentor** | `mentor1@mentoring.edu` | `mentor1@mentoring.edu` | Assigned Mentees & Scheduler |
| **Student** | `1MS22CS001` | `1MS22CS001` | Personal Dashboard & Meetings |

---

## 📁 Project Structure

```
student-mentoring-and-progress/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & fallback setup
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT protection & role authorization
│   ├── models/                   # Mongoose Schemas (User, Student, Mentor, Marks, etc.)
│   ├── routes/                   # API Endpoints (Auth, Admin, Mentor, Student, AI)
│   ├── seed/
│   │   └── seedData.js           # Automated database seeding engine
│   ├── services/
│   │   └── aiCopilotService.js   # Gemini AI Copilot & fallback engine
│   ├── utils/
│   │   └── riskEngine.js         # Automated academic risk calculation engine
│   ├── server.js                 # Express server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/           # UI Components (Header, Sidebar, Modals, Badges)
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global Authentication Context Provider
│   │   ├── pages/                # Pages (LoginPage, StudentDashboard, MentorDashboard, etc.)
│   │   ├── services/
│   │   │   └── api.js            # Axios API client & interceptors
│   │   ├── App.jsx               # React Router navigation setup
│   │   ├── main.jsx              # React application root
│   │   └── index.css             # Tailwind base styles & custom animations
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
├── package.json                  # Root deployment scripts
└── README.md
```

---

## ⚡ Quick Start (Local Setup)

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher
* **Git**

### Step-by-Step Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Adarsha231/student-mentoring-and-progress.git
   cd student-mentoring-and-progress
   ```

2. **Install Dependencies**:
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=inpulse_mentoring_jwt_secret_key_2026
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. **Seed Database**:
   ```bash
   npm run seed
   ```

5. **Start Application Locally**:
   * **Backend**:
     ```bash
     cd backend
     npm run dev
     ```
   * **Frontend** (in a new terminal):
     ```bash
     cd frontend
     npm run dev
     ```
   * Open `http://localhost:5173` in your browser.

---

## 🌐 Live Cloud Deployment (Render.com)
🚀 **Live Demo:** https://student-mentoring-and-progress.onrender.com

1. Push code to GitHub repository:
   ```bash
   git add .
   git commit -m "Deploy latest changes"
   git push origin main
   ```
2. Log in to **[Render.com](https://render.com)** and create a new **Web Service**.
3. Connect your GitHub repository `Adarsha231/student-mentoring-and-progress`.
4. Configure service settings:
   * **Build Command**: `npm run build`
   * **Start Command**: `npm start`
5. Add Environment Variables on Render:
   * `NODE_ENV` = `production`
   * `SERVE_FRONTEND` = `true`
   * `MONGODB_URI` = `your_mongodb_atlas_uri`
   * `JWT_SECRET` = `inpulse_mentoring_jwt_secret_key_2026`
   * `GEMINI_API_KEY` = `your_google_gemini_api_key`
6. Click **Deploy Web Service**. Render will automatically build, seed, and host your live application!

---

## 📄 License
This project is open-source and available under the **MIT License**.
