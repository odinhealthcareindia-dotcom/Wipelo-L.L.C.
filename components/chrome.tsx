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
  ["Journal", "/blog"],
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { cart, openCart, signedIn } = useStorefrontCart();
  // "Account" until the first response, and for signed-in customers. /account handles both states.
  const accountLabel = signedIn === false ? "Sign in" : "Account";

  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  // Which half of the page we're in decides the overscroll colour (html[data-edge] in globals.css):
  // a bounce at the top shows cream behind the header, a bounce at the bottom shows Abyss behind the footer.
  const syncEdges = (y: number) => {
    setScrolled(y > 80);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    document.documentElement.dataset.edge = max > 0 && y > max / 2 ? "bottom" : "top";
  };
  useMotionValueEvent(scrollY, "change", syncEdges);
  useEffect(() => syncEdges(window.scrollY), [pathname]);

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
          <Link className="nav-account-menu" href="/account" onClick={() => setMenuOpen(false)} aria-current={pathname.startsWith("/account") ? "page" : undefined}>{accountLabel}</Link>
        </nav>
        <div className="nav-cta"><Link className="nav-account" href="/account" aria-current={pathname.startsWith("/account") ? "page" : undefined}>{accountLabel}</Link><button className="cart-btn" onClick={openCart}>Cart <m.span key={count} className="cart-count" initial={firstCount.current ? false : { scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>{count}</m.span></button><button className={`burger${menuOpen ? " on" : ""}`} aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}><span /><span /><span /></button></div>
      </div>
    </header>
  </>;
}
