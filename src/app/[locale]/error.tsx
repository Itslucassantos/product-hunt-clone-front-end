"use client";

import { RouteError } from "@/components/RouteError";

export default function Error(props: Parameters<typeof RouteError>[0]) {
  return (
    <main className="mx-auto w-full max-w-content flex-1 px-6 py-10">
      <RouteError {...props} />
    </main>
  );
}
