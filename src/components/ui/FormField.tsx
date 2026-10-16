import { useId, type InputHTMLAttributes } from "react";
import { FieldError } from "./FieldError";

type FormFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  fieldId?: string;
  hint?: string;
  error?: string | null;
};

export function FormField({
  label,
  fieldId,
  hint,
  error,
  className = "",
  ...props
}: FormFieldProps) {
  const generatedId = useId();
  const id = fieldId ?? generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      <input
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-12 w-full rounded-xl bg-bg px-4 text-base text-ink ${
          error ? "border-[1.5px] border-danger" : "border border-border-strong"
        } ${className}`}
      />
      {hint && (
        <p id={hintId} className="mt-2 text-[13px] text-muted">
          {hint}
        </p>
      )}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}
