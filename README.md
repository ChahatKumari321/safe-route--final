# SafeRoute Karachi 🛡

> A community-powered urban safety awareness and incident-reporting platform for Karachi, Pakistan.

---

## ⚠️ Disclaimer

**SafeRoute Karachi is a community awareness tool only.** Community reports are submitted by users and are NOT verified by police or official authorities. This platform does NOT guarantee route safety. Always use your own judgment and contact official emergency services in any emergency situation.

**Emergency Numbers (Pakistan):**
- Police: **15**
- Rescue: **1122**
- Edhi Foundation: **115**
- Fire Brigade: **16**

---

## 🚀 Features

- 🗺 **Interactive Karachi Map** — View community-reported incidents with Leaflet.js + OpenStreetMap
- 📢 **Incident Reporting** — Submit categorized safety reports with map pin selection
- 🔍 **Route Awareness** — See community incidents near your planned route (via OSRM)
- ✅ **Admin Moderation** — Verify, reject, expire, or delete submitted reports
- 📊 **Statistics Dashboard** — Charts and analytics with Chart.js
- 🔐 **JWT Authentication** — Secure login/register with bcrypt password hashing
- 👥 **Role-Based Access** — User and Administrator roles

---

## 🛠 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | HTML5, CSS3, Vanilla JavaScript     |
| Backend     | Node.js, Express.js                 |
| Database    | PostgreSQL (via `pg` package)       |
| Map         | Leaflet.js + OpenStreetMap          |
| Routing     | OSRM (public demo server)           |
| Auth        | JWT + bcryptjs                      |
| Charts      | Chart.js                            |

---

## 📁 Project Structure

```
saferoute-karachi/
├── backend/
│   ├── config/
│   │   └── db.js                 # PostgreSQL pool config
│   ├── controllers/
│   │   ├── authController.js     # Register, login, getMe
│   │   ├── incidentController.js # Incident CRUD
│   │   ├── adminController.js    # Admin stats & moderation
│   │   └── routeController.js   # OSRM route calculation
│   ├── middleware/
│   │   ├── auth.js               # JWT verification middleware
│   │   └── adminAuth.js          # Admin role guard
│   ├── routes/
│   │   ├── auth.js
│   │   ├── incidents.js
│   │   ├── admin.js
│   │   └── routes.js
│   ├── server.js                 # Express app entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── index.html                # Home page
│   ├── login.html                # Login page
│   ├── register.html             # Registration page
│   ├── dashboard.html            # User dashboard
│   ├── map.html                  # Interactive Karachi map
│   ├── report.html               # Incident reporting page
│   ├── incident.html             # Incident detail page
│   ├── admin.html                # Admin dashboard
│   ├── css/
│   │   └── style.css             # Complete global stylesheet
│   └── js/
│       └── main.js               # Shared utilities & Auth
├── database/
│   └── schema.sql                # Full PostgreSQL schema + demo data
├── README.md
└── .gitignore
```

---

## ⚙️ Setup Instructions (Windows 11)

### Prerequisites

- **Node.js** v18+ — https://nodejs.org
- **PostgreSQL** v14+ — https://www.postgresql.org/download/windows/
- **Git** (optional) — https://git-scm.com

---

### Step 1 — Set Up the Database

Open **pgAdmin** or **psql** and run:

```sql
CREATE DATABASE saferoute_karachi;
```

Then run the schema file:

```bash
# Using psql (adjust password if needed)
psql -U postgres -d saferoute_karachi -f database/schema.sql
```

Or in pgAdmin: open the Query Tool on `saferoute_karachi` database, paste the contents of `database/schema.sql`, and click Execute.

---

### Step 2 — Configure Environment Variables

```bash
cd backend
copy .env.example .env
```

Edit `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=saferoute_karachi
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE

JWT_SECRET=change_this_to_a_long_random_string_in_production
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5000
```

> **Important:** Change `JWT_SECRET` to a long random string before deploying.

---

### Step 3 — Install Dependencies

```bash
cd backend
npm install
```

---

### Step 4 — Start the Server

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

The server starts at: **http://localhost:5000**

---

### Step 5 — Open the Application

Navigate to **http://localhost:5000** in your browser.

---

## 🔑 Demo Credentials

> These are pre-seeded in the database schema. The passwords used in the SQL seed are the bcrypt hash of `password`.

| Role  | Email                   | Password   |
|-------|-------------------------|------------|
| Admin | admin@saferoute.pk      | password   |
| User  | demo@saferoute.pk       | password   |

> **Note:** The seeded password hash in `schema.sql` is for the string `password`. To create proper accounts, register via the UI or use `bcryptjs` to generate a correct hash.

---

## 🌐 API Documentation

### Base URL: `http://localhost:5000/api`

#### Authentication

| Method | Endpoint           | Auth | Description             |
|--------|--------------------|------|-------------------------|
| POST   | /auth/register     | ❌    | Register new user       |
| POST   | /auth/login        | ❌    | Login, get JWT token    |
| GET    | /auth/me           | ✅    | Get current user info   |

#### Incidents

| Method | Endpoint                | Auth  | Description              |
|--------|-------------------------|-------|--------------------------|
| GET    | /incidents              | ❌    | List all incidents       |
| GET    | /incidents/categories   | ❌    | List categories          |
| GET    | /incidents/mine         | ✅    | Current user's incidents |
| GET    | /incidents/:id          | ❌    | Get incident by ID       |
| POST   | /incidents              | ✅    | Submit new incident      |
| PATCH  | /incidents/:id          | ✅    | Update own incident      |
| DELETE | /incidents/:id          | ✅    | Delete own incident      |

#### Admin (Admin role required)

| Method | Endpoint                        | Description                |
|--------|---------------------------------|----------------------------|
| GET    | /admin/stats                    | Dashboard statistics       |
| GET    | /admin/incidents                | All incidents              |
| PATCH  | /admin/incidents/:id/status     | Update incident status     |
| DELETE | /admin/incidents/:id            | Delete incident            |

#### Routes

| Method | Endpoint           | Description                     |
|--------|--------------------|---------------------------------|
| POST   | /routes/calculate  | Calculate route with OSRM       |

---

## 📊 Database Schema

See [`database/schema.sql`](database/schema.sql) for the complete schema.

**Tables:** `users`, `incident_categories`, `incidents`, `verifications`, `saved_routes`

---

## 🧪 Testing Guide

1. Register a new account via `/register.html`
2. Login as the demo user and submit a test incident at `/report.html`
3. Login as admin (`admin@saferoute.pk` / `password`) and go to `/admin.html`
4. Review, verify, or reject the pending incident
5. Visit `/map.html` to see the incident marker
6. Use Route Awareness to enter two Karachi locations and check for nearby incidents

---

## 🎯 Hackathon Presentation Summary

### Problem
Karachi residents lack real-time, community-sourced safety information when navigating the city. Incidents like road blockages, street crime, and flooding occur frequently but are not aggregated into a usable tool.

### Solution
SafeRoute Karachi is a community-powered safety awareness platform where citizens can:
- View and report incidents on an interactive map
- Plan routes with awareness of community-reported concerns
- Trust moderated, admin-verified reports for key decisions

### Technology Stack
Node.js + Express + PostgreSQL + Leaflet.js + OpenStreetMap + OSRM + Chart.js + JWT

### Social Impact
- Empowers ordinary citizens to contribute to community safety
- Provides accessible safety data for pedestrians, cyclists, and drivers
- Bridges the gap between citizen awareness and official reporting channels
- Transparent moderation ensures misinformation is minimized

### Key Disclaimer
SafeRoute Karachi is an awareness tool, not an emergency service. It complements, not replaces, official emergency services.

---

## 🔒 Security Features

- bcrypt password hashing (10 salt rounds)
- JWT token authentication
- Role-based authorization (user/admin)
- Rate limiting (auth: 20 req/15min, reports: 15 req/hour)
- Parameterized SQL queries (SQL injection prevention)
- Input validation on all endpoints
- Karachi coordinate boundary enforcement on reports
- Audit trail of all admin decisions

---

*Built for community safety awareness in Karachi, Pakistan.*
