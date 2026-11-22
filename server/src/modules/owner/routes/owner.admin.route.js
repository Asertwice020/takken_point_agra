import { Router } from "express";
import { requireOwnerSession } from "../../../middlewares/ownerSession.middleware.js";
import { ownerLoginRateLimit } from "../../../middlewares/rateLimit.middleware.js";
import {
  blockSeats, confirmBooking, createGame, deleteBlockedSeat, getBlockedSeats, getOwnerBookings, getOwnerGames,
  getSettings, loginOwner, rejectBooking, revealBookingUtr, setGameDurations, setShopStatus, updateGame, updateSettings, validateTicket,
} from "../controllers/admin/index.js";
import {
  validateBlockSeats, validateBlockedSeatsQuery, validateCreateGame, validateOwnerBookingId, validateOwnerBookingsQuery, validateOwnerLogin,
  validateSetGameDurations, validateSetShopStatus, validateTicketScan, validateUpdateGame, validateUpdateSettings,
} from "../validators/index.js";

const router = Router();

// ==========================================
// * 1. OPEN ROUTE: owner login (email + password from .env)
// ==========================================
router.post("/login", ownerLoginRateLimit, validateOwnerLogin, loginOwner);

// ==========================================
// * 2. EVERYTHING BELOW NEEDS THE OWNER LOGIN TOKEN
// ==========================================
router.use(requireOwnerSession);

router.get("/bookings", validateOwnerBookingsQuery, getOwnerBookings);
router.get("/bookings/:id/utr", validateOwnerBookingId, revealBookingUtr);
router.post("/bookings/:id/confirm", validateOwnerBookingId, confirmBooking);
router.post("/bookings/:id/reject", validateOwnerBookingId, rejectBooking);
router.post("/tickets/validate", validateTicketScan, validateTicket);
router.put("/shop", validateSetShopStatus, setShopStatus);

router.get("/settings", getSettings);
router.put("/settings", validateUpdateSettings, updateSettings);
router.get("/games", getOwnerGames);
router.post("/games", validateCreateGame, createGame);
router.put("/games/:id", validateUpdateGame, updateGame);
router.put("/games/:id/durations", validateSetGameDurations, setGameDurations);
router.get("/blocked-seats", validateBlockedSeatsQuery, getBlockedSeats);
router.post("/blocked-seats", validateBlockSeats, blockSeats);
router.delete("/blocked-seats/:id", validateOwnerBookingId, deleteBlockedSeat);

export default router;





// import { Router } from "express";
// import { requireAuth, requireOwner } from "../../../middlewares/auth.middleware.js";
// import {
//   blockSeats, confirmBooking, createGame, deleteBlockedSeat, getBlockedSeats, getOwnerBookings, getOwnerGames,
//   getSettings, rejectBooking, revealBookingUtr, setGameDurations, setShopStatus, updateGame, updateSettings, validateTicket,
// } from "../controllers/admin/index.js";
// import {
//   validateBlockSeats, validateBlockedSeatsQuery, validateCreateGame, validateOwnerBookingId, validateOwnerBookingsQuery,
//   validateSetGameDurations, validateSetShopStatus, validateTicketScan, validateUpdateGame, validateUpdateSettings,
// } from "../validators/index.js";

// const router = Router();
// router.use(requireAuth, requireOwner);

// // ==========================================
// // * 1. BOOKINGS, TICKETS, SHOP SWITCH
// // ==========================================
// router.get("/bookings", validateOwnerBookingsQuery, getOwnerBookings);
// router.get("/bookings/:id/utr", validateOwnerBookingId, revealBookingUtr);
// router.post("/bookings/:id/confirm", validateOwnerBookingId, confirmBooking);
// router.post("/bookings/:id/reject", validateOwnerBookingId, rejectBooking);
// router.post("/tickets/validate", validateTicketScan, validateTicket);
// router.put("/shop", validateSetShopStatus, setShopStatus);

// // ==========================================
// // * 2. SETTINGS, GAMES, BLOCKED SEATS
// // ==========================================
// router.get("/settings", getSettings);
// router.put("/settings", validateUpdateSettings, updateSettings);
// router.get("/games", getOwnerGames);
// router.post("/games", validateCreateGame, createGame);
// router.put("/games/:id", validateUpdateGame, updateGame);
// router.put("/games/:id/durations", validateSetGameDurations, setGameDurations);
// router.get("/blocked-seats", validateBlockedSeatsQuery, getBlockedSeats);
// router.post("/blocked-seats", validateBlockSeats, blockSeats);
// router.delete("/blocked-seats/:id", validateOwnerBookingId, deleteBlockedSeat);

// export default router;
