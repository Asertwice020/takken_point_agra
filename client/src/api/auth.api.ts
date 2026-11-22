import type { MeResponse, Profile } from "../types/auth.types";
import { api } from "./axios";

export const getMe = async (): Promise<MeResponse> => (await api.get("/api/auth/me")).data.data;

export const saveProfile = async (input: { name: string; phone: string }): Promise<Profile> =>
  (await api.put("/api/auth/profile", input)).data.data.profile;
