import mongoose from "mongoose";

const schema = new mongoose.Schema({
  serviceName: { type: String, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  requestCount: Number,
  errorCount: Number,
  avgLatency: Number,
  p95Latency: Number,
  status: String,
});

export default mongoose.model("Metric", schema);
