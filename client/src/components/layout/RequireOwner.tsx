import { Navigate, Outlet } from "react-router";
import { useOwnerStore } from "../../store/owner.store";

// * Owner login required. The server checks the token again on every owner request.
export default function RequireOwner() {
  const session = useOwnerStore((state) => state.session);
  return session ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
