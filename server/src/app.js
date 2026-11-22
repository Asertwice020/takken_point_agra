import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env.js";
import { ApiResponse } from "./utils/basic/ApiResponse.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { authRoutes } from "./modules/auth/routes/index.js";
import { gameRoutes } from "./modules/game/routes/index.js";
import { slotRoutes } from "./modules/slot/routes/index.js";
import { venueRoutes } from "./modules/venue/routes/index.js";
import { bookingRoutes } from "./modules/booking/routes/index.js";
import { ownerRoutes } from "./modules/owner/routes/index.js";

export const app = express();

app.set("trust proxy", 1); // hosting providers sit behind a proxy; needed for correct rate limiting
app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json());

// ==========================================
// * 1. PUBLIC ROUTES (Unguarded)
// ==========================================
app.get("/api/health", (req, res) => res.json(new ApiResponse(200, "OK")));
app.use("/api/games", gameRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/venue", venueRoutes);

// ==========================================
// * 2. LOGGED-IN ROUTES
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);

// ==========================================
// * 3. OWNER ROUTES (Owner only)
// ==========================================
app.use("/api/owner", ownerRoutes);

app.use(errorMiddleware);
