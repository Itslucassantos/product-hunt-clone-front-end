import type { FieldErrorDetail } from "@/types/api";
import { ApiRequestError } from "./errors";

export function fieldErrorsOf(error: unknown): FieldErrorDetail[] {
  if (error instanceof ApiRequestError && error.code === "VALIDATION_ERROR") {
    return Array.isArray(error.details) ? (error.details as FieldErrorDetail[]) : [];
  }
  return [];
}
