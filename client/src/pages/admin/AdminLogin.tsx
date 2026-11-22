import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router";
import { loginOwner } from "../../api/owner.api";
import Button from "../../components/ui/Button";
import TextField from "../../components/ui/TextField";
import { useOwnerStore } from "../../store/owner.store";
import { getApiErrorCode } from "../../utils/errorMessages";
import { cleanEmail } from "../../utils/sanitize";
import { ownerLoginSchema, type OwnerLoginForm } from "../../validators/owner.schema";

// ==========================================
// * OWNER LOGIN: email and password (both set in the server's .env)
// ==========================================
export default function AdminLogin() {
  const navigate = useNavigate();
  const session = useOwnerStore((state) => state.session);
  const setSession = useOwnerStore((state) => state.setSession);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OwnerLoginForm>({ resolver: zodResolver(ownerLoginSchema) });

  const submit = handleSubmit(async (values) => {
    setServerError("");
    try {
      setSession(await loginOwner(values.email, values.password));
      navigate("/admin", { replace: true });
    } catch (error) {
      setServerError(getApiErrorCode(error) === "RATE_LIMITED" ? "Too many attempts. Please wait 15 minutes." : "Wrong email or password.");
    }
  });

  if (session) return <Navigate to="/admin" replace />;

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <form onSubmit={submit} className="space-y-5 rounded-xl border border-line bg-panel p-6">
        <h1 className="font-serif text-3xl">Owner login</h1>
        <TextField label="Email" type="email" autoComplete="username" sanitize={cleanEmail} maxLength={254} error={errors.email?.message} {...register("email")} />
        <TextField label="Password" type="password" autoComplete="current-password" maxLength={128} error={errors.password?.message} {...register("password")} />
        {serverError && <p className="text-sm text-red-300">{serverError}</p>}
        <Button variant="primary" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Please wait..." : "Log in"}</Button>
      </form>
    </div>
  );
}
