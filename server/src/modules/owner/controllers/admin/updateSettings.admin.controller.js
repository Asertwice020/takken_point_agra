import { pool } from "../../../../config/db.js";
import { ApiResponse } from "../../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../../utils/basic/asyncHandler.js";
import { assertSettingsValid, mergeSettings } from "../../logic/settings.rules.js";

// * Partial update: send only what changes. The shop ON/OFF switch has its own route.
export const updateSettings = asyncHandler(async (req, res) => {
  const { rows: [current] } = await pool.query("SELECT * FROM settings WHERE id = 1");
  const merged = mergeSettings(current, req.body);
  assertSettingsValid(merged);

  const { rows: [settings] } = await pool.query(
    `UPDATE settings SET open_time = $1, close_time = $2, booking_days_ahead = $3, cutoff_minutes = $4,
       reschedule_cutoff_hours = $5, max_reschedules = $6, stations = $7 WHERE id = 1 RETURNING *`,
    [merged.open_time, merged.close_time, merged.booking_days_ahead, merged.cutoff_minutes, merged.reschedule_cutoff_hours, merged.max_reschedules, merged.stations]);
  res.json(new ApiResponse(200, "Settings saved", { settings }));
});





// import { pool } from "../../../../config/db.js";
// import { ApiResponse } from "../../../../utils/basic/ApiResponse.js";
// import { asyncHandler } from "../../../../utils/basic/asyncHandler.js";
// import { assertSettingsValid, mergeSettings } from "../../logic/settings.rules.js";

// // * Partial update: send only what changes. The shop ON/OFF switch has its own route.
// export const updateSettings = asyncHandler(async (req, res) => {
//   const { rows: [current] } = await pool.query("SELECT * FROM settings WHERE id = 1");
//   const merged = mergeSettings(current, req.body);
//   assertSettingsValid(merged);

//   const { rows: [settings] } = await pool.query(
//     `UPDATE settings SET open_time = $1, close_time = $2, booking_days_ahead = $3, cutoff_minutes = $4,
//        reschedule_cutoff_hours = $5, max_reschedules = $6 WHERE id = 1 RETURNING *`,
//     [merged.open_time, merged.close_time, merged.booking_days_ahead, merged.cutoff_minutes, merged.reschedule_cutoff_hours, merged.max_reschedules]);
//   res.json(new ApiResponse(200, "Settings saved", { settings }));
// });
