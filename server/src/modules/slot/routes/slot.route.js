import { Router } from "express";
import { getSlots } from "../controllers/index.js";
import { validateGetSlots } from "../validators/index.js";

const router = Router();

// ==========================================
// * 1. PUBLIC ROUTES (Unguarded)
// ==========================================
router.get("/", validateGetSlots, getSlots);

export default router;
