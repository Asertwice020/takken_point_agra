export type Profile = { id: string; email: string; name: string | null; phone: string | null };
export type MeResponse = { profile: Profile | null; isOwner: boolean };
