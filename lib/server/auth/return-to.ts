const DEFAULT_RETURN_TO = "/account";
const AUTH_PATHS = /^\/(api\/|account\/sign-in)/;

// Only same-origin paths survive. Rejects //evil.com, /\evil.com, encoded variants, control characters and absolute URLs.
export function safeReturnTo(value: unknown, fallback = DEFAULT_RETURN_TO) {
  if (typeof value !== "string" || !value.startsWith("/") || value.length > 512) return fallback;
  if (/[\u0000-\u001f\\]/.test(value)) return fallback;
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }
  if (decoded.startsWith("//") || decoded.includes("\\") || value.startsWith("//")) return fallback;
  try {
    const base = "https://return-to.invalid";
    const url = new URL(value, base);
    if (url.origin !== base) return fallback;
    const path = `${url.pathname}${url.search}${url.hash}`;
    return AUTH_PATHS.test(url.pathname) ? fallback : path;
  } catch {
    return fallback;
  }
}
