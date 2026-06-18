# Smart Student Hub

Smart Student Hub is a modern, responsive web application that empowers students to track their academic, co-curricular, and extracurricular activities, verify them with faculty reviewers, and dynamically generate professional, AI-powered portfolios.

---

## 🚀 Key Features

*   **Firebase Authentication:** Secure login using Google Sign-In with dynamic role assignment (Student or Faculty) on first-time registration.
*   **Student Dashboard:**
    *   Academic performance visualization (GPA tracking charts powered by Recharts).
    *   Activity Tracker to log extracurricular accomplishments (Courses, Internships, Seminars, Competitions, etc.) with description, dates, and proof URLs.
    *   One-click AI Portfolio generation using Gemini 2.5 Flash that synthesizes approved activities into structured resume sections.
    *   Export generated portfolios directly to PDF format using `html2pdf.js`.
*   **Faculty Dashboard:**
    *   Department-specific reviews (faculty members automatically see and verify submissions from students in their department).
    *   Interactive pending submission queues to approve or reject activities with detailed feedback.
*   **PostgreSQL with Neon & Drizzle:** Cloud-backed transactional database mapping all entities and relational connections.

---

## 🛠️ Tech Stack

*   **Frontend:** React 19, TailwindCSS 4, Vite 6, Lucide Icons, Recharts, React Markdown
*   **Backend:** Node.js, Express, `tsx` (TypeScript Execution with watch mode)
*   **Database & ORM:** PostgreSQL (Neon Serverless), Drizzle ORM, Drizzle Kit
*   **AI Integration:** `@google/genai` (Gemini 2.5 Flash API)
*   **Auth Services:** Firebase Auth & Firebase Admin SDK

---

## 💻 Local Setup & Installation

Follow these steps to run the project on your local machine:

### 1. Prerequisites
*   Node.js installed (v18 or higher recommended).
*   A **Neon Database** account (or any cloud PostgreSQL instance).
*   A **Firebase Project** with Google Sign-in enabled under Authentication.
*   A **Google AI Studio** account to generate a Gemini API key.

### 2. Install Dependencies
Clone the repository and install the project dependencies:
```bash
npm install
```

### 3. Environment Configurations
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://neondb_owner:<password>@<host>/neondb?sslmode=require"
GEMINI_API_KEY="your-gemini-api-key-from-ai-studio"
PORT=3000
```

### 4. Firebase Configuration
Update the [firebase-applet-config.json](file:///c:/Users/dhaka/OneDrive/Desktop/Smart%20Student%20Hub/firebase-applet-config.json) configuration file in the root directory with your Firebase Web App credentials:
```json
{
  "projectId": "your-project-id",
  "appId": "your-firebase-app-id",
  "apiKey": "your-firebase-api-key",
  "authDomain": "your-project.firebaseapp.com",
  "storageBucket": "your-project.firebasestorage.app",
  "messagingSenderId": "your-messaging-sender-id",
  "measurementId": "your-measurement-id"
}
```

### 5. Setup Database Schema
Sync the Drizzle schema definitions and generate the tables directly in your Neon database by running:
```bash
npx drizzle-kit push --config=src/db/drizzle.config.ts
```

### 6. Run the Application
Start the development server with live watch reloading enabled:
```bash
npm run dev
```

Your server will spin up and run on **[http://localhost:3000](http://localhost:3000)**. Any updates to your TypeScript files or configuration will automatically trigger hot-reloads.
