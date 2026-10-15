"use client";

import { ApiRequestError } from "@/lib/api/errors";
import { ErrorState } from "./ui/ErrorState";

export function RouteNotFound() {
  return <ErrorState page error={new ApiRequestError("ROUTE_NOT_FOUND", 404, null)} />;
}
