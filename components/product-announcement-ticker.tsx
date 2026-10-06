"use client";

import { useEffect, useState } from "react";
import type { PdpContent } from "@/lib/pdp-content";

export function ProductAnnouncementTicker({ content, productTitle }: { content: PdpContent | null; productTitle: string }) {
  const fallback = `${productTitle} · live product details and availability from Shopify.`;
  const messages = content?.announcements.length ? content.announcements : [fallback];
  const [active, setActive] = useState(0);
  const current = active % messages.length;
  useEffect(() => {
    if (messages.length < 2) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % messages.length), 4200);
    return () => window.clearInterval(timer);
  }, [messages]);
  return <div className="ticker product-ticker" aria-label="Product announcements"><div className="ticker-inner"><div className="ticker-msg on" aria-live="polite" key={current}>{messages[current]}</div></div></div>;
}
