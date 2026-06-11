import mongoose from "mongoose";
import { INCIDENT_TYPES, SEVERITIES } from "../utils/constants.js";

const schema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  type: { type: String, enum: INCIDENT_TYPES, required: true },
  severity: { type: String, enum: SEVERITIES, required: true },
  status: { type: String, enum: ["active", "resolved"], default: "active" },
  startedAt: { type: Date, default: Date.now },
  resolvedAt: Date,
  duration: { type: Number, required: true },
  summary: String,
});

export default mongoose.model("Incident", schema);
