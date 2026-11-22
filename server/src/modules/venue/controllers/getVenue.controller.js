import { pool } from "../../../config/db.js";
import { ApiResponse } from "../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../utils/basic/asyncHandler.js";

// * Public: what the website needs to show the Open/Closed label, hours and date tabs
export const getVenue = asyncHandler(async (req, res) => {
  const { rows: [settings] } = await pool.query("SELECT shop_open, open_time, close_time, booking_days_ahead FROM settings WHERE id = 1");
  res.json(new ApiResponse(200, "Venue", {
    venue: {
      shopOpen: settings.shop_open, openTime: settings.open_time,
      closeTime: settings.close_time, bookingDaysAhead: settings.booking_days_ahead,
    },
  }));
});
