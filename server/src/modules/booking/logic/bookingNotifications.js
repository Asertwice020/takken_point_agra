import { pool } from "../../../config/db.js";
import { sendOwnerPaymentAlert, sendRescheduleEmail, sendTicketEmails } from "../../../services/mail.service.js";

const loadBookingForEmail = async (bookingId) => {
  const { rows: [booking] } = await pool.query(
    `SELECT b.*, g.name AS game_name, p.name AS customer_name, p.email AS customer_email, p.phone AS customer_phone
     FROM bookings b JOIN games g ON g.id = b.game_id JOIN profiles p ON p.id = b.user_id WHERE b.id = $1`, [bookingId]);
  return booking;
};

const logNotificationError = (error) => console.error("Notification failed:", error.message);

// * Fire-and-forget: callers do not wait for emails
export const notifyOwnerOfPayment = (bookingId) => loadBookingForEmail(bookingId).then(sendOwnerPaymentAlert).catch(logNotificationError);
export const notifyOwnerReminder = (bookingId, reminderNumber) =>
  loadBookingForEmail(bookingId).then((booking) => sendOwnerPaymentAlert(booking, reminderNumber)).catch(logNotificationError);
export const notifyTicketConfirmed = (bookingId) => loadBookingForEmail(bookingId).then(sendTicketEmails).catch(logNotificationError);
export const notifyRescheduled = (bookingId, previous) =>
  loadBookingForEmail(bookingId).then((booking) => sendRescheduleEmail(booking, previous)).catch(logNotificationError);
