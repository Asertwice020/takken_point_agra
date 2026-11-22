import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import AdminLayout from "./components/layout/AdminLayout";
import AppLayout from "./components/layout/AppLayout";
import RequireAuth from "./components/layout/RequireAuth";
import RequireOwner from "./components/layout/RequireOwner";
import Home from "./pages/public/Home";
import MyTickets from "./pages/user/MyTickets";
import Payment from "./pages/user/Payment";
import { initAuth } from "./store/auth.store";

// * Admin pages are loaded only when someone opens them, so customers never download them
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const PageFallback = () => <div className="mx-auto max-w-5xl px-4 py-16"><div className="h-10 w-48 animate-pulse rounded-md bg-hover" /></div>;

export default function App() {
  useEffect(() => initAuth(), []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* ========================================== */}
          {/* * 1. PUBLIC ROUTES (Unguarded) */}
          {/* ========================================== */}
          <Route path="/" element={<Home />} />

          {/* ========================================== */}
          {/* * 2. LOGGED-IN CUSTOMER ROUTES */}
          {/* ========================================== */}
          <Route element={<RequireAuth />}>
            <Route path="/booking/:id" element={<Payment />} />
            <Route path="/tickets" element={<MyTickets />} />
          </Route>
        </Route>

        {/* ========================================== */}
        {/* * 3. ADMIN ROUTES (own layout, own login) */}
        {/* ========================================== */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/login" element={<Suspense fallback={<PageFallback />}><AdminLogin /></Suspense>} />
          <Route element={<RequireOwner />}>
            <Route path="/admin" element={<Suspense fallback={<PageFallback />}><Dashboard /></Suspense>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
