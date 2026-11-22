import { pool } from "../../../config/db.js";
import { BOOKING_STATUS, MAX_REMINDER_EMAILS, REMINDER_INTERVAL_MINUTES } from "../../../constants.js";
import { notifyOwnerReminder } from "./bookingNotifications.js";

// * Claims due bookings in one atomic UPDATE (so a reminder is never sent twice), then emails the owner.
// * Only while the shop is ON; up to 3 reminders, 10 minutes apart.
export const sendDueReminders = async () => {
  const { rows } = await pool.query(
    `UPDATE bookings SET reminder_count = reminder_count + 1, last_reminder_at = now()
     WHERE status = $1 AND reminder_count < $2 AND last_reminder_at IS NOT NULL
       AND last_reminder_at <= now() - make_interval(mins => $3)
       AND (SELECT shop_open FROM settings WHERE id = 1)
     RETURNING id, reminder_count`,
    [BOOKING_STATUS.AWAITING_CONFIRMATION, MAX_REMINDER_EMAILS, REMINDER_INTERVAL_MINUTES]);
  await Promise.all(rows.map((row) => notifyOwnerReminder(row.id, row.reminder_count)));
  return rows.length;
};
