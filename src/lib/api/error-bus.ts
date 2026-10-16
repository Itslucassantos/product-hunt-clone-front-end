export type ErrorSource = "query" | "mutation";
type Listener = (error: unknown, source: ErrorSource) => void;

const listeners = new Set<Listener>();

export function emitApiError(error: unknown, source: ErrorSource) {
  listeners.forEach((listener) => listener(error, source));
}

export function onApiError(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
