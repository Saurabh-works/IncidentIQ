import Metric from "../models/Metric.js";
import { getLatestMetrics } from "../services/cache.service.js";

export async function getMetrics(req, res, next) {
  try {
    const query = req.query.serviceName
      ? { serviceName: req.query.serviceName }
      : {};
    res.json(
      (
        await Metric.find(query)
          .sort({ timestamp: -1 })
          .limit(Math.min(Number(req.query.limit || 300), 1000))
          .lean()
      ).reverse(),
    );
  } catch (error) {
    next(error);
  }
}
export async function getLatest(req, res, next) {
  try {
    res.json((await getLatestMetrics()) || []);
  } catch (error) {
    next(error);
  }
}
export async function getServiceMetrics(req, res, next) {
  try {
    res.json(
      (
        await Metric.find({ serviceName: req.params.serviceName })
          .sort({ timestamp: -1 })
          .limit(200)
          .lean()
      ).reverse(),
    );
  } catch (error) {
    next(error);
  }
}
