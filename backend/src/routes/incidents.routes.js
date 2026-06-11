import { Router } from "express";
import { getActiveIncidents, getIncidents, inject, resolve } from "../controllers/incidents.controller.js";
const router = Router();
router.get("/", getIncidents);
router.get("/active", getActiveIncidents);
router.post("/inject", inject);
router.patch("/:id/resolve", resolve);
export default router;
