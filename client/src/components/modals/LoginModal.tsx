import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../api/supabase";
import { useAuthStore } from "../../store/auth.store";
import { cleanEmail, sanitizeOtp } from "../../utils/sanitize";
import { emailSchema, otpSchema, type EmailForm, type OtpForm } from "../../validators/auth.schema";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import TextField from "../ui/TextField";

type LoginModalProps = { isOpen: boolean; onClose: () => void; onSuccess: () => void };

// ==========================================
// * EMAIL OTP LOGIN (Supabase sends the code)
// ==========================================
export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [email, setEmail] = useState<string | null>(null);
  const [serverError, setServerError] = useState("");
  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const codeForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });

  const reset = () => { setEmail(null); setServerError(""); emailForm.reset(); codeForm.reset(); };
  const close = () => { reset(); onClose(); };

  const sendCode = emailForm.handleSubmit(async (values) => {
    setServerError("");
    const { error } = await supabase.auth.signInWithOtp({ email: values.email, options: { shouldCreateUser: true } });
    if (error) return setServerError("Could not send the code. Please wait a minute and try again.");
    setEmail(values.email);
  });

  const verifyCode = codeForm.handleSubmit(async (values) => {
    if (!email) return;
    setServerError("");
    const { error } = await supabase.auth.verifyOtp({ email, token: values.code, type: "email" });
    if (error) return setServerError("That code is not correct or has expired.");
    await useAuthStore.getState().refresh();
    reset();
    onSuccess();
  });

  return (
    <Modal isOpen={isOpen} title={email ? "Enter your code" : "Log in"} onClose={close}>
      {email ? (
        <form key="code-step" onSubmit={verifyCode} className="space-y-5">
          <p className="text-sm text-muted">We sent a code to {email}.</p>
          <TextField label="Code" variant="code" sanitize={sanitizeOtp} maxLength={8} inputMode="numeric" autoComplete="one-time-code" autoFocus placeholder="000000" error={codeForm.formState.errors.code?.message} {...codeForm.register("code")} />
          {serverError && <p className="text-sm text-red-300">{serverError}</p>}
          <Button variant="primary" className="w-full" disabled={codeForm.formState.isSubmitting}>Verify</Button>
          <button type="button" className="w-full text-xs text-muted hover:text-ink" onClick={reset}>Use a different email</button>
        </form>
      ) : (
        <form key="email-step" onSubmit={sendCode} className="space-y-5">
          <p className="text-sm text-muted">We will email you a login code. No password needed.</p>
          <TextField label="Email" type="email" sanitize={cleanEmail} maxLength={254} autoComplete="email" autoFocus placeholder="you@example.com" error={emailForm.formState.errors.email?.message} {...emailForm.register("email")} />
          {serverError && <p className="text-sm text-red-300">{serverError}</p>}
          <Button variant="primary" className="w-full" disabled={emailForm.formState.isSubmitting}>Send code</Button>
        </form>
      )}
    </Modal>
  );
}
