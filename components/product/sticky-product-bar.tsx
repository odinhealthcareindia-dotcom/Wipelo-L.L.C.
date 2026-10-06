"use client";

import { useEffect, useState } from "react";
import { moneyLabel } from "@/lib/money";
import type { ShopifyProduct } from "@/lib/shopify";

export function StickyProductBar({ product }: { product: ShopifyProduct }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const buybox = document.getElementById("buybox");
    if (!buybox) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { rootMargin: "-120px 0px 0px 0px" });
    observer.observe(buybox);
    return () => observer.disconnect();
  }, []);
  const price = moneyLabel(product.priceRange.minVariantPrice);
  return <div className={`stickybar product-stickybar fixed [left:0] [right:0] [bottom:0] [z-index:55] [background:rgba(11,11,11,.94)] text-wipelo-cream [backdrop-filter:blur(12px)] [transform:translateY(110%)] [transition:transform_.45s_var(--ease)] [border-top:1px_solid_var(--hairline-dark)] [&.on]:[transform:none] [&_.sb-name]:[font-family:var(--fr)] [&_.sb-name]:[font-weight:600] [&_.sb-name]:[font-size:18px] [&_.sb-meta]:[font-family:var(--mo)] [&_.sb-meta]:[font-size:9.5px] [&_.sb-meta]:[letter-spacing:.1em] [&_.sb-meta]:[text-transform:uppercase] [&_.sb-meta]:[color:var(--cream-45)] [&_.btn]:[margin-left:auto] [&_.btn]:[padding:14px_26px] [&_.btn]:[font-size:14px] max-[820px]:[&_.sb-meta]:[display:none] [&[aria-hidden='true']]:[pointer-events:none] max-[600px]:[&_.stickybar-in]:[gap:11px] max-[600px]:[&_.stickybar-in]:[padding-top:10px] max-[600px]:[&_.stickybar-in]:[padding-bottom:10px] max-[600px]:[&_.sb-name]:[font-size:15px] max-[600px]:[&_.btn]:[padding:12px_15px] max-[600px]:[&_.btn]:[font-size:12px]${visible ? " on" : ""}`} aria-hidden={!visible} inert={!visible}>
    <div className="stickybar-in flex items-center [gap:20px] [padding:14px_min(5vw,40px)] [max-width:var(--max)] [margin:0_auto]"><span className="sb-name">{product.title}</span><span className="sb-meta">New release · 0 verified reviews · From {price}</span><a className="btn btn-teal inline-flex items-center justify-center [gap:10px] [font:600_15px/1_var(--in)] [letter-spacing:.01em] [padding:18px_34px] [border-radius:999px] [transition:transform_.35s_var(--ease),box-shadow_.35s_var(--ease),background_.2s] [will-change:transform] bg-wipelo-teal text-white [box-shadow:0_10px_28px_-10px_rgba(0,180,160,.55)] [&:hover]:[transform:translateY(-2px)] [&:active]:[transform:translateY(0)] [&:hover]:[background:#00a794] [&_.sub]:[font:400_12px/1_var(--mo)] [&_.sub]:[opacity:.75] [&_.sub]:[letter-spacing:.04em] [&_.ar]:[display:inline-block] [&_.ar]:[transition:transform_.3s_var(--ease)] [&:hover_.ar]:[transform:translateX(4px)] [&:focus-visible]:[outline:3px_solid_var(--teal)] [&:focus-visible]:[outline-offset:4px]" href="#buybox">Choose a pack <span aria-hidden="true">↑</span></a></div>
  </div>;
}
