import type { LoginFailure } from "./login-flow";

export type SignInStatus = LoginFailure | "unavailable" | "session-ended";

export function signInUrl(origin: string, status: SignInStatus, returnTo?: string) {
  const query = new URLSearchParams({ status, ...(returnTo ? { returnTo } : {}) });
  return `${origin}/account/sign-in?${query}`;
}
