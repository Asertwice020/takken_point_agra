import { Outlet, useNavigate } from "react-router";
import { useOwnerStore } from "../../store/owner.store";
import Button from "../ui/Button";
import NavShell from "./NavShell";

export default function AdminLayout() {
  const session = useOwnerStore((state) => state.session);
  const clear = useOwnerStore((state) => state.clear);
  const navigate = useNavigate();

  const logout = () => { clear(); navigate("/admin/login"); };

  return (
    <div className="min-h-dvh">
      <NavShell
        brandTo={session ? "/admin" : "/admin/login"}
        tag="Admin"
        links={session ? [{ label: "Dashboard", to: "/admin" }] : []}
        actions={session ? <Button className="px-3 py-1.5" onClick={logout}>Log out</Button> : null}
      />
      <main><Outlet /></main>
    </div>
  );
}
