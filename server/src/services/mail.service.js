import nodemailer from "nodemailer";
import QRCode from "qrcode";
import { env } from "../config/env.js";
import { BRAND_NAME } from "../constants.js";
import { buildOwnerPaymentAlertEmail, buildRescheduleEmail, buildTicketEmail, buildWaitingSummaryEmail } from "./mail.templates.js";

// ==========================================
// * GMAIL SMTP (Nodemailer)
// ==========================================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", port: 465, secure: true,
  auth: { user: env.gmailUser, pass: env.gmailAppPassword },
});

// * Never throws: an email problem must not break a booking
const sendMail = async (message) => {
  try {
    await transporter.sendMail({ from: `"${BRAND_NAME}" <${env.gmailUser}>`, ...message });
  } catch (error) {
    console.error(`Email failed (${message.subject}):`, error.message);
  }
};

const dashboardUrl = `${env.clientOrigin}/admin`;

export const sendTicketEmails = async (booking) => {
  const qrImage = await QRCode.toBuffer(booking.ticket_code, { margin: 1, width: 240 });
  return sendMail({
    to: booking.customer_email, bcc: env.ownerEmails, ...buildTicketEmail({ booking }),
    attachments: [{ filename: "ticket-qr.png", content: qrImage, cid: "ticket-qr" }],
  });
};

export const sendOwnerPaymentAlert = (booking, reminderNumber = 0) =>
  sendMail({ to: env.ownerEmails, ...buildOwnerPaymentAlertEmail({ booking, dashboardUrl, reminderNumber }) });

export const sendWaitingSummary = (count) =>
  sendMail({ to: env.ownerEmails, ...buildWaitingSummaryEmail({ count, dashboardUrl }) });

export const sendRescheduleEmail = (booking, previous) =>
  sendMail({ to: booking.customer_email, bcc: env.ownerEmails, ...buildRescheduleEmail({ booking, previous }) });
