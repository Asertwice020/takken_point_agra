import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { saveProfile } from "../../api/auth.api";
import { useAuthStore } from "../../store/auth.store";
import { getErrorMessage } from "../../utils/errorMessages";
import { cleanName, sanitizePhone } from "../../utils/sanitize";
import { profileSchema, type ProfileForm } from "../../validators/auth.schema";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import TextField from "../ui/TextField";

type ProfileModalProps = { isOpen: boolean; onClose: () => void; onSuccess: () => void };

export default function ProfileModal({ isOpen, onClose, onSuccess }: ProfileModalProps) {
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  const submit = handleSubmit(async (values) => {
    setServerError("");
    try {
      await saveProfile(values);
      await useAuthStore.getState().refresh();
      onSuccess();
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  });

  return (
    <Modal isOpen={isOpen} title="Almost there" onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <p className="text-sm text-muted">We need your name and phone number for your booking.</p>
        <TextField label="Name" sanitize={cleanName} maxLength={60} autoComplete="name" autoFocus placeholder="Your name" error={errors.name?.message} {...register("name")} />
        <TextField label="Phone" type="tel" sanitize={sanitizePhone} inputMode="numeric" maxLength={10} autoComplete="tel-national" placeholder="10-digit mobile number" error={errors.phone?.message} {...register("phone")} />
        {serverError && <p className="text-sm text-red-300">{serverError}</p>}
        <Button variant="primary" className="w-full" disabled={isSubmitting}>Continue</Button>
      </form>
    </Modal>
  );
}
