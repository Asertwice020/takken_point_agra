import cron from "node-cron";
import { expireStaleBookings } from "../logic/expireStaleBookings.js";
import { sendDueReminders } from "../logic/sendDueReminders.js";

// ==========================================
// * EVERY MINUTE: expire stale holds, send due reminders
// * Run ONE server instance only, or reminders would be sent twice.
// ==========================================
let isRunning = false;

export const startBookingJobs = () => {
  cron.schedule("* * * * *", async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      await expireStaleBookings();
      await sendDueReminders();
    } catch (error) {
      console.error("Booking job failed:", error.message);
    } finally {
      isRunning = false;
    }
  });
};
