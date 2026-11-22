import { BRAND_NAME, MAX_REMINDER_EMAILS } from "../constants.js";
import { escapeHtml } from "../utils/basic/escapeHtml.util.js";
import { formatDateLabel, formatTime12h, minutesToTime, timeToMinutes } from "../utils/basic/time.util.js";

// ==========================================
// * PURE EMAIL TEMPLATES (Notion-inspired dark mode)
// ==========================================
const slotLabel = (booking) => {
  const endTime = minutesToTime(timeToMinutes(booking.start_time) + booking.duration_minutes);
  return `${formatDateLabel(booking.booking_date)}, ${formatTime12h(booking.start_time)} to ${formatTime12h(endTime)}`;
};

const statusBadge = (text, type = "default") => {
  const styles = {
    green: "background-color: rgba(46, 133, 64, 0.18); color: #57ab5a; border: 1px solid rgba(46, 133, 64, 0.3);",
    yellow: "background-color: rgba(187, 128, 9, 0.18); color: #e3b341; border: 1px solid rgba(187, 128, 9, 0.3);",
    orange: "background-color: rgba(240, 121, 43, 0.15); color: #F0792B; border: 1px solid rgba(240, 121, 43, 0.3);",
    default: "background-color: rgba(255, 255, 255, 0.06); color: #9B9B9B; border: 1px solid rgba(255, 255, 255, 0.094);",
  };
  const style = styles[type] || styles.default;
  return `<span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; font-family: 'Inter', -apple-system, sans-serif; letter-spacing: 0.3px; ${style}">${escapeHtml(text)}</span>`;
};

const primaryButton = (text, href) =>
  `<a href="${escapeHtml(href)}" style="display: inline-block; background-color: #F0792B; color: #191919; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 18px; border-radius: 6px; font-family: 'Inter', -apple-system, sans-serif; margin-top: 16px; letter-spacing: 0.2px;">${escapeHtml(text)}</a>`;

const infoTable = (rows) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0; border: 1px solid rgba(255, 255, 255, 0.094); border-radius: 6px; background-color: rgba(255, 255, 255, 0.02); border-spacing: 0;">
    ${rows
      .map(
        ([label, value], idx) => `
      <tr>
        <td style="padding: 10px 14px; font-size: 12px; color: #9B9B9B; font-family: 'Inter', -apple-system, sans-serif; ${idx < rows.length - 1 ? "border-bottom: 1px solid rgba(255, 255, 255, 0.06);" : ""} width: 38%; vertical-align: top;">${label}</td>
        <td style="padding: 10px 14px; font-size: 13px; color: rgba(255, 255, 255, 0.88); font-weight: 500; font-family: 'Inter', -apple-system, sans-serif; ${idx < rows.length - 1 ? "border-bottom: 1px solid rgba(255, 255, 255, 0.06);" : ""} text-align: right; vertical-align: top;">${value}</td>
      </tr>
    `
      )
      .join("")}
  </table>`;

const wrapEmail = (title, bodyHtml, badgeHtml = "") =>
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin: 0; padding: 32px 12px; background-color: #191919; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: rgba(255, 255, 255, 0.81); -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing: 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #202020; border: 1px solid rgba(255, 255, 255, 0.094); border-radius: 8px; border-spacing: 0; text-align: left;">
          <tr>
            <td style="padding: 28px 24px;">
              <!-- Header Brand & Badge -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing: 0; margin-bottom: 16px;">
                <tr>
                  <td style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #9B9B9B; font-family: 'Inter', -apple-system, sans-serif;">
                    ${BRAND_NAME}
                  </td>
                  <td style="text-align: right;">
                    ${badgeHtml}
                  </td>
                </tr>
              </table>

              <!-- Serif Heading -->
              <h2 style="font-family: 'Newsreader', Georgia, Cambria, 'Times New Roman', serif; font-size: 24px; font-weight: 500; color: rgba(255, 255, 255, 0.94); margin: 0 0 16px; line-height: 1.3;">
                ${escapeHtml(title)}
              </h2>

              <!-- Body HTML -->
              <div style="font-size: 14px; line-height: 1.6; color: rgba(255, 255, 255, 0.81);">
                ${bodyHtml}
              </div>

              <!-- Footer -->
              <div style="border-top: 1px solid rgba(255, 255, 255, 0.094); margin-top: 28px; padding-top: 16px; font-size: 12px; color: #9B9B9B; line-height: 1.5; font-family: 'Inter', -apple-system, sans-serif;">
                ${BRAND_NAME}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export const buildTicketEmail = ({ booking }) => ({
  subject: `Your ticket: ${booking.game_name}, ${formatTime12h(booking.start_time)}`,
  html: wrapEmail(
    "Booking confirmed",
    `
    <div style="margin-bottom: 12px;">
      <p style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: rgba(255, 255, 255, 0.92);">${escapeHtml(booking.game_name)}</p>
      <p style="margin: 0; font-size: 13px; color: #9B9B9B;">${escapeHtml(slotLabel(booking))}</p>
    </div>

    ${infoTable([
      ["Customer", escapeHtml(booking.customer_name)],
      ["Amount Paid", `₹${booking.amount}`],
      ["Ticket Code", `<span style="font-family: monospace; font-weight: 600; color: rgba(255, 255, 255, 0.95);">${escapeHtml(booking.ticket_code)}</span>`],
    ])}

    <div style="text-align: center; margin: 24px 0 16px;">
      <div style="display: inline-block; background-color: #ffffff; padding: 12px; border-radius: 6px;">
        <img src="cid:ticket-qr" alt="Ticket QR" width="180" height="180" style="display: block; margin: 0 auto;">
      </div>
      <p style="margin: 10px 0 0; font-size: 12px; color: #9B9B9B;">
        Ticket code: <b style="color: rgba(255, 255, 255, 0.9); font-family: monospace;">${escapeHtml(booking.ticket_code)}</b>
      </p>
    </div>

    <p style="color: #9B9B9B; font-size: 12px; margin: 16px 0 0; line-height: 1.5;">
      Show this QR at the counter. The slot time is fixed, so late arrivals lose that time.
    </p>`,
    statusBadge("CONFIRMED", "green")
  ),
});

export const buildOwnerPaymentAlertEmail = ({ booking, dashboardUrl, reminderNumber = 0 }) => ({
  subject: `${reminderNumber ? `Reminder ${reminderNumber} of ${MAX_REMINDER_EMAILS}: ` : ""}Payment to confirm: ₹${booking.amount} (${booking.ticket_code})`,
  html: wrapEmail(
    "New payment waiting",
    `
    <div style="margin-bottom: 12px;">
      <p style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: rgba(255, 255, 255, 0.92);">${escapeHtml(booking.game_name)}</p>
      <p style="margin: 0; font-size: 13px; color: #9B9B9B;">${escapeHtml(slotLabel(booking))}</p>
    </div>

    ${infoTable([
      ["Customer", `${escapeHtml(booking.customer_name)} (${escapeHtml(booking.customer_phone)})`],
      ["Amount", `₹${booking.amount}`],
      ["Payment note", `TP-${escapeHtml(booking.ticket_code)}`],
      ["UTR", `<span style="font-family: monospace; font-weight: 600; color: rgba(255, 255, 255, 0.95);">${escapeHtml(booking.utr)}</span>`],
    ])}

    <div style="margin-top: 18px;">
      ${primaryButton("Open dashboard", dashboardUrl)}
    </div>`,
    statusBadge(reminderNumber ? `REMINDER ${reminderNumber} OF ${MAX_REMINDER_EMAILS}` : "WAITING", "yellow")
  ),
});

export const buildWaitingSummaryEmail = ({ count, dashboardUrl }) => ({
  subject: `${count} booking${count === 1 ? "" : "s"} waiting for confirmation`,
  html: wrapEmail(
    "Shop is open",
    `
    <p style="margin: 0 0 16px; color: rgba(255, 255, 255, 0.81); line-height: 1.6;">
      ${count} payment${count === 1 ? " is" : "s are"} waiting for your confirmation.
    </p>
    <div style="margin-top: 18px;">
      ${primaryButton("Open dashboard", dashboardUrl)}
    </div>`,
    statusBadge("SHOP OPEN", "green")
  ),
});

export const buildRescheduleEmail = ({ booking, previous }) => ({
  subject: `Booking rescheduled: ${booking.game_name}, ${formatTime12h(booking.start_time)}`,
  html: wrapEmail(
    "Booking rescheduled",
    `
    <div style="margin-bottom: 12px;">
      <p style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: rgba(255, 255, 255, 0.92);">${escapeHtml(booking.game_name)}</p>
      <p style="margin: 0; font-size: 13px; color: #9B9B9B;">Customer: ${escapeHtml(booking.customer_name)}</p>
    </div>

    ${infoTable([
      ["Previous Slot", `<span style="color: #9B9B9B;">${escapeHtml(slotLabel(previous))}</span>`],
      ["New Slot", `<b style="color: rgba(255, 255, 255, 0.95);">${escapeHtml(slotLabel(booking))}</b>`],
      ["Ticket Code", `<span style="font-family: monospace; font-weight: 600; color: rgba(255, 255, 255, 0.95);">${escapeHtml(booking.ticket_code)}</span>`],
    ])}

    <p style="color: #9B9B9B; font-size: 12px; margin: 16px 0 0; line-height: 1.5;">
      Ticket code: <b>${escapeHtml(booking.ticket_code)}</b> (the QR code stays the same).
    </p>`,
    statusBadge("RESCHEDULED", "orange")
  ),
});
