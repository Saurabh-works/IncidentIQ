import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import http from "node:http";
import { Server } from "socket.io";
import { connectDB } from "./src/config/db.js";
import { connectRedis } from "./src/config/redis.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import servicesRoutes from "./src/routes/services.routes.js";
import incidentsRoutes from "./src/routes/incidents.routes.js";
import logsRoutes from "./src/routes/logs.routes.js";
import metricsRoutes from "./src/routes/metrics.routes.js";
import rcaRoutes from "./src/routes/rca.routes.js";
import { initializeRuntime, setIO } from "./src/services/runtime.service.js";
import { getRuntimeIncidents } from "./src/services/runtime.service.js";
import { resolveIncident } from "./src/services/incidentEngine.service.js";
import {
  startLogGenerator,
  startMetricGenerator,
  startSimulator,
} from "./src/services/index.js";

const app = express();
const server = http.createServer(app);
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const io = new Server(server, { cors: { origin: clientUrl } });
setIO(io);

app.use(cors({ origin: clientUrl }));
app.use(express.json());
app.use(morgan("dev"));
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date() }),
);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/incidents", incidentsRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/rca", rcaRoutes);
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: error.message || "Internal server error" });
});

async function start() {
  const mongoConnected = await connectDB();
  if (!mongoConnected) {
    console.error(
      "MongoDB is required. Start MongoDB or update MONGO_URI, then restart.",
    );
    process.exit(1);
  }
  await connectRedis();
  await initializeRuntime();
  for (const incident of getRuntimeIncidents()) {
    const remaining = Math.max(
      0,
      new Date(incident.startedAt).getTime() +
        incident.duration * 1000 -
        Date.now(),
    );
    setTimeout(
      () => resolveIncident(incident._id).catch(console.error),
      remaining,
    );
  }
  startSimulator();
  startLogGenerator();
  startMetricGenerator();
  server.listen(process.env.PORT || 5000, () =>
    console.log(`IncidentIQ API running on port ${process.env.PORT || 5000}`),
  );
}

start();
