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
  return <div className={`stickybar product-stickybar${visible ? " on" : ""}`} aria-hidden={!visible} inert={!visible}>
    <div className="stickybar-in"><span className="sb-name">{product.title}</span><span className="sb-meta">New release · 0 verified reviews · From {price}</span><a className="btn btn-teal" href="#buybox">Choose a pack <span aria-hidden="true">↑</span></a></div>
  </div>;
}
