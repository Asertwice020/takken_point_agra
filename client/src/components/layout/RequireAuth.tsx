import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../store/auth.store";

// * Logged-in customers only. Not logged in: back to Home.
export default function RequireAuth() {
  const { isReady, session } = useAuthStore();
  if (!isReady) return <div className="mx-auto max-w-md px-4 py-16"><div className="h-10 w-48 animate-pulse rounded-md bg-hover" /></div>;
  return session ? <Outlet /> : <Navigate to="/" replace />;
}
