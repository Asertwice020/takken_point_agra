import { Router } from "express";
import { getGames } from "../controllers/index.js";

const router = Router();

// ==========================================
// * 1. PUBLIC ROUTES (Unguarded)
// ==========================================
router.get("/", getGames);

export default router;
