// * India time is used everywhere, whatever the visitor's device timezone is
export const getIstDate = (offsetDays = 0): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(Date.now() + offsetDays * 86400000));

export const formatTime12h = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`;
};

export const formatDateLabel = (date: string): string =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

export const formatDuration = (minutes: number): string => (minutes < 60 ? `${minutes} min` : `${minutes / 60} hr`);
export const formatPrice = (price: number): string => `₹${price}`;

export const formatClock = (iso: string): string =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).toUpperCase();
