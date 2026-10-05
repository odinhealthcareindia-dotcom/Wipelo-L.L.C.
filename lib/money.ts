export function moneyLabel(money?: { amount: string; currencyCode: string } | null) {
  if (!money) return "";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: money.currencyCode }).format(Number(money.amount));
  } catch {
    return `${money.amount} ${money.currencyCode}`;
  }
}
