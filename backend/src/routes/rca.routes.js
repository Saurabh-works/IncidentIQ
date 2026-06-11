import { Router } from "express";
import { createRCA, getLatestRCA, getRCAs } from "../controllers/rca.controller.js";
const router = Router();
router.post("/generate", createRCA);
router.get("/latest", getLatestRCA);
router.get("/", getRCAs);
export default router;
