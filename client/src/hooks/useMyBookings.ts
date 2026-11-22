import { getMyBookings } from "../api/booking.api";
import { useFetch } from "./useFetch";

// * Only loads for logged-in customers, and never shows a previous user's bookings
export const useMyBookings = (isEnabled: boolean) => {
  const { data, isLoading, hasError, reload } = useFetch(getMyBookings, [], isEnabled);
  return { data: isEnabled ? data : null, isLoading, hasError, reload };
};
