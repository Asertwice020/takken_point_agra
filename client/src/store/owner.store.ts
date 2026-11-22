import { create } from "zustand";

// * The owner's login (separate from the customers' Supabase login). Kept in sessionStorage: closing the tab logs out.
export type OwnerSession = { token: string; email: string; expiresAt: number };

const STORAGE_KEY = "tpa-owner-session";

const readSession = (): OwnerSession | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const session = raw ? (JSON.parse(raw) as OwnerSession) : null;
    return session && session.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
};

type OwnerState = { session: OwnerSession | null; setSession: (session: OwnerSession) => void; clear: () => void };

export const useOwnerStore = create<OwnerState>((set) => ({
  session: readSession(),
  setSession: (session) => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session)); } catch { /* storage blocked: stays logged in until refresh */ }
    set({ session });
  },
  clear: () => {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    set({ session: null });
  },
}));
