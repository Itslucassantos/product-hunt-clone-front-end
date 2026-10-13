import type { ApiError } from "@/types/api";
import { API_BASE_URL } from "./client";
import { ApiRequestError } from "./errors";

export function uploadProductImage(
  file: File,
  token: string,
  onProgress: (percent: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", new URL("/api/uploads/product-image", API_BASE_URL));
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("X-Request-Id", crypto.randomUUID());

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onerror = () => reject(new ApiRequestError(null, null, null));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve((JSON.parse(xhr.responseText) as { imageUrl: string }).imageUrl);
          return;
        } catch {}
      }
      let payload: ApiError | null = null;
      try {
        payload = JSON.parse(xhr.responseText) as ApiError;
      } catch {}
      reject(
        new ApiRequestError(
          payload?.error.code ?? "INTERNAL_ERROR",
          xhr.status,
          payload?.error.requestId ?? xhr.getResponseHeader("X-Request-Id"),
          payload?.error.details,
        ),
      );
    };

    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}
