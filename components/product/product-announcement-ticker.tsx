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
  return <div className="ticker product-ticker bg-wipelo-abyss text-wipelo-cream [height:40px] overflow-hidden relative [z-index:60] max-[520px]:[height:52px]" aria-label="Product announcements"><div className="ticker-inner relative h-full [max-width:var(--max)] [margin:0_auto]"><div className="ticker-msg on absolute inset-0 flex items-center justify-center [gap:10px] font-wipelo-mono [font-size:10.5px] [letter-spacing:.14em] uppercase [opacity:0] [transform:translateY(8px)] [transition:opacity_.5s_var(--ease),transform_.5s_var(--ease)] pointer-events-none text-center [padding:0_16px] max-[520px]:[font-size:9px] max-[520px]:[letter-spacing:.08em] max-[520px]:[line-height:1.5] [&.on]:[opacity:1] [&.on]:[transform:none] [&.on]:[pointer-events:auto] [&_.tk]:[color:var(--teal-bright)] [&.out]:[opacity:0] [&.out]:[transform:translateY(-8px)] [&.out]:[pointer-events:none]" aria-live="polite" key={current}>{messages[current]}</div></div></div>;
}
