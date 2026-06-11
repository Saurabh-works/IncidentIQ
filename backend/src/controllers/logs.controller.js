import Log from "../models/Log.js";
import { getRecentLogs } from "../services/cache.service.js";

export async function getLogs(req, res, next) {
  try {
    const { serviceName, level, traceId, search, limit = 100 } = req.query;
    const query = {};
    if (serviceName) query.serviceName = serviceName;
    if (level) query.level = level;
    if (traceId) query.traceId = { $regex: traceId, $options: "i" };
    if (search) query.message = { $regex: search, $options: "i" };
    res.json(
      await Log.find(query)
        .sort({ timestamp: -1 })
        .limit(Math.min(Number(limit), 500))
        .lean(),
    );
  } catch (error) {
    next(error);
  }
}
export async function getRecent(req, res, next) {
  try {
    res.json(await getRecentLogs());
  } catch (error) {
    next(error);
  }
}
