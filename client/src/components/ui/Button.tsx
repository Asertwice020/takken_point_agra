import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" };

// * Primary (orange) is used once per screen, for the main action only
export default function Button({ variant = "ghost", className = "", ...props }: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-accent font-medium text-page hover:bg-accent-hover disabled:bg-hover disabled:text-muted"
      : "border border-line text-ink hover:bg-hover disabled:opacity-40";
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm transition-colors duration-150 disabled:cursor-not-allowed ${styles} ${className}`}
      {...props}
    />
  );
}
