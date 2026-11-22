import { Outlet } from "react-router";
import Navbar from "./Navbar";

export default function AppLayout() {
  return (
    <div className="min-h-dvh">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
