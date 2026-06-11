import Service from "../models/Service.js";
import Incident from "../models/Incident.js";
import Log from "../models/Log.js";
import Metric from "../models/Metric.js";
import { SERVICE_NAMES } from "../utils/constants.js";
import {
  setActiveIncidents,
  setDashboardSummary,
  setServicesState,
} from "./cache.service.js";

let io;
let services = [];
let incidents = [];

export const setIO = (socketIO) => {
  io = socketIO;
};
export const getIO = () => io;
export const getRuntimeServices = () => services;
export const getRuntimeIncidents = () => incidents;
export const setRuntimeServices = (value) => {
  services = value;
};
export const setRuntimeIncidents = (value) => {
  incidents = value;
};
export const publicServices = () =>
  services.map(({ controlKey, ...service }) => service);

export function buildSummary() {
  const totalRequests = services.reduce(
    (sum, item) => sum + item.requestCount,
    0,
  );
  const totalErrors = services.reduce((sum, item) => sum + item.errorCount, 0);
  return {
    totalServices: services.length,
    healthyServices: services.filter((item) => item.status === "healthy")
      .length,
    degradedServices: services.filter((item) => item.status === "degraded")
      .length,
    downServices: services.filter((item) => item.status === "down").length,
    activeIncidents: incidents.length,
    totalRequests,
    totalErrors,
    errorRate: totalRequests
      ? Number(((totalErrors / totalRequests) * 100).toFixed(2))
      : 0,
    averageLatency: services.length
      ? Math.round(
          services.reduce((sum, item) => sum + item.avgLatency, 0) /
            services.length,
        )
      : 0,
  };
}

export async function syncRuntime() {
  const summary = buildSummary();
  const safeServices = publicServices();
  await Promise.all([
    setServicesState(safeServices),
    setActiveIncidents(incidents),
    setDashboardSummary(summary),
  ]);
  io?.emit("services:update", safeServices);
  io?.emit("incidents:update", incidents);
  io?.emit("dashboard:update", summary);
}

export async function initializeRuntime() {
  const defaults = SERVICE_NAMES.map((name) => ({ name, mode: "simulated" }));
  await Promise.all(
    defaults.map((item) =>
      Service.updateOne(
        { name: item.name },
        { $setOnInsert: item },
        { upsert: true },
      ),
    ),
  );
  services = (await Service.find().select("+controlKey").lean()).map(
    (item) => ({ ...item, _id: String(item._id) }),
  );
  incidents = (await Incident.find({ status: "active" }).lean()).map(
    (item) => ({ ...item, _id: String(item._id) }),
  );
  await syncRuntime();
}

export async function createSystemLog({
  serviceName,
  level,
  message,
  traceId,
  incidentId = "",
}) {
  const item = await Log.create({
    serviceName,
    level,
    message,
    traceId,
    incidentId,
  });
  return item.toObject();
}

export async function persistServices() {
  await Promise.all(
    services.map(
      ({
        name,
        status,
        requestCount,
        errorCount,
        avgLatency,
        p95Latency,
        lastUpdated,
        lastError,
      }) =>
        Service.updateOne(
          { name },
          {
            status,
            requestCount,
            errorCount,
            avgLatency,
            p95Latency,
            lastUpdated,
            lastError,
          },
        ),
    ),
  );
}

export async function persistMetrics() {
  const timestamp = new Date();
  await Metric.insertMany(
    services.map(
      ({ name, requestCount, errorCount, avgLatency, p95Latency, status }) => ({
        serviceName: name,
        timestamp,
        requestCount,
        errorCount,
        avgLatency,
        p95Latency,
        status,
      }),
    ),
  );
}
