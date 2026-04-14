# CareerVista

CareerVista is an AI-powered career growth platform with a modern Next.js frontend and an Express/MongoDB backend.

It helps users improve resumes, get AI career guidance, generate career roadmaps, discover jobs, and manage profile progress in one place.

## Features

### User & Auth
- Register/login with JWT authentication
- Persistent session-based authenticated routes
- Profile management (skills, experience, education, links, bio)

### Resume Intelligence
- Upload resume files (`PDF`, `DOCX`, `DOC`, `TXT`, `MD`)
- AI resume analysis with section-wise scoring
- ATS compatibility feedback and actionable improvement tips
- Resume analysis history per user

### AI Career Assistant
- Context-aware AI chat for career advice
- Conversation history stored per user

### AI Career Roadmap
- Generate personalized roadmap from current role to target role
- Multi-phase roadmap with milestones, skills, and resources
- Estimated timeline and salary expectation guidance

### Jobs
- Browse job listings with filters and search
- Resume/profile-based matched jobs
- Save jobs and view saved list

### Admin
- Admin dashboard and user statistics
- View users
- Add jobs and seed sample jobs

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Radix UI + Lucide icons

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcrypt authentication
- Google Gemini API for AI features
- Multer + Mammoth + pdf-parse for resume upload/parsing

## Project Structure

```text
CareerVista/
├─ src/                    # Next.js frontend
├─ public/                 # Static assets
├─ server/                 # Express backend API
│  ├─ index.js
│  └─ package.json
├─ .env.example            # Frontend env template
├─ server/.env.example     # Backend env template
└─ DEPLOYMENT.md           # Deployment guide (Vercel + Render)
```

## Environment Variables

### Frontend (`.env.local`)

Copy `.env.example` to `.env.local` and set:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (`server/.env`)

Copy `server/.env.example` to `server/.env` and set:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret
GEMINI_API_KEY=your_gemini_api_key
```

## Local Development Setup

### 1) Install dependencies

From repository root:

```bash
npm install
```

From backend folder:

```bash
cd server
npm install
```

### 2) Run backend

```bash
cd server
npm run dev
```

Backend runs on `http://localhost:5000`.

### 3) Run frontend

In a new terminal at repository root:

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Available Scripts

### Root (Frontend)
- `npm run dev` – start Next.js dev server
- `npm run build` – production build
- `npm run start` – run production server
- `npm run lint` – run ESLint

### `server/` (Backend)
- `npm run dev` – start backend with nodemon
- `npm run start` – start backend with node

## API Overview

Base URL (local): `http://localhost:5000`

- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Profile: `/api/profile`
- Resume: `/api/resume/upload`, `/api/resume/analyze`, `/api/resume/history`
- Chat: `/api/chat`, `/api/chat/history`
- Roadmap: `/api/roadmap/generate`, `/api/roadmap`
- Jobs: `/api/jobs`, `/api/jobs/match`, `/api/jobs/:id/save`, `/api/jobs/saved`
- Admin: `/api/admin/stats`, `/api/admin/users`, `/api/jobs`, `/api/make-admin`, `/api/seed/jobs`
- Health: `/api/health`

## Deployment

- Frontend: Vercel
- Backend: Render

For exact production steps, see `DEPLOYMENT.md`.

## Screenshots

> Add image files to `public/screenshots/` using the filenames below.

### Home
![CareerVista Home](public/screenshots/home.png)

### Dashboard
![CareerVista Dashboard](public/screenshots/dashboard.png)

### Resume Analysis
![CareerVista Resume Analysis](public/screenshots/resume-analysis.png)

### AI Chat
![CareerVista AI Chat](public/screenshots/ai-chat.png)

### Career Roadmap
![CareerVista Career Roadmap](public/screenshots/roadmap.png)

### Jobs
![CareerVista Jobs](public/screenshots/jobs.png)

## Notes

- `node_modules` is intentionally ignored from Git.
- Keep `.env` files private; only commit `.env.example` templates.
- The frontend uses `NEXT_PUBLIC_API_URL` to call backend APIs.
