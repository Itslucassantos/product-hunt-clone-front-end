export type AuthField = "email" | "password" | "code";

/** `messageKey` is relative to the `errors` namespace in messages/*.json. */
export type MappedAuthError = { field: AuthField | null; messageKey: string };

// Clerk's own texts are never shown: each error code maps to a key in messages/*.json.
const KNOWN_ERRORS: Record<string, MappedAuthError> = {
  form_identifier_not_found: { field: null, messageKey: "auth.invalidCredentials" },
  form_password_incorrect: { field: null, messageKey: "auth.invalidCredentials" },
  form_param_format_invalid: { field: "email", messageKey: "auth.emailInvalid" },
  form_identifier_exists: { field: "email", messageKey: "auth.emailTaken" },
  form_password_length_too_short: { field: "password", messageKey: "auth.passwordTooShort" },
  form_password_pwned: { field: "password", messageKey: "auth.passwordPwned" },
  form_password_not_strong_enough: { field: "password", messageKey: "auth.passwordWeak" },
  form_code_incorrect: { field: "code", messageKey: "auth.codeIncorrect" },
  verification_failed: { field: "code", messageKey: "auth.codeIncorrect" },
  verification_expired: { field: "code", messageKey: "auth.codeExpired" },
  too_many_requests: { field: null, messageKey: "auth.tooManyRequests" },
  network_error: { field: null, messageKey: "NETWORK_ERROR" },
};

const UNKNOWN_ERROR: MappedAuthError = { field: null, messageKey: "auth.unknown" };

export function mapClerkError(error: { code?: string } | null | undefined): MappedAuthError {
  const mapped = error?.code ? KNOWN_ERRORS[error.code] : undefined;
  if (!mapped && process.env.NODE_ENV === "development") {
    console.error("Unmapped Clerk error:", error);
  }
  return mapped ?? UNKNOWN_ERROR;
}
