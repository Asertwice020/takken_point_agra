// * UPI deep link; the booking code in the note helps the owner match the bank statement
export const buildUpiLink = ({ upiId, payeeName, amount, ticketCode }) =>
  `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${Number(amount).toFixed(2)}&cu=INR&tn=${encodeURIComponent(`TP-${ticketCode}`)}`;
