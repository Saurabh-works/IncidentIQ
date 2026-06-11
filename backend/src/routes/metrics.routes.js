import { Router } from "express";
import { getLatest, getMetrics, getServiceMetrics } from "../controllers/metrics.controller.js";
const router = Router();
router.get("/", getMetrics);
router.get("/latest", getLatest);
router.get("/:serviceName", getServiceMetrics);
export default router;
