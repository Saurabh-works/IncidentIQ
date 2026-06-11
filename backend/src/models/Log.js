import mongoose from "mongoose";

const schema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, index: true },
  serviceName: String,
  level: { type: String, enum: ["INFO", "WARN", "ERROR"] },
  message: String,
  traceId: String,
  incidentId: String,
});

export default mongoose.model("Log", schema);
