"use client";

import { ApiRequestError } from "@/lib/api/errors";
import { ErrorState } from "./ui/ErrorState";

export function AdminForbidden() {
  return <ErrorState page error={new ApiRequestError("FORBIDDEN", 403, null)} />;
}
