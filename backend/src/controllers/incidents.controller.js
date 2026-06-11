import Incident from "../models/Incident.js";
import { INCIDENT_TYPES, SEVERITIES } from "../utils/constants.js";
import {
  getRuntimeIncidents,
  getRuntimeServices,
} from "../services/runtime.service.js";
import {
  injectIncident,
  resolveIncident,
} from "../services/incidentEngine.service.js";

export async function getIncidents(req, res, next) {
  try {
    res.json(await Incident.find().sort({ startedAt: -1 }).limit(100).lean());
  } catch (error) {
    next(error);
  }
}
export const getActiveIncidents = (req, res) => res.json(getRuntimeIncidents());
export async function inject(req, res, next) {
  try {
    const { serviceName, type, severity, duration } = req.body;
    if (
      !getRuntimeServices().some((item) => item.name === serviceName) ||
      !INCIDENT_TYPES.includes(type) ||
      !SEVERITIES.includes(severity) ||
      !Number.isFinite(Number(duration)) ||
      duration < 5
    ) {
      return res
        .status(400)
        .json({
          message:
            "Provide a valid service, incident type, severity, and duration of at least 5 seconds.",
        });
    }
    res
      .status(201)
      .json(
        await injectIncident({
          serviceName,
          type,
          severity,
          duration: Number(duration),
        }),
      );
  } catch (error) {
    next(error);
  }
}
export async function resolve(req, res, next) {
  try {
    const incident = await resolveIncident(req.params.id);
    res
      .status(incident ? 200 : 404)
      .json(incident || { message: "Active incident not found" });
  } catch (error) {
    next(error);
  }
}
