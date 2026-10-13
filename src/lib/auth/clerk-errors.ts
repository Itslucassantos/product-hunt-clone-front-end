export type AuthField = "email" | "password" | "code";

export type MappedAuthError = { field: AuthField | null; messageKey: string };

const KNOWN_ERRORS: Record<string, MappedAuthError> = {
  form_identifier_not_found: { field: null, messageKey: "auth.invalidCredentials" },
  form_password_incorrect: { field: null, messageKey: "auth.invalidCredentials" },
  form_param_format_invalid: { field: "email", messageKey: "auth.emailInvalid" },
  form_identifier_exists: { field: "email", messageKey: "auth.emailTaken" },
  form_password_length_too_short: { field: "password", messageKey: "auth.passwordTooShort" },
  form_password_pwned: { field: "password", messageKey: "auth.passwordPwned" },
  form_password_not_strong: { field: "password", messageKey: "auth.passwordWeak" },
  form_password_not_strong_enough: { field: "password", messageKey: "auth.passwordWeak" },
  form_password_validation_failed: { field: "password", messageKey: "auth.passwordWeak" },
  form_code_incorrect: { field: "code", messageKey: "auth.codeIncorrect" },
  verification_failed: { field: "code", messageKey: "auth.codeIncorrect" },
  verification_expired: { field: "code", messageKey: "auth.codeExpired" },
  too_many_requests: { field: null, messageKey: "auth.tooManyRequests" },
  network_error: { field: null, messageKey: "NETWORK_ERROR" },
};

const UNKNOWN_ERROR: MappedAuthError = { field: null, messageKey: "auth.unknown" };

type ClerkErrorLike = { code?: string; errors?: { code?: string }[] };

export function mapClerkError(error: ClerkErrorLike | null | undefined): MappedAuthError {
  const codes = [error?.code, ...(error?.errors?.map((e) => e.code) ?? [])];
  const known = codes.find((code) => code && KNOWN_ERRORS[code]);
  const mapped = known ? KNOWN_ERRORS[known] : undefined;
  if (!mapped && process.env.NODE_ENV === "development") {
    console.error("Unmapped Clerk error:", error?.code, error);
  }
  return mapped ?? UNKNOWN_ERROR;
}
