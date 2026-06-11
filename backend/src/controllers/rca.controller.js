import RCAReport from "../models/RCAReport.js";
import { generateRCA } from "../services/rcaEngine.service.js";
import { getGeminiStatus } from "../services/gemini.service.js";

export async function createRCA(req, res, next) {
  try {
    const provider = req.body.provider === "gemini" ? "gemini" : "rule-based";
    res.status(201).json(await generateRCA(provider));
  } catch (error) {
    next(error);
  }
}
export async function getLatestRCA(req, res, next) {
  try {
    res.json(await RCAReport.findOne().sort({ createdAt: -1 }).lean());
  } catch (error) {
    next(error);
  }
}
export async function getRCAs(req, res, next) {
  try {
    res.json(await RCAReport.find().sort({ createdAt: -1 }).limit(50).lean());
  } catch (error) {
    next(error);
  }
}
export async function getRCAQuota(req, res, next) {
  try {
    res.json(await getGeminiStatus());
  } catch (error) {
    next(error);
  }
}
