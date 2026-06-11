import { Router } from "express";
import { createRCA, getLatestRCA, getRCAQuota, getRCAs } from "../controllers/rca.controller.js";
const router = Router();
router.post("/generate", createRCA);
router.get("/latest", getLatestRCA);
router.get("/quota", getRCAQuota);
router.get("/", getRCAs);
export default router;
