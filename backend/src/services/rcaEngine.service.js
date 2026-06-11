import RCAReport from "../models/RCAReport.js";
import Incident from "../models/Incident.js";
import { getRecentLogs } from "./cache.service.js";
import { generateGeminiRCA } from "./gemini.service.js";
import { getRuntimeIncidents, getRuntimeServices, getIO } from "./runtime.service.js";

async function collectContext() {
  const activeIncidents = getRuntimeIncidents();
  const services = getRuntimeServices().map(({ controlKey, ...service }) => service);
  const recentLogs = (await getRecentLogs()).slice(0, 30);
  const historicalIncidents = await Incident.find({ status: "resolved" }).sort({ resolvedAt: -1 }).limit(10).lean();
  return { activeIncidents, services, recentLogs, historicalIncidents };
}

function generateRuleBasedData(context) {
  const { activeIncidents, services, recentLogs, historicalIncidents } = context;
  const affectedServices = [...new Set(activeIncidents.map((item) => item.serviceName))];
  const target = activeIncidents[0];
  const metric = services.find((item) => item.name === target?.serviceName);
  const rootCause = target
    ? `${target.serviceName} is experiencing ${target.type.toLowerCase().replaceAll("_", " ")} at ${target.severity} severity.`
    : "No active injected incident was found. Current telemetry does not indicate a clear production failure.";
  const evidence = target
    ? [
        `${target.serviceName} status is ${metric?.status || "unknown"}.`,
        `${target.serviceName} p95 latency is ${Math.round(metric?.p95Latency || 0)}ms with ${metric?.errorCount || 0} total errors.`,
        `${recentLogs.filter((log) => log.level === "ERROR").length} recent error logs are present in the live cache.`,
        `${historicalIncidents.filter((item) => item.serviceName === target.serviceName).length} similar historical incidents were found.`,
      ]
    : ["All services are currently operating without an active injected incident."];
  return {
    rootCause,
    affectedServices,
    impact: target ? `Requests handled by ${target.serviceName} may be delayed or fail, affecting connected user flows.` : "No immediate user impact detected.",
    evidence,
    suggestedFixes: ["Inspect the affected service dependencies.", "Restart unhealthy workers if saturation persists.", "Add retries with exponential backoff.", "Scale service capacity and monitor recovery."],
    preventionSteps: ["Add latency and error-rate alerts.", "Use circuit breakers for unstable dependencies.", "Review capacity limits after each incident."],
    rawSummary: `${rootCause} ${evidence.join(" ")}`,
  };
}

export async function generateRCA(requestedProvider = "rule-based") {
  const context = await collectContext();
  let data;
  let generatedBy = "rule-based";
  let model = "";
  let usage = {};
  let fallbackReason = "";

  if (requestedProvider === "gemini" && process.env.USE_REAL_AI === "true") {
    try {
      const result = await generateGeminiRCA(context);
      data = result.report;
      generatedBy = "gemini";
      model = result.model;
      usage = result.usage;
    } catch (error) {
      fallbackReason = error.message;
      data = generateRuleBasedData(context);
    }
  } else {
    data = generateRuleBasedData(context);
    if (requestedProvider === "gemini") fallbackReason = "Gemini AI is disabled; rule-based fallback was used.";
  }

  const report = await RCAReport.create({
    ...data,
    requestedProvider,
    generatedBy,
    model,
    usage,
    fallbackReason,
  });
  getIO()?.emit("rca:generated", report);
  return report;
}
