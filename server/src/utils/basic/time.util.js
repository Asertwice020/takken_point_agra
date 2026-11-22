// * Single source of truth for time. India has no daylight saving (always +05:30).
export const IST_TIMEZONE = "Asia/Kolkata";

export const getTodayIst = (now = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: IST_TIMEZONE }).format(now); // "YYYY-MM-DD"

export const addDaysToDateString = (dateString, days) => {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (totalMinutes) =>
  `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;

export const toSlotStartDate = (dateString, time) =>
  new Date(`${dateString}T${minutesToTime(timeToMinutes(time))}:00+05:30`);

export const formatTime12h = (time) => {
  const totalMinutes = timeToMinutes(time);
  const hours = Math.floor(totalMinutes / 60);
  return `${hours % 12 || 12}:${String(totalMinutes % 60).padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`;
};

export const formatDateLabel = (dateString) =>
  new Date(`${dateString}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
