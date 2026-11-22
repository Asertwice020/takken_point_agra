import { useState } from "react";
import { useAuthStore } from "../../store/auth.store";
import LoginModal from "../modals/LoginModal";
import Button from "../ui/Button";
import NavShell from "./NavShell";

// * Customer navigation. There is no link to the admin area here: owners open /admin directly.
export default function Navbar() {
  const { isReady, session, signOut } = useAuthStore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const actions = !isReady ? null : session
    ? <Button className="px-3 py-1.5" onClick={() => void signOut()}>Log out</Button>
    : <Button className="px-3 py-1.5" onClick={() => setIsLoginOpen(true)}>Log in</Button>;

  return (
    <>
      <NavShell brandTo="/" links={session ? [{ label: "My tickets", to: "/tickets" }] : []} actions={actions} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={() => setIsLoginOpen(false)} />
    </>
  );
}
