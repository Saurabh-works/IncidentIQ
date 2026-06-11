import { createTraceId } from "../utils/trace.js";
import {
  getRuntimeIncidents,
  getRuntimeServices,
  getIO,
  createSystemLog,
} from "./runtime.service.js";
import { pushRecentLog } from "./cache.service.js";

const normal = [
  "processed request successfully",
  "completed health check",
  "emitted update event",
];
const warning = [
  "latency crossed threshold",
  "dependency response is slower than expected",
  "connection pool pressure detected",
];
const errors = [
  "request failed after retries",
  "failed to complete operation",
  "upstream dependency unavailable",
];

export async function generateLog() {
  const services = getRuntimeServices().filter(
    (item) => item.mode !== "external",
  );
  if (!services.length) return;
  const service = services[Math.floor(Math.random() * services.length)];
  const incident = getRuntimeIncidents().find(
    (item) => item.serviceName === service.name,
  );
  const level =
    service.status === "down"
      ? "ERROR"
      : service.status === "degraded"
        ? "WARN"
        : "INFO";
  const pool = level === "ERROR" ? errors : level === "WARN" ? warning : normal;
  const log = await createSystemLog({
    serviceName: service.name,
    level,
    message: `${service.name} ${pool[Math.floor(Math.random() * pool.length)]}`,
    traceId: createTraceId(),
    incidentId: incident?._id || "",
  });
  await pushRecentLog(log);
  getIO()?.emit("logs:new", log);
}

export const startLogGenerator = () =>
  setInterval(() => generateLog().catch(console.error), 5000);
