import { Router } from "express";
import { getLogs, getRecent } from "../controllers/logs.controller.js";
const router = Router();
router.get("/", getLogs);
router.get("/recent", getRecent);
export default router;
