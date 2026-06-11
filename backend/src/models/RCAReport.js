import mongoose from "mongoose";

const schema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  rootCause: String,
  affectedServices: [String],
  impact: String,
  evidence: [String],
  suggestedFixes: [String],
  preventionSteps: [String],
  rawSummary: String,
  requestedProvider: { type: String, default: "rule-based" },
  generatedBy: { type: String, default: "rule-based" },
  model: { type: String, default: "" },
  usage: {
    promptTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
  },
  fallbackReason: { type: String, default: "" },
});

export default mongoose.model("RCAReport", schema);
