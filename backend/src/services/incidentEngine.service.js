import Incident from "../models/Incident.js";
import { createTraceId } from "../utils/trace.js";
import {
  getIO,
  getRuntimeIncidents,
  getRuntimeServices,
  setRuntimeIncidents,
  syncRuntime,
  createSystemLog,
} from "./runtime.service.js";
import { pushRecentLog } from "./cache.service.js";
import {
  applyExternalAnomaly,
  clearExternalAnomaly,
} from "./externalMonitor.service.js";

export async function resolveIncident(id) {
  const current = getRuntimeIncidents();
  const incident = current.find((item) => String(item._id) === String(id));
  if (!incident) return null;
  const resolvedAt = new Date();
  const service = getRuntimeServices().find(
    (item) => item.name === incident.serviceName,
  );
  if (service?.mode === "external") {
    try {
      await clearExternalAnomaly(service);
    } catch (error) {
      console.warn("External anomaly cleanup failed:", error.message);
    }
  }
  const updated = await Incident.findByIdAndUpdate(
    id,
    { status: "resolved", resolvedAt },
    { new: true },
  ).lean();
  setRuntimeIncidents(
    current.filter((item) => String(item._id) !== String(id)),
  );
  const log = await createSystemLog({
    serviceName: incident.serviceName,
    level: "INFO",
    message: `${incident.type} incident resolved; service recovery started`,
    traceId: createTraceId(),
    incidentId: String(id),
  });
  await pushRecentLog(log);
  getIO()?.emit("logs:new", log);
  await syncRuntime();
  return updated;
}

export async function injectIncident(payload) {
  const service = getRuntimeServices().find(
    (item) => item.name === payload.serviceName,
  );
  if (!service) throw new Error("Target service not found");
  if (service.mode === "external") await applyExternalAnomaly(service, payload);
  const incident = await Incident.create({
    ...payload,
    startedAt: new Date(),
    summary: `${payload.severity} ${payload.type.toLowerCase().replaceAll("_", " ")} affecting ${payload.serviceName}`,
  });
  const plain = { ...incident.toObject(), _id: String(incident._id) };
  setRuntimeIncidents([plain, ...getRuntimeIncidents()]);
  await syncRuntime();
  setTimeout(
    () => resolveIncident(plain._id).catch(console.error),
    payload.duration * 1000,
  );
  return plain;
}
