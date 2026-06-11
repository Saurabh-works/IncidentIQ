import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  mode: { type: String, enum: ["simulated", "external"], default: "simulated" },
  baseUrl: { type: String, default: "" },
  healthEndpoint: { type: String, default: "/health" },
  testEndpoint: { type: String, default: "/api/products" },
  controlKey: { type: String, default: "", select: false },
  status: {
    type: String,
    enum: ["healthy", "degraded", "down"],
    default: "healthy",
  },
  requestCount: { type: Number, default: 0 },
  errorCount: { type: Number, default: 0 },
  avgLatency: { type: Number, default: 100 },
  p95Latency: { type: Number, default: 150 },
  lastUpdated: { type: Date, default: Date.now },
  lastError: { type: String, default: "" },
});

export default mongoose.model("Service", schema);
