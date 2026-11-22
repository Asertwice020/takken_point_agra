import axios, { isAxiosError } from "axios";
import { useOwnerStore } from "../store/owner.store";
import { syncServerClock } from "../utils/serverClock";
import { supabase } from "./supabase";

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, timeout: 15000 });

const isOwnerUrl = (url?: string) => Boolean(url?.startsWith("/api/owner"));

// * Owner routes use the owner login token; everything else uses the customer's Supabase token
api.interceptors.request.use(async (config) => {
  if (isOwnerUrl(config.url)) {
    const owner = useOwnerStore.getState().session;
    if (owner) config.headers.Authorization = `Bearer ${owner.token}`;
    return config;
  }
  const { data } = await supabase.auth.getSession();
  if (data.session) config.headers.Authorization = `Bearer ${data.session.access_token}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    syncServerClock(String(response.headers["date"] ?? "")); // countdowns use the server's clock
    return response;
  },
  (error) => {
    // * An expired or invalid owner login sends the owner back to the login page
    const url = isAxiosError(error) ? error.config?.url : undefined;
    if (isAxiosError(error) && error.response?.status === 401 && isOwnerUrl(url) && url !== "/api/owner/login") useOwnerStore.getState().clear();
    return Promise.reject(error);
  },
);
