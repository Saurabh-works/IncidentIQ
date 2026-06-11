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
});

export default mongoose.model("RCAReport", schema);
