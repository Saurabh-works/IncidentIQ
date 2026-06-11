import mongoose from "mongoose";

const schema = new mongoose.Schema({
  provider: { type: String, required: true },
  dateKey: { type: String, required: true },
  requestCount: { type: Number, default: 0 },
  promptTokens: { type: Number, default: 0 },
  outputTokens: { type: Number, default: 0 },
  totalTokens: { type: Number, default: 0 },
  fallbackCount: { type: Number, default: 0 },
  lastError: { type: String, default: "" },
  lastUsedAt: Date,
});

schema.index({ provider: 1, dateKey: 1 }, { unique: true });

export default mongoose.model("AIUsage", schema);
