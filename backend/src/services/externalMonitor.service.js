import { createTraceId } from "../utils/trace.js";
import { getIO, createSystemLog } from "./runtime.service.js";
import { pushRecentLog } from "./cache.service.js";

const latencyWindows = new Map();
const trimSlash = (value) => value.replace(/\/+$/, "");
const endpointUrl = (service, endpoint) =>
  `${trimSlash(service.baseUrl)}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

export async function requestExternal(
  service,
  endpoint = service.testEndpoint,
  options = {},
) {
  const startedAt = performance.now();
  const response = await fetch(endpointUrl(service, endpoint), {
    ...options,
    signal: AbortSignal.timeout(8000),
  });
  return { response, latency: Math.round(performance.now() - startedAt) };
}

export async function probeExternalService(service) {
  let level = "INFO";
  let message;
  try {
    const { response, latency } = await requestExternal(service);
    service.requestCount += 1;
    if (!response.ok) service.errorCount += 1;
    const window = [...(latencyWindows.get(service.name) || []), latency]
      .slice(-50)
      .sort((a, b) => a - b);
    latencyWindows.set(service.name, window);
    service.avgLatency = Math.round(
      window.reduce((sum, item) => sum + item, 0) / window.length,
    );
    service.p95Latency =
      window[Math.min(window.length - 1, Math.floor(window.length * 0.95))];
    service.status = !response.ok
      ? response.status >= 500
        ? "down"
        : "degraded"
      : service.avgLatency > 800
        ? "degraded"
        : "healthy";
    service.lastError = response.ok ? "" : `HTTP ${response.status}`;
    level = response.ok
      ? service.status === "degraded"
        ? "WARN"
        : "INFO"
      : "ERROR";
    message = `${service.name} probe returned HTTP ${response.status} in ${latency}ms`;
  } catch (error) {
    service.requestCount += 1;
    service.errorCount += 1;
    service.status = "down";
    service.lastError = error.message;
    level = "ERROR";
    message = `${service.name} probe failed: ${error.message}`;
  }
  service.lastUpdated = new Date();
  const log = await createSystemLog({
    serviceName: service.name,
    level,
    message,
    traceId: createTraceId(),
  });
  await pushRecentLog(log);
  getIO()?.emit("logs:new", log);
}

export async function applyExternalAnomaly(service, incident) {
  const { response } = await requestExternal(
    service,
    "/__incidentiq/anomalies",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-incidentiq-control-key": service.controlKey,
      },
      body: JSON.stringify({
        type: incident.type,
        severity: incident.severity,
        duration: incident.duration,
      }),
    },
  );
  if (!response.ok)
    throw new Error(
      `External service rejected anomaly control with HTTP ${response.status}`,
    );
}

export async function clearExternalAnomaly(service) {
  const { response } = await requestExternal(
    service,
    "/__incidentiq/anomalies",
    {
      method: "DELETE",
      headers: { "x-incidentiq-control-key": service.controlKey },
    },
  );
  if (!response.ok)
    throw new Error(
      `External service rejected anomaly cleanup with HTTP ${response.status}`,
    );
}

export async function testExternalConnection(service) {
  const { response, latency } = await requestExternal(
    service,
    service.healthEndpoint,
  );
  if (!response.ok)
    throw new Error(`Health endpoint returned HTTP ${response.status}`);
  return { ok: true, latency, status: response.status };
}
