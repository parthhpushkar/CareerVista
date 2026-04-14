# CareerVista Deployment Guide

This project has two deployable apps:

- **Frontend**: Next.js app in the repository root
- **Backend**: Express API in `server/`

## 1) Deploy Backend (Render)

1. Push this repo to GitHub.
2. In Render, create a **Web Service** from the repo.
3. Use these settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables from `server/.env.example`:
   - `PORT=5000`
   - `MONGODB_URI=...`
   - `JWT_SECRET=...`
   - `GEMINI_API_KEY=...`
5. Deploy and verify health:
   - `https://<your-backend-domain>/api/health`

## 2) Deploy Frontend (Vercel)

1. In Vercel, import the same GitHub repo.
2. Keep project root as repository root (not `server`).
3. Framework preset should be auto-detected as **Next.js**.
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL=https://<your-backend-domain>`
5. Deploy.

## 3) Post-Deploy Validation

1. Open frontend URL.
2. Register/login.
3. Test API-backed features:
   - Resume upload + analysis
   - Chat
   - Roadmap generation
   - Jobs endpoints

## 4) Required Local Files

- Frontend env template: `.env.example`
- Backend env template: `server/.env.example`

## Notes

- If frontend calls fail in production, confirm `NEXT_PUBLIC_API_URL` has no trailing slash mismatch and points to the live backend URL.
- Current backend CORS is open (`app.use(cors())`), so frontend and backend can run on different domains.
