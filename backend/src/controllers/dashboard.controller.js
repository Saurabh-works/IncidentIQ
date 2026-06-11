import { buildSummary } from "../services/runtime.service.js";
import {
  getDashboardSummary,
  setDashboardSummary,
} from "../services/cache.service.js";

export async function getSummary(req, res, next) {
  try {
    const cached = await getDashboardSummary();
    if (cached) return res.json(cached);
    const summary = buildSummary();
    await setDashboardSummary(summary);
    res.json(summary);
  } catch (error) {
    next(error);
  }
}
