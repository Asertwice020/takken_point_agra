import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { getMe } from "../api/auth.api";
import { supabase } from "../api/supabase";
import type { Profile } from "../types/auth.types";

type AuthState = {
  isReady: boolean;
  session: Session | null;
  profile: Profile | null;
  isOwner: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  isReady: false,
  session: null,
  profile: null,
  isOwner: false,
  refresh: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      set({ session: null, profile: null, isOwner: false, isReady: true });
      return;
    }
    try {
      const me = await getMe();
      set({ session: data.session, profile: me.profile, isOwner: me.isOwner, isReady: true });
    } catch {
      set({ session: data.session, isReady: true });
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null, isOwner: false });
  },
}));

// * Called once from App. The timeout keeps Supabase calls out of its own callback.
export const initAuth = () => {
  void useAuthStore.getState().refresh();
  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_IN" || event === "SIGNED_OUT") setTimeout(() => void useAuthStore.getState().refresh(), 0);
  });
  return () => data.subscription.unsubscribe();
};
