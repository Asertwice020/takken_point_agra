import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import { bookingRateLimit, statusRateLimit } from "../../../middlewares/rateLimit.middleware.js";
import { createBooking, getBookingStatus, getMyBookings, markBookingPaid, rescheduleBooking } from "../controllers/index.js";
import { validateBookingId, validateCreateBooking, validateMarkPaid, validateRescheduleBooking } from "../validators/index.js";

const router = Router();

// ==========================================
// * 1. LOGGED-IN ROUTES
// ==========================================
router.post("/", requireAuth, bookingRateLimit, validateCreateBooking, createBooking);
router.get("/mine", requireAuth, getMyBookings);
router.get("/:id/status", requireAuth, statusRateLimit, validateBookingId, getBookingStatus);
router.post("/:id/paid", requireAuth, bookingRateLimit, validateMarkPaid, markBookingPaid);
router.post("/:id/reschedule", requireAuth, bookingRateLimit, validateRescheduleBooking, rescheduleBooking);

export default router;
