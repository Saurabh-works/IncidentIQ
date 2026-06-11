import { clamp, randomBetween } from "../utils/formatters.js";
import { severityMultiplier } from "../utils/constants.js";
import {
  getRuntimeIncidents,
  getRuntimeServices,
  persistServices,
  syncRuntime,
} from "./runtime.service.js";
import { probeExternalService } from "./externalMonitor.service.js";

function applyIncident(service, incident) {
  const factor = severityMultiplier[incident.severity] || 1;
  switch (incident.type) {
    case "LATENCY_SPIKE":
      service.avgLatency += randomBetween(120, 280) * factor;
      service.p95Latency += randomBetween(250, 600) * factor;
      service.status = factor >= 2.6 ? "down" : "degraded";
      break;
    case "ERROR_RATE_INCREASE":
      service.errorCount += Math.round(randomBetween(4, 12) * factor);
      service.status = factor >= 4 ? "down" : "degraded";
      break;
    case "SERVICE_DOWN":
      service.status = "down";
      service.errorCount += Math.round(randomBetween(8, 20) * factor);
      service.avgLatency = Math.max(service.avgLatency, 2500);
      service.p95Latency = Math.max(service.p95Latency, 5000);
      break;
    case "MEMORY_LEAK_SIMULATION":
      service.avgLatency += 45 * factor;
      service.p95Latency += 90 * factor;
      service.status = service.avgLatency > 1200 ? "down" : "degraded";
      break;
    case "DATABASE_SLOWDOWN":
      service.avgLatency += randomBetween(100, 220) * factor;
      service.p95Latency += randomBetween(200, 450) * factor;
      service.status = "degraded";
      break;
  }
}

export async function simulatorTick() {
  const services = getRuntimeServices();
  const incidents = getRuntimeIncidents();
  for (const service of services) {
    if (service.mode === "external") {
      await probeExternalService(service);
      continue;
    }
    const active = incidents.filter(
      (item) => item.serviceName === service.name,
    );
    service.requestCount += randomBetween(
      service.status === "down" ? 0 : 12,
      service.status === "down" ? 3 : 45,
    );
    service.avgLatency = clamp(
      service.avgLatency + randomBetween(-35, 25),
      60,
      10000,
    );
    service.p95Latency = clamp(
      Math.max(
        service.avgLatency + 30,
        service.p95Latency + randomBetween(-50, 35),
      ),
      100,
      15000,
    );
    if (!active.length) {
      service.avgLatency = Math.max(80, Math.round(service.avgLatency * 0.82));
      service.p95Latency = Math.max(130, Math.round(service.p95Latency * 0.82));
      service.status = service.avgLatency > 700 ? "degraded" : "healthy";
    } else active.forEach((incident) => applyIncident(service, incident));
    service.lastUpdated = new Date();
  }
  await syncRuntime();
  persistServices().catch((error) =>
    console.warn("Service persistence failed:", error.message),
  );
}

export const startSimulator = () =>
  setInterval(() => simulatorTick().catch(console.error), 3000);
