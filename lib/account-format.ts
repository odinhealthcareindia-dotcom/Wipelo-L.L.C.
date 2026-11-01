const STATUS_WORDS: Record<string, string> = { ON_HOLD: "On hold", IN_PROGRESS: "In progress", PARTIALLY_FULFILLED: "Partially shipped", FULFILLED: "Shipped", UNFULFILLED: "Preparing", PARTIALLY_PAID: "Partially paid", PARTIALLY_REFUNDED: "Partially refunded" };

export function statusLabel(status: string | null | undefined) {
  if (!status) return "";
  return STATUS_WORDS[status] ?? `${status.charAt(0)}${status.slice(1).toLowerCase().replace(/_/g, " ")}`;
}

export function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));
}

export function orderPath(id: string) {
  return `/account/orders/${id.split("/").pop()?.split("?")[0] ?? ""}`;
}
