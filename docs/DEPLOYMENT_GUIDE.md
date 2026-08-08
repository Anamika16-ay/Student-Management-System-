# Deployment Guide

## Local Development (fastest path)

### Prerequisites
- Node.js 20+
- MongoDB running locally, OR a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### 1. Backend
```bash
cd backend
cp .env.example .env
# edit .env -> set MONGODB_URI (local or Atlas connection string)
npm install
npm run dev          # nodemon, auto-restarts on changes -> http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev           # -> http://localhost:5173 (proxies /api to :5000 automatically)
```

Open http://localhost:5173 in your browser.

---

## Option A — Docker Compose (one command, MongoDB included)

```bash
docker compose up --build
```

This starts:
- `mongodb` on port 27017
- `backend` (Express API) on port 5000
- `frontend` (built React app served by nginx) on port 5173

Stop with `docker compose down` (add `-v` to also wipe the MongoDB volume).

---

## Option B — Deploy to the Cloud (free-tier friendly combo)

A common free/cheap combo for a MERN portfolio project:

| Component | Suggested Host |
|---|---|
| MongoDB | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free M0 cluster |
| Backend (Express) | [Render](https://render.com/) free web service, or Railway |
| Frontend (React build) | [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/) |

### Backend on Render
1. Push this repo to GitHub.
2. Render → New → Web Service → connect the repo, root directory `backend`.
3. Build command: `npm install`. Start command: `node server.js`.
4. Add environment variables from `.env.example` (use your Atlas `MONGODB_URI`, set `CORS_ALLOW_ORIGIN` to your deployed frontend URL).
5. Deploy — Render gives you a URL like `https://student-api.onrender.com`.

### Frontend on Vercel
1. Vercel → New Project → import the repo, root directory `frontend`.
2. Framework preset: **Vite**.
3. Add environment variable `VITE_API_BASE_URL=https://student-api.onrender.com/api`.
4. Deploy.

### MongoDB Atlas
1. Create a free cluster (M0).
2. Database Access → create a user with a strong password.
3. Network Access → allow access from `0.0.0.0/0` (or your hosting provider's IP range) for the demo, or set up VPC peering for production.
4. Copy the connection string into your backend's `MONGODB_URI`.

---

## Running Tests

```bash
cd backend
npm test
```

Uses `mongodb-memory-server` — no real database connection needed for tests, so this also works in CI (GitHub Actions, etc.) with zero extra setup.

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use a real MongoDB Atlas connection string, not local Mongo
- [ ] Set `CORS_ALLOW_ORIGIN` to your exact frontend domain (not `*`)
- [ ] Put a process manager in front of `node server.js` if not using Docker/Render (e.g. `pm2 start server.js`)
- [ ] Swap local disk storage (`multer.diskStorage`) for S3/Cloudinary if deploying to an ephemeral filesystem (Render/Heroku wipe local disk on redeploy)
- [ ] Rotate/secure your MongoDB credentials; never commit `.env`
