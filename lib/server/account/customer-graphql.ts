import "server-only";
import { discoverEndpoints, type CustomerAccountConfig } from "@/lib/server/auth/oidc";

export class CustomerApiError extends Error {
  constructor(message: string, readonly code: "unavailable" | "denied" | "unauthorized" = "unavailable") {
    super(message);
    this.name = "CustomerApiError";
  }
}

export async function customerGraphql<T>(config: CustomerAccountConfig, accessToken: string, query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const endpoints = await discoverEndpoints(config);
  let response: Response;
  try {
    response = await fetch(endpoints.graphqlEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "User-Agent": "Wipelo-Storefront/1.0", Authorization: accessToken },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
  } catch {
    throw new CustomerApiError("The Customer Account API could not be reached.");
  }
  if (response.status === 401) throw new CustomerApiError("The customer's token was refused.", "unauthorized");
  if (!response.ok) throw new CustomerApiError(`Customer Account API responded with HTTP ${response.status}.`);
  const payload = await response.json() as { data?: T; errors?: { message: string; extensions?: { code?: string } }[] };
  if (payload.errors?.length) {
    const denied = payload.errors.some((error) => error.extensions?.code === "ACCESS_DENIED" || error.extensions?.code === "FORBIDDEN");
    throw new CustomerApiError(denied ? "Customer Account API permission denied." : "Customer Account API returned errors.", denied ? "denied" : "unavailable");
  }
  if (!payload.data) throw new CustomerApiError("Customer Account API returned no data.");
  return payload.data;
}
