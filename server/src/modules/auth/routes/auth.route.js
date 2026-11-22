import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import { profileRateLimit } from "../../../middlewares/rateLimit.middleware.js";
import { adminLogin, getMyProfile, saveMyProfile } from "../controllers/index.js";
import { validateAdminLogin, validateSaveProfile } from "../validators/index.js";

const router = Router();

// ==========================================
// * 1. PUBLIC AUTH ROUTES
// ==========================================
router.post("/admin/login", validateAdminLogin, adminLogin);

// ==========================================
// * 2. LOGGED-IN ROUTES
// ==========================================
router.get("/me", requireAuth, getMyProfile);
router.put("/profile", requireAuth, profileRateLimit, validateSaveProfile, saveMyProfile);

export default router;
