import type { ChangeEvent, InputHTMLAttributes, Ref } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
  sanitize?: (value: string) => string;
  variant?: "default" | "code";
};

// * Soft filled box (Notion style). "sanitize" filters every typed or pasted value before the form sees it.
export default function TextField({ label, error, ref, sanitize, variant = "default", onChange, ...props }: TextFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (sanitize) {
      const cleaned = sanitize(event.target.value);
      if (cleaned !== event.target.value) event.target.value = cleaned;
    }
    onChange?.(event);
  };
  const size = variant === "code" ? "text-center font-mono text-xl tracking-[0.25em]" : "text-base";

  return (
    <label className="block">
      <span className="text-xs text-muted">{label}</span>
      <input
        ref={ref}
        spellCheck={false}
        autoCorrect="off"
        onChange={handleChange}
        className={`mt-1.5 block w-full rounded-md border border-line bg-hover px-3 py-2.5 text-ink outline-none transition-colors duration-150 placeholder:text-white/25 focus:border-white/40 ${size}`}
        {...props}
      />
      {error && <span className="mt-1.5 block text-xs text-red-300">{error}</span>}
    </label>
  );
}
