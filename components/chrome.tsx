"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { m, useMotionValueEvent, useScroll } from "framer-motion";
import { usePathname } from "next/navigation";
import { useStorefrontCart } from "@/components/storefront-provider";
import { AnnouncementBar } from "@/components/announcement-bar";

const navItems = [
  ["Shop", "/shop"],
  ["The Science", "/science"],
  ["Our Story", "/our-story"],
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { cart, openCart } = useStorefrontCart();

  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 80));
  useEffect(() => setScrolled(window.scrollY > 80), []);

  // Pop the badge when the count changes, but not on first load.
  const count = cart?.totalQuantity ?? 0;
  const firstCount = useRef(true);
  useEffect(() => { firstCount.current = false; }, []);

  return <>
    {!pathname.startsWith("/products/") && <AnnouncementBar />}
    <header className={`nav site-nav${scrolled ? " scrolled" : ""}`}>
      <div className="wrap nav-in">
        <Link href="/" className="nav-brand">Wipelo<span className="tm">Functional wet wipes</span></Link>
        <nav className={`nav-links${menuOpen ? " open" : ""}`} aria-label="Main">
          {navItems.map(([label, href]) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}
        </nav>
        <div className="nav-cta"><button className="cart-btn" onClick={openCart}>Cart <m.span key={count} className="cart-count" initial={firstCount.current ? false : { scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>{count}</m.span></button><button className={`burger${menuOpen ? " on" : ""}`} aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}><span /><span /><span /></button></div>
      </div>
    </header>
  </>;
}
