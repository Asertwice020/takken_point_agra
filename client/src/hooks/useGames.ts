import { getGames } from "../api/game.api";
import { useFetch } from "./useFetch";

export const useGames = () => useFetch(getGames, []);
