import { Router } from "express";
import { getVenue } from "../controllers/index.js";

const router = Router();

// ==========================================
// * 1. PUBLIC ROUTES (Unguarded)
// ==========================================
router.get("/", getVenue);

export default router;
