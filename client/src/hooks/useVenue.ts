import { getVenue } from "../api/venue.api";
import { useFetch } from "./useFetch";

export const useVenue = () => useFetch(getVenue, []);
