import { pool } from "../../../../config/db.js";
import { ApiResponse } from "../../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../../utils/basic/asyncHandler.js";

export const getSettings = asyncHandler(async (req, res) => {
  const { rows: [settings] } = await pool.query("SELECT * FROM settings WHERE id = 1");
  res.json(new ApiResponse(200, "Settings", { settings }));
});
