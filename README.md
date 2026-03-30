# DocsBook — Frontend

A doctor appointment booking platform built with Next.js, TypeScript, and Tailwind CSS.

**Live:** [https://docbook-client-zeta.vercel.app](https://docbook-client-zeta.vercel.app)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios (with interceptors)
- **Forms:** Formik + Yup validation
- **State Management:** React Context (Auth)
- **Deployment:** Vercel

## Features

- User signup and login with JWT-based auth
- Persistent login state via localStorage
- Doctor search with speciality dropdown and location filter
- Paginated search results
- Doctor profile page with full details
- 6-day date tab navigation for slot availability
- Real-time slot status (available / booked)
- Slot booking with patient notes
- My Bookings page with cancellation
- Redirect back to doctor page after login
- Fully responsive design

## Project Structure

```
client/
├── app/
│   ├── layout.tsx              # Root layout — wraps app with AuthProvider
│   ├── page.tsx                # Landing page — 4 service cards (1 active)
│   ├── globals.css             # Tailwind imports
│   ├── auth/
│   │   ├── login/page.tsx      # Login page with Formik + redirect support
│   │   └── signup/page.tsx     # Signup page with Formik + Yup validation
│   ├── search/page.tsx         # Doctor search with filters + pagination
│   ├── doctor/
│   │   └── [id]/page.tsx       # Doctor profile + date tabs + slot booking
│   └── bookings/page.tsx       # My bookings + cancellation
├── components/
│   └── Navbar.tsx              # Navigation — auth-aware (login/logout states)
├── lib/
│   ├── api.ts                  # Axios instance with request/response interceptors
│   └── AuthContext.tsx          # React Context for global auth state
└── .env.local                  # Environment variables (not committed)
```

## Pages

### Landing Page (`/`)
Four service cards — "Find Doctors Near You" is active, the other three (Video Consultation, Lab Tests, Surgeries) show "Coming Soon".

### Search (`/search`)
Speciality dropdown populated from the API. Location text input with case-insensitive partial matching. Results show doctor cards with name, speciality, rating, experience, and patient count. Paginated with Previous/Next controls.

### Doctor Profile (`/doctor/[id]`)
Full doctor information — description, experience, total patients, rating, location, contact. Six date tabs (today + next 5 days). Slot grid showing available (green) and booked (red) slots with time ranges. Booking section with patient notes textarea. Auto-redirects to login if not authenticated, returns to the same page after login.

### My Bookings (`/bookings`)
Lists all booked appointments with doctor details and patient notes. Cancel button with confirmation dialog. Protected route — redirects to login if not authenticated.

## Key Architecture Decisions

### Axios Interceptors (`lib/api.ts`)
- **Request interceptor:** Automatically attaches JWT token from localStorage to every request. No manual header management in individual pages.
- **Response interceptor:** Unwraps `response.data` so components get clean data. Catches 401 errors globally — clears token and redirects to login if token is expired.

### Auth Context (`lib/AuthContext.tsx`)
- React Context provides `user`, `loginUser()`, and `logoutUser()` to any component via `useAuth()` hook.
- Checks localStorage on app load to persist login across page refreshes.
- Eliminates prop drilling — Navbar, booking page, and bookings page all access auth state directly.

### Formik + Yup (`auth/signup`, `auth/login`)
- Formik handles form state, change events, blur events, and submission.
- Yup defines validation schema declaratively — validates before submission.
- Touched state tracking ensures errors only show after user interacts with a field.

## Setup

### Prerequisites
- Node.js 18+
- Backend API running (see [docbook-server](https://github.com/mayankek01/docbook-server))

### Installation

```bash
git clone https://github.com/mayankek01/docbook-client.git
cd docbook-client
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For production (Vercel), set this to your deployed backend URL:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
```

### Run

```bash
npm run dev
```

App starts on `http://localhost:3000`.

## Deployment

Deployed on Vercel with automatic deployments from the `main` branch.

**Note:** The backend is deployed on Render's free tier, which spins down after inactivity. The first API call after inactivity may take ~30 seconds. Subsequent requests work normally.