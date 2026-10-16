export function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="mt-2 flex items-start gap-2 text-[13px] text-danger">
      <svg
        className="mt-px h-4 w-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v5M12 16.5v.01" />
      </svg>
      <span>{children}</span>
    </p>
  );
}
