# EduCore

A full-stack learning management system (LMS) — educators create and sell video courses, students browse, purchase, track progress, discuss with classmates in real time, and earn certificates on completion.

Built as a MERN-stack project (MongoDB, Express, React, Node.js), with custom JWT/Passport authentication, Stripe payments, and Pusher-powered live discussions.

## Features

**Students**
- Browse and search courses, view ratings and previews
- Purchase via Stripe Checkout
- Track lecture-by-lecture progress
- Rate completed courses
- Live discussion thread per course (real-time via Pusher)
- Download a PDF certificate on 100% course completion
- Upload a custom profile picture (with a default fallback)

**Educators**
- Apply to become an educator from any account
- Create courses with a rich-text description editor (Quill), chapters, and YouTube-hosted lectures
- Dashboard: total enrollments, courses, earnings, completion rate, a 30-day enrollment trend chart, and a per-course earnings breakdown
- View and reply to each course's discussion thread
- View enrolled students per course

**Platform**
- Email notifications on enrollment and course completion (optional — degrades gracefully if not configured)
- Role-based access control (student / educator / admin) via custom JWT auth
- Idempotent Stripe webhook handling (safe against Stripe's at-least-once delivery and concurrent duplicate events)

## Tech stack

**Client** — React 19, Vite, Tailwind CSS v4, React Router, Axios, Recharts (dashboard charts), React-Quill (rich text), react-youtube, Pusher-js, react-toastify

**Server** — Node.js, Express 5, MongoDB (Mongoose), Passport (local + JWT strategies), bcryptjs, Stripe, Cloudinary (image uploads), Pusher (server SDK), Nodemailer, pdf-lib (certificate generation), express-rate-limit

## Architecture notes

A few decisions worth knowing if you're reading this as a portfolio piece:

- **Auth**: custom email/password auth with `passport-local` (login) and `passport-jwt` (protecting routes) — JWTs are stored client-side and sent as a Bearer token, mirroring the pattern used everywhere else in the app.
- **Payments**: Stripe Checkout Sessions, confirmed via webhook (not the client redirect) so enrollment can't be spoofed by skipping payment. The webhook handles both `checkout.session.completed` and `payment_intent.succeeded` as redundant/idempotent paths, using MongoDB's atomic `findOneAndUpdate` + `$addToSet` — a JS-level "read, check, then save" was tried first and turned out to have a real concurrency bug (Stripe fires both events near-simultaneously; Mongoose translates `.push()` into an unconditional `$push`, so two concurrent handlers could both append the same student). Worth reading `server/controllers/webhooks.js` if you want the full story.
- **Real-time discussions**: uses Pusher (a managed WebSocket service) rather than a self-hosted Socket.io server, specifically because the backend is deployed as a Vercel serverless function — which can't hold a persistent WebSocket connection. The client subscribes to Pusher directly; the server just authorizes and triggers broadcasts.
- **Certificates**: generated server-side per request (not pre-generated/stored) with `pdf-lib`, and completion is re-verified against the database every time — never trusted from client state.

## Project structure

```
EduCore/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Shared UI (Discussion, Skeletons, ErrorBoundary, ...)
│   │   ├── context/        # Global app state (auth, courses)
│   │   ├── pages/
│   │   │   ├── student/    # Home, CourseDetails, Player, MyEnrollments
│   │   │   ├── educator/   # Dashboard, AddCourse, MyCourses, Discussions
│   │   │   └── auth/       # Login, Register
│   │   ├── configs/        # Client-side Pusher setup
│   │   └── utils/          # Shared helpers (e.g. YouTube URL parsing)
│   └── vercel.json         # SPA rewrite rule for client-side routing
└── server/                 # Express backend
    ├── configs/            # mongodb, cloudinary, passport, pusher, email, multer
    ├── controllers/        # Route handlers, grouped by resource
    ├── middlewares/        # requireAuth, requireEducator
    ├── models/             # Mongoose schemas
    ├── routes/             # Express routers, one per resource
    └── vercel.json          # Serverless function config
```

## Environment variables

### Server (`server/.env`)

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | Yes | Database name |
| `JWT_SECRET` | Yes | Any long random string — generate with `openssl rand -hex 32` |
| `CLOUDINARY_NAME` | Yes | |
| `CLOUDINARY_API_KEY` | Yes | |
| `CLOUDINARY_SECRET_KEY` | Yes | |
| `STRIPE_SECRET_KEY` | Yes | |
| `STRIPE_WEBHOOK_SECRET` | Yes | From your Stripe webhook endpoint's signing secret |
| `CURRENCY` | Yes | e.g. `USD` |
| `PORT` | No | Defaults to `5000`, ignored on Vercel |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` | No | Enables enrollment/completion emails. Without these, emails are just skipped with a log line — nothing breaks. |
| `PUSHER_APP_ID` / `PUSHER_KEY` / `PUSHER_SECRET` / `PUSHER_CLUSTER` | No | Enables live discussion updates. Without these, messages still save and load — they just won't appear live for other viewers without a refresh. |

### Client (`client/.env`)

| Variable | Required | Notes |
|---|---|---|
| `VITE_BACKEND_URL` | Yes | Your deployed backend URL, no trailing slash |
| `VITE_CURRENCY` | Yes | e.g. `$` |
| `VITE_PUSHER_KEY` / `VITE_PUSHER_CLUSTER` | No | Must match the server's `PUSHER_KEY` / `PUSHER_CLUSTER` if enabled |

> Vite bakes `VITE_*` variables into the JS bundle at **build time**, not runtime — changing them requires a fresh deploy/rebuild, not just an env var update.

## Local development

```bash
# Backend
cd server
npm install
npm run dev          # nodemon, http://localhost:5000

# Frontend (separate terminal)
cd client
npm install
npm run dev           # Vite dev server, http://localhost:5173
```

For Stripe webhooks locally, use the Stripe CLI:
```bash
stripe listen --forward-to localhost:5000/stripe
```
This prints its own signing secret — use that for local `STRIPE_WEBHOOK_SECRET`, not the one from your Dashboard's webhook endpoint (they're different).

## Deployment (Vercel, two projects from one repo)

This is a monorepo — `client/` and `server/` deploy as **separate Vercel projects**, each with its own Root Directory setting, both connected to the same GitHub repo so `git push` auto-deploys both.

1. **Backend**: New Vercel project → Root Directory: `server` → add all server env vars above → deploy.
2. **Frontend**: New Vercel project → Root Directory: `client` → Vercel auto-detects Vite → add client env vars (pointing `VITE_BACKEND_URL` at the deployed backend) → deploy.
3. **Stripe webhook**: Stripe Dashboard → Developers → Webhooks → add endpoint `https://<your-backend>.vercel.app/stripe`, subscribed to `checkout.session.completed` and `payment_intent.succeeded` → copy the signing secret into `STRIPE_WEBHOOK_SECRET` → redeploy the backend.
4. Verify both projects show **Git: Connected** in Settings — future pushes to `main` redeploy whichever project's folder actually changed.

## Known limitations / next steps

- No automated tests yet (unit/integration coverage for the webhook idempotency logic and discussion access control would be the highest-value additions)
- Course catalog has no pagination — fine at small scale, would need it before this could handle a real course library
- No code-splitting yet — the bundle is a single ~1MB chunk; `React.lazy()` around the Dashboard (Recharts), AddCourse (Quill), and Player (react-youtube) pages would meaningfully cut initial load time
