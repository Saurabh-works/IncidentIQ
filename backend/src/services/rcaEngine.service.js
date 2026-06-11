import RCAReport from "../models/RCAReport.js";
import Incident from "../models/Incident.js";
import { getRecentLogs } from "./cache.service.js";
import {
  getRuntimeIncidents,
  getRuntimeServices,
  getIO,
} from "./runtime.service.js";

export async function generateRCA() {
  const active = getRuntimeIncidents();
  const services = getRuntimeServices();
  const recentLogs = await getRecentLogs();
  const historical = await Incident.find({ status: "resolved" })
    .sort({ resolvedAt: -1 })
    .limit(10)
    .lean();
  const affected = [...new Set(active.map((item) => item.serviceName))];
  const target = active[0];
  const metric = services.find((item) => item.name === target?.serviceName);
  const rootCause = target
    ? `${target.serviceName} is experiencing ${target.type.toLowerCase().replaceAll("_", " ")} at ${target.severity} severity.`
    : "No active injected incident was found. Current telemetry does not indicate a clear production failure.";
  const evidence = target
    ? [
        `${target.serviceName} status is ${metric?.status || "unknown"}.`,
        `${target.serviceName} p95 latency is ${Math.round(metric?.p95Latency || 0)}ms with ${metric?.errorCount || 0} total errors.`,
        `${recentLogs.filter((log) => log.level === "ERROR").length} recent error logs are present in the live cache.`,
        `${historical.filter((item) => item.serviceName === target.serviceName).length} similar historical incidents were found.`,
      ]
    : [
        "All simulated services are currently operating without an active injected incident.",
      ];
  const report = await RCAReport.create({
    rootCause,
    affectedServices: affected,
    impact: target
      ? `Requests handled by ${target.serviceName} may be delayed or fail, affecting connected user flows.`
      : "No immediate user impact detected.",
    evidence,
    suggestedFixes: [
      "Inspect the affected service dependencies.",
      "Restart unhealthy workers if saturation persists.",
      "Add retries with exponential backoff.",
      "Scale service capacity and monitor recovery.",
    ],
    preventionSteps: [
      "Add latency and error-rate alerts.",
      "Use circuit breakers for unstable dependencies.",
      "Review capacity limits after each incident.",
    ],
    rawSummary: `${rootCause} ${evidence.join(" ")}`,
  });
  getIO()?.emit("rca:generated", report);
  return report;
}
