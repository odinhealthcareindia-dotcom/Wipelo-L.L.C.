"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useStorefrontCart } from "@/components/storefront-provider";

const announcements = [
  <>Launch offer — free <span className="tk">Welcome&nbsp;Kit</span> with every subscription</>,
  <>Free US shipping over <span className="tk">$35</span> · ships in 12–24 hours</>,
  <>The Skin-Is-Skin Guarantee — <span className="tk">30 days</span>, keep it or keep your money</>,
  <><span className="tk">pH-True™</span> 4.5–5.5 · batch-tested · dermatologist-assessed</>,
];

const navItems = [
  ["Shop", "/shop"],
  ["The Science", "/science"],
  ["Our Story", "/our-story"],
  ["Manage Subscription", "/manage-subscription"],
] as const;

export function SiteHeader() {
  const [announcement, setAnnouncement] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { cart, openCart } = useStorefrontCart();

  useEffect(() => {
    const timer = window.setInterval(() => setAnnouncement((value) => (value + 1) % announcements.length), 4200);
    const onScroll = () => document.querySelector(".site-nav")?.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { window.clearInterval(timer); window.removeEventListener("scroll", onScroll); };
  }, []);

  return <>
    <div className="ticker" aria-label="Announcements"><div className="ticker-inner"><div className="ticker-msg on">{announcements[announcement]}</div></div></div>
    <header className="nav site-nav">
      <div className="wrap nav-in">
        <Link href="/" className="nav-brand">Wipelo<span className="tm">Functional Wet Wipes™</span></Link>
        <nav className={`nav-links${menuOpen ? " open" : ""}`} aria-label="Main">
          {navItems.map(([label, href]) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}
        </nav>
        <div className="nav-cta"><button className="cart-btn" onClick={openCart}>Cart <span className="cart-count">{cart?.totalQuantity ?? 0}</span></button><button className={`burger${menuOpen ? " on" : ""}`} aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}><span /><span /><span /></button></div>
      </div>
    </header>
  </>;
}

export function SiteFooter() {
  return <footer className="footer site-footer"><div className="wrap">
    <div className="foot-grid">
      <div className="foot-brand"><Link href="/" className="nav-brand">Wipelo</Link><p>Functional Wet Wipes™ — engineered, portable skin treatment for the needs your routine doesn’t reach.</p></div>
      <div className="foot-col"><span className="mono">Shop</span><ul><li><Link href="/shop">Shop all products</Link></li><li><Link href="/collections/all">Collections</Link></li></ul></div>
      <div className="foot-col"><span className="mono">Brand</span><ul><li><Link href="/science">The Science</Link></li><li><Link href="/our-story">Our Story</Link></li></ul></div>
      <div className="foot-col"><span className="mono">Support</span><ul><li><Link href="/manage-subscription">Manage subscription</Link></li><li><Link href="/manage-subscription#faq">FAQ</Link></li></ul></div>
    </div>
    <div className="site-colorline"><span className="color-spec"><span className="swatch" />Wipelo Teal · <b>#00B4A0</b> — if it’s this teal, it’s us.</span></div>
    <div className="foot-base"><span className="legal">© {new Date().getFullYear()} Wipelo · Functional Wet Wipes™ · Skin is skin. Everywhere.™</span><div className="pay-icons"><span>Visa</span><span>MC</span><span>Amex</span><span>Apple&nbsp;Pay</span><span>Shop&nbsp;Pay</span><span>PayPal</span></div></div>
  </div></footer>;
}
