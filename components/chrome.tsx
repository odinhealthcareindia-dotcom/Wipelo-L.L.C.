"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const onScroll = () => document.querySelector(".site-nav")?.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <>
    {!pathname.startsWith("/products/") && <AnnouncementBar />}
    <header className="nav site-nav">
      <div className="wrap nav-in">
        <Link href="/" className="nav-brand">Wipelo<span className="tm">Personal care wipes</span></Link>
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
      <div className="foot-brand"><Link href="/" className="nav-brand">Wipelo</Link><p>Thoughtful, individually wrapped wipes for body freshness, breakout-prone skin, and external intimate care.</p></div>
      <div className="foot-col"><span className="mono">Shop</span><ul><li><Link href="/shop">Shop all products</Link></li></ul></div>
      <div className="foot-col"><span className="mono">Brand</span><ul><li><Link href="/science">The Science</Link></li><li><Link href="/our-story">Our Story</Link></li></ul></div>
      <div className="foot-col"><span className="mono">Support</span><ul><li><Link href="/#faq">Frequently asked questions</Link></li></ul></div>
    </div>
    <div className="site-colorline"><span className="color-spec">ON THE GO · SPOTLESS · HER</span></div>
    <div className="foot-base"><span className="legal">© {new Date().getFullYear()} Wipelo · Personal care wipes · Skin is skin. Everywhere.™</span><div className="pay-icons"><span>Visa</span><span>MC</span><span>Amex</span><span>Apple&nbsp;Pay</span><span>PayPal</span></div></div>
  </div></footer>;
}
