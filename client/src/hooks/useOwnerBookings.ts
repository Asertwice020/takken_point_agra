import { getOwnerBookings } from "../api/owner.api";
import { useFetch } from "./useFetch";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// * Bookings for one day. Does nothing until the date field holds a complete valid date.
export const useOwnerBookings = (date: string) => useFetch(() => getOwnerBookings({ date }), [date], DATE_PATTERN.test(date));
