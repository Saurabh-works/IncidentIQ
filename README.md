# IncidentIQ

IncidentIQ is a full-stack production incident simulator and real-time observability dashboard. It simulates backend services, injects controlled failures, streams logs and metrics, and generates rule-based root cause analysis reports.

The project also includes an independent **test API** that can be registered as a custom external service. IncidentIQ monitors the real HTTP endpoint, measures response behavior, and applies controlled anomalies through a protected control endpoint.

> **Project status:** Local development complete. Deployment is planned for Netlify, AWS EC2/Render/Railway, and Vercel/Render.

![IncidentIQ dashboard screenshot placeholder](https://placehold.co/1200x650/020617/22d3ee?text=IncidentIQ+Dashboard+Screenshot)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Deployment Plan](#deployment-plan)

## Features

- Real-time service health dashboard for simulated backend services
- Incident injection for latency spikes, error-rate increases, service downtime, memory leaks, and database slowdowns
- Automatic incident resolution and gradual service recovery
- Persistent logs, historical metric snapshots, incident history, and RCA reports
- Redis-backed live state for dashboard summary, recent logs, active incidents, services, and latest metrics
- Socket.IO-powered real-time updates for dashboards, services, incidents, logs, metrics, and RCA reports
- Rule-based RCA engine that correlates incidents, telemetry, logs, and historical context
- Responsive dark monitoring UI with Recharts visualizations
- Custom external service registration and real HTTP endpoint monitoring
- Independent test API with controlled real latency, error, and availability anomalies

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Material UI
- Axios
- React Router
- Socket.IO Client
- Recharts
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Redis
- Socket.IO
- dotenv
- cors
- morgan

### Test API

- Node.js
- Express.js
- dotenv
- cors
- morgan

## Project Structure

```txt
IncidentIQ/
  frontend/          # React + Vite dashboard
  backend/           # Express API, Socket.IO server, and simulation engine
  test-api/          # Independent API monitored through real HTTP calls
  README.md
```

This repository is structured as a **monorepo**. The frontend, backend, and test API live in the same GitHub repository but can be deployed separately from their own folders.

## Architecture Overview

```txt
Frontend Dashboard
   |
   | REST API + Socket.IO
   v
Backend API / Simulation Engine
   |
   | Live state cache
   v
Redis
   |
   | Historical persistence
   v
MongoDB

External Test API <---- monitored by ---- Backend External Monitor
```

### Redis Live-State Layer

Redis stores frequently changing runtime data:

```txt
incidentiq:services
incidentiq:active_incidents
incidentiq:recent_logs
incidentiq:dashboard_summary
incidentiq:metrics:latest
```

### MongoDB Persistence Layer

MongoDB stores long-term application data including:

- Services
- Incidents
- Logs
- Metric snapshots
- RCA reports

If Redis is temporarily unavailable, the backend continues with a process-memory fallback and reconnects through the official Redis client.

## Local Setup

### Prerequisites

Make sure you have the following installed:

- Node.js 18+
- MongoDB local instance or MongoDB Atlas URI
- Redis local instance or hosted Redis URL
- npm

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/incidentiq.git
cd incidentiq
```

Replace `your-username` with your GitHub username after pushing the project.

### 2. Create Environment Files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp test-api/.env.example test-api/.env
```

### 3. Start MongoDB and Redis

If you are using local Redis:

```bash
redis-server
```

For MongoDB, you can use a local MongoDB server or MongoDB Atlas.

### 4. Start the Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```txt
http://localhost:5000
```

### 5. Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

### 6. Start the Test API

Open another terminal:

```bash
cd test-api
npm install
npm start
```

Test API runs on:

```txt
http://localhost:7000
```

### 7. Register the Test API in IncidentIQ

Open **Custom Services** inside the IncidentIQ dashboard and use:

```txt
Name: IncidentIQ Test API
Base URL: http://localhost:7000
Health endpoint: /health
Test endpoint: /api/products
Control key: incidentiq-local-control
```

IncidentIQ sends one real HTTP probe every three seconds. Incidents injected into this external service change its actual HTTP response latency, status codes, or availability.

> Use controlled anomalies only against APIs you own and only in local or staging environments.

## Environment Variables

### Backend

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/incidentiq
REDIS_URL=redis://127.0.0.1:6379
CLIENT_URL=http://localhost:5173
USE_REAL_AI=false
RCA_PROVIDER=rule-based
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.1-flash-lite
GEMINI_DAILY_REQUEST_LIMIT=1000
GEMINI_DAILY_TOKEN_LIMIT=1000000
```

### Frontend

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Test API

Create `test-api/.env`:

```env
PORT=7000
INCIDENTIQ_CONTROL_KEY=incidentiq-local-control
```

> Do not commit real `.env` files to GitHub. Commit only `.env.example` files.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | Get dashboard summary |
| GET | `/api/services` | Get current service state |
| GET | `/api/services/:id` | Get a single service |
| POST | `/api/services/reset` | Reset service telemetry |
| POST | `/api/services/external` | Register and verify an external service |
| POST | `/api/services/:id/test` | Test an external service connection |
| DELETE | `/api/services/:id` | Remove an external service |
| GET | `/api/incidents` | Get incident history |
| GET | `/api/incidents/active` | Get active incidents |
| POST | `/api/incidents/inject` | Inject an incident |
| PATCH | `/api/incidents/:id/resolve` | Resolve an active incident |
| GET | `/api/logs` | Get filterable historical logs |
| GET | `/api/logs/recent` | Get recent Redis-cached logs |
| GET | `/api/metrics` | Get historical metrics |
| GET | `/api/metrics/latest` | Get latest Redis-cached metrics |
| GET | `/api/metrics/:serviceName` | Get metrics for one service |
| POST | `/api/rca/generate` | Generate an RCA report |
| GET | `/api/rca/latest` | Get latest RCA report |
| GET | `/api/rca/quota` | Get Gemini availability status |
| GET | `/api/rca` | Get RCA report history |

The RCA page supports Rule-Based and Gemini AI modes. Gemini failures automatically fall back to the rule engine, and the page displays whether Gemini is currently available.

### Example Incident Payload

```json
{
  "serviceName": "Payment Service",
  "type": "LATENCY_SPIKE",
  "duration": 120,
  "severity": "high"
}
```

## Deployment Plan

This project is not deployed yet. Planned deployment structure:

| App | Folder | Planned Platform | Notes |
|---|---|---|---|
| Frontend | `frontend/` | Netlify | Deploy as a Vite React app |
| Backend | `backend/` | AWS EC2 / Render / Railway | Better suited for Express + Socket.IO |
| Test API | `test-api/` | Vercel / Render / Railway | Simple standalone Express API |
| Database | External | MongoDB Atlas | Production MongoDB database |
| Redis | External | Upstash / Redis Cloud | Hosted Redis instance |

### Netlify Frontend Settings

When deploying the frontend from this monorepo:

```txt
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

Production frontend variables will need to point to the deployed backend:

```env
VITE_API_BASE_URL=https://your-backend-url.com/api
VITE_SOCKET_URL=https://your-backend-url.com
```

### Backend Production Notes

The backend should run as a long-lived Node.js server because it uses Socket.IO and background simulation services. For production, configure:

```env
PORT=5000
MONGO_URI=your-production-mongodb-uri
REDIS_URL=your-production-redis-url
CLIENT_URL=https://your-frontend-domain.netlify.app
USE_REAL_AI=false
RCA_PROVIDER=rule-based
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.1-flash-lite
GEMINI_DAILY_REQUEST_LIMIT=1000
GEMINI_DAILY_TOKEN_LIMIT=1000000
```

## License

This project is currently for learning and portfolio use. Add a license before using it in production or distributing it publicly.
