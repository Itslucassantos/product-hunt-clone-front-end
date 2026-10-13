import { useId, type TextareaHTMLAttributes } from "react";
import { FieldError } from "./FieldError";

type FormTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  label: string;
  fieldId?: string;
  hint?: string;
  error?: string | null;
};

export function FormTextarea({
  label,
  fieldId,
  hint,
  error,
  className = "",
  ...props
}: FormTextareaProps) {
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
      <textarea
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`min-h-28 w-full rounded-xl bg-bg px-4 py-3 text-base text-ink ${
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
