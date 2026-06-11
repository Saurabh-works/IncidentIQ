# IncidentIQ

IncidentIQ is an AI-inspired production incident simulator and real-time observability dashboard. It models six backend services, injects controlled failures, streams logs and metrics, and generates rule-based root cause analysis reports.

It also includes an independently running test API that can be registered as a custom external service. IncidentIQ probes its real HTTP endpoint, measures actual response behavior, and applies controlled anomalies through a protected control endpoint.

![IncidentIQ dashboard screenshot placeholder](https://placehold.co/1200x650/020617/22d3ee?text=IncidentIQ+Dashboard+Screenshot)

## Features

- Real-time service health dashboard for six simulated services
- Latency spike, error-rate, service-down, memory-leak, and database-slowdown incidents
- Automatic incident resolution and gradual service recovery
- Persistent logs, historical metric snapshots, incident history, and RCA reports
- Redis-backed live state, dashboard summary, recent logs, active incidents, and latest metrics
- Socket.IO updates for dashboards, services, incidents, logs, metrics, and RCA reports
- Rule-based RCA engine that correlates incidents, telemetry, logs, and history
- Responsive dark monitoring interface with Recharts visualizations
- Custom external service registration and real HTTP endpoint monitoring
- Independent test API with controlled real latency, error, and availability anomalies

## Tech Stack

**Frontend:** React, Vite, JavaScript, Material UI, Axios, React Router, Socket.IO Client, Recharts, Lucide React

**Backend:** Node.js, Express, MongoDB, Mongoose, Redis, Socket.IO, dotenv, cors, morgan

## Folder Structure

```txt
IncidentIQ/
  frontend/          # React dashboard
  backend/           # Express API and simulation engine
  test-api/          # Independent API monitored through real HTTP calls
  README.md
```

## Data Architecture

Redis is the live-state layer. It stores frequently changing service health, active incidents, recent logs, dashboard summary, and latest metrics:

```txt
incidentiq:services
incidentiq:active_incidents
incidentiq:recent_logs
incidentiq:dashboard_summary
incidentiq:metrics:latest
```

MongoDB is the historical persistence layer. It stores services, incidents, all logs, metric snapshots, and RCA reports. If Redis is temporarily unavailable, the backend continues with a process-memory fallback and reconnects through the official Redis client.

## Local Setup

Requirements: Node.js 18+, MongoDB, and Redis.

1. Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Start MongoDB and Redis:

```bash
redis-server
```

MongoDB Atlas and Redis Cloud/Upstash can also be used by changing `MONGO_URI` and `REDIS_URL`.

3. Start the backend:

```bash
cd backend
npm install
npm run dev
```

4. Start the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

5. Start and connect the independent test API:

```bash
cd test-api
npm install
npm start
```

Open **Custom Services** in IncidentIQ and use the pre-filled values:

```txt
Name: IncidentIQ Test API
Base URL: http://localhost:7000
Health endpoint: /health
Test endpoint: /api/products
Control key: incidentiq-local-control
```

IncidentIQ sends one real HTTP probe every three seconds. Incidents injected into this external service change its actual HTTP response latency, status codes, or availability. Use controlled anomalies only against APIs you own and only in local or staging environments.

## Environment Variables

Backend:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/incidentiq
REDIS_URL=redis://127.0.0.1:6379
CLIENT_URL=http://localhost:5173
USE_REAL_AI=false
AI_API_KEY=
```

Frontend:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | Dashboard summary |
| GET | `/api/services` | Current service state |
| GET | `/api/services/:id` | Single service |
| POST | `/api/services/reset` | Reset service telemetry |
| POST | `/api/services/external` | Register and verify an external service |
| POST | `/api/services/:id/test` | Test an external service connection |
| DELETE | `/api/services/:id` | Remove an external service |
| GET | `/api/incidents` | Incident history |
| GET | `/api/incidents/active` | Active incidents |
| POST | `/api/incidents/inject` | Inject an incident |
| PATCH | `/api/incidents/:id/resolve` | Resolve an active incident |
| GET | `/api/logs` | Filterable historical logs |
| GET | `/api/logs/recent` | Recent Redis-cached logs |
| GET | `/api/metrics` | Historical metrics |
| GET | `/api/metrics/latest` | Latest Redis-cached metrics |
| GET | `/api/metrics/:serviceName` | Metrics for one service |
| POST | `/api/rca/generate` | Generate an RCA report |
| GET | `/api/rca/latest` | Latest RCA report |
| GET | `/api/rca` | RCA report history |

Example incident:

```json
{
  "serviceName": "Payment Service",
  "type": "LATENCY_SPIKE",
  "duration": 120,
  "severity": "high"
}
```

## Future Improvements

- Optional real AI provider integration behind `USE_REAL_AI`
- Dependency topology and downstream impact propagation
- Saved incident scenarios and chaos experiments
- Alert rules, notification channels, and SLO tracking
- Team authentication and environment separation

## Resume Bullets

- Built an AI-powered production incident simulator using MERN stack and Redis to inject latency, error-rate, and service-down failures across simulated backend services.
- Designed a real-time observability dashboard with service health, p95 latency, error rate, logs, metrics, and incident timelines using React, Socket.IO, and Recharts.
- Used Redis for live service state, recent logs, latest metrics, and active incident caching while persisting historical logs and metrics in MongoDB.
- Implemented a rule-based RCA engine that analyzes active incidents, service metrics, and error logs to generate root cause summaries and remediation steps.
