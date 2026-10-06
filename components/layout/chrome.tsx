"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useStorefrontCart } from "@/components/layout/storefront-provider";

const announcements = [
  <>Functional Wet Wipes™ for the moments between</>,
  <>Skin is skin. Everywhere.</>,
  <>Explore the Wipelo line</>,
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
    {!pathname.startsWith("/products/") && <div className="ticker bg-wipelo-abyss text-wipelo-cream [height:40px] overflow-hidden relative [z-index:60] max-[520px]:[height:52px]" aria-label="Announcements"><div className="ticker-inner relative h-full [max-width:var(--max)] [margin:0_auto]"><div className="ticker-msg on absolute inset-0 flex items-center justify-center [gap:10px] font-wipelo-mono [font-size:10.5px] [letter-spacing:.14em] uppercase [opacity:0] [transform:translateY(8px)] [transition:opacity_.5s_var(--ease),transform_.5s_var(--ease)] pointer-events-none text-center [padding:0_16px] max-[520px]:[font-size:9px] max-[520px]:[letter-spacing:.08em] max-[520px]:[line-height:1.5] [&.on]:[opacity:1] [&.on]:[transform:none] [&.on]:[pointer-events:auto] [&_.tk]:[color:var(--teal-bright)] [&.out]:[opacity:0] [&.out]:[transform:translateY(-8px)] [&.out]:[pointer-events:none]">{announcements[announcement]}</div></div></div>}
    <header className="nav site-nav sticky [top:0] [z-index:50] [background:rgba(250,245,239,.86)] [backdrop-filter:blur(14px)] [-webkit-backdrop-filter:blur(14px)] [border-bottom:1px_solid_transparent] [transition:border-color_.3s,box-shadow_.3s] [transition:border-color_.3s,box-shadow_.3s,transform_.45s_var(--ease)]  [&.scrolled]:[border-bottom-color:var(--hairline)] [&.scrolled]:[box-shadow:0_8px_30px_-20px_rgba(11,11,11,.25)] [&.tucked]:[transform:translateY(-100%)] [&_.prog]:[position:absolute] [&_.prog]:[left:0] [&_.prog]:[bottom:-1px] [&_.prog]:[height:2px] [&_.prog]:[background:var(--teal)] [&_.prog]:[width:calc(var(--prog,0)*100%)] [&_.prog]:[transition:width_.1s_linear] [&_.burger.on_span:nth-child(1)]:[transform:translateY(7px)_rotate(45deg)] [&_.burger.on_span:nth-child(2)]:[opacity:0] [&_.burger.on_span:nth-child(3)]:[transform:translateY(-7px)_rotate(-45deg)] [&_.burger_span]:[transition:transform_.2s,opacity_.2s] max-[820px]:[&_.nav-in]:[position:relative] max-[820px]:[&_.nav-links]:[display:none] max-[820px]:[&_.nav-links]:[position:absolute] max-[820px]:[&_.nav-links]:[left:0] max-[820px]:[&_.nav-links]:[right:0] max-[820px]:[&_.nav-links]:[top:72px] max-[820px]:[&_.nav-links]:[z-index:55] max-[820px]:[&_.nav-links]:[flex-direction:column] max-[820px]:[&_.nav-links]:[align-items:stretch] max-[820px]:[&_.nav-links]:[gap:0] max-[820px]:[&_.nav-links]:[padding:8px_min(5vw,40px)_18px] max-[820px]:[&_.nav-links]:[background:var(--cream)] max-[820px]:[&_.nav-links]:[border-bottom:1px_solid_var(--hairline)] max-[820px]:[&_.nav-links]:[box-shadow:0_16px_25px_-23px_rgba(5,34,30,.4)] max-[820px]:[&_.nav-links.open]:[display:flex] max-[820px]:[&_.nav-links_a]:[padding:15px_0] max-[820px]:[&_.nav-links_a]:[font-size:16px]">
      <div className="wrap nav-in [max-width:var(--max)] [margin:0_auto] [padding:0_min(5vw,40px)] flex items-center justify-between [height:72px] max-[1020px]:[&.hero-grid]:[padding-left:min(5vw,40px)] max-[1020px]:[&.hero-grid]:[padding-right:min(5vw,40px)] max-[1020px]:[&.pdp]:[padding-left:min(5vw,40px)] max-[1020px]:[&.pdp]:[padding-right:min(5vw,40px)]">
        <Link href="/" className="nav-brand font-wipelo-display [font-weight:600] [font-size:26px] [letter-spacing:-.02em] [&_.tm]:[font-family:var(--mo)] [&_.tm]:[font-size:9px] [&_.tm]:[letter-spacing:.14em] [&_.tm]:[text-transform:uppercase] [&_.tm]:[color:var(--ink-40)] [&_.tm]:[display:block] [&_.tm]:[margin-top:-3px]">Wipelo<span className="tm">Functional Wet Wipes™</span></Link>
        <nav className={`nav-links flex [gap:34px] items-center max-[820px]:hidden [&_a]:[font:500_13.5px/1_var(--in)] [&_a]:[letter-spacing:.02em] [&_a]:[position:relative] [&_a]:[padding:6px_0] [&_a:focus-visible]:[outline:3px_solid_var(--teal)] [&_a:focus-visible]:[outline-offset:4px]${menuOpen ? " open" : ""}`} aria-label="Main">
          {navItems.map(([label, href]) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}
        </nav>
        <div className="nav-cta flex items-center [gap:18px]"><button className="cart-btn relative flex items-center [gap:8px] [font:600_13.5px/1_var(--in)] [padding:11px_20px] [border:1.5px_solid_var(--ink)] [border-radius:999px] [transition:background_.2s,color_.2s] [&:hover]:[background:var(--ink)] [&:hover]:[color:var(--cream)] [&:focus-visible]:[outline:3px_solid_var(--teal)] [&:focus-visible]:[outline-offset:4px]" onClick={openCart}>Cart <span className="cart-count bg-wipelo-teal text-white [font:700_10.5px/1_var(--mo)] [min-width:19px] [height:19px] [border-radius:999px] inline-flex items-center justify-center [padding:0_5px]">{cart?.totalQuantity ?? 0}</span></button><button className={`burger hidden flex-col [gap:5px] [padding:8px] max-[820px]:flex [&_span]:[width:22px] [&_span]:[height:2px] [&_span]:[background:var(--ink)] [&_span]:[display:block]${menuOpen ? " on" : ""}`} aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}><span /><span /><span /></button></div>
      </div>
    </header>
  </>;
}

export function SiteFooter() {
  return <footer className="footer site-footer bg-wipelo-abyss text-wipelo-cream [padding:72px_0_40px] [border-top:1px_solid_var(--hairline-dark)] [&_.foot-brand_.nav-brand]:[color:var(--cream)] [&_.site-colorline]:[padding:0_0_26px] [&_.foot-brand_p]:[max-width:34ch]"><div className="wrap [max-width:var(--max)] [margin:0_auto] [padding:0_min(5vw,40px)] max-[1020px]:[&.hero-grid]:[padding-left:min(5vw,40px)] max-[1020px]:[&.hero-grid]:[padding-right:min(5vw,40px)] max-[1020px]:[&.pdp]:[padding-left:min(5vw,40px)] max-[1020px]:[&.pdp]:[padding-right:min(5vw,40px)]">
    <div className="foot-grid grid [grid-template-columns:1.4fr_1fr_1fr_1fr] [gap:40px] [margin-bottom:56px] max-[1020px]:[grid-template-columns:1fr_1fr] max-[820px]:[grid-template-columns:1fr]">
      <div className="foot-brand [&_.nav-brand]:[font-size:32px] [&_p]:[font-size:13px] [&_p]:[color:var(--cream-45)] [&_p]:[margin-top:14px] [&_p]:[max-width:30ch]"><Link href="/" className="nav-brand font-wipelo-display [font-weight:600] [font-size:26px] [letter-spacing:-.02em] [&_.tm]:[font-family:var(--mo)] [&_.tm]:[font-size:9px] [&_.tm]:[letter-spacing:.14em] [&_.tm]:[text-transform:uppercase] [&_.tm]:[color:var(--ink-40)] [&_.tm]:[display:block] [&_.tm]:[margin-top:-3px]">Wipelo</Link><p>Functional Wet Wipes™ — engineered, portable skin treatment for the needs your routine doesn’t reach.</p></div>
      <div className="foot-col [&_.mono]:[display:block] [&_.mono]:[margin-bottom:18px] [&_.mono]:[opacity:.5] [&_ul]:[list-style:none] [&_ul]:[display:flex] [&_ul]:[flex-direction:column] [&_ul]:[gap:11px] [&_ul]:[font-size:13.5px] [&_a]:[color:var(--cream-70)] [&_a]:[transition:color_.2s] [&_a:hover]:[color:var(--teal-bright)]"><span className="mono font-wipelo-mono [font-size:11px] [letter-spacing:.14em] uppercase">Shop</span><ul><li><Link href="/shop">Shop all products</Link></li><li><Link href="/collections/all">Collections</Link></li></ul></div>
      <div className="foot-col [&_.mono]:[display:block] [&_.mono]:[margin-bottom:18px] [&_.mono]:[opacity:.5] [&_ul]:[list-style:none] [&_ul]:[display:flex] [&_ul]:[flex-direction:column] [&_ul]:[gap:11px] [&_ul]:[font-size:13.5px] [&_a]:[color:var(--cream-70)] [&_a]:[transition:color_.2s] [&_a:hover]:[color:var(--teal-bright)]"><span className="mono font-wipelo-mono [font-size:11px] [letter-spacing:.14em] uppercase">Brand</span><ul><li><Link href="/science">The Science</Link></li><li><Link href="/our-story">Our Story</Link></li></ul></div>
      <div className="foot-col [&_.mono]:[display:block] [&_.mono]:[margin-bottom:18px] [&_.mono]:[opacity:.5] [&_ul]:[list-style:none] [&_ul]:[display:flex] [&_ul]:[flex-direction:column] [&_ul]:[gap:11px] [&_ul]:[font-size:13.5px] [&_a]:[color:var(--cream-70)] [&_a]:[transition:color_.2s] [&_a:hover]:[color:var(--teal-bright)]"><span className="mono font-wipelo-mono [font-size:11px] [letter-spacing:.14em] uppercase">Support</span><ul><li><Link href="/manage-subscription">Manage subscription</Link></li><li><Link href="/manage-subscription#faq">FAQ</Link></li></ul></div>
    </div>
    <Link href="/" className="nav-brand font-wipelo-display [font-weight:600] [font-size:26px] [letter-spacing:-.02em] [&_.tm]:[font-family:var(--mo)] [&_.tm]:[font-size:9px] [&_.tm]:[letter-spacing:.14em] [&_.tm]:[text-transform:uppercase] [&_.tm]:[color:var(--ink-40)] [&_.tm]:[display:block] [&_.tm]:[margin-top:-3px]">Wipelo</Link>
    {/* <div className="site-colorline"><span className="color-spec inline-flex items-center [gap:12px] font-wipelo-mono [font-size:10px] [letter-spacing:.12em] uppercase [color:var(--cream-45)] max-[820px]:block max-[820px]:[line-height:1.8] [&_.swatch]:[width:16px] [&_.swatch]:[height:16px] [&_.swatch]:[border-radius:4px] [&_.swatch]:[background:var(--teal)] [&_.swatch]:[box-shadow:0_0_0_1px_rgba(250,245,239,.25)] [&_.swatch]:[flex:none] [&_b]:[color:var(--teal-bright)] [&_b]:[font-weight:700] max-[820px]:[&_.swatch]:[display:inline-block] max-[820px]:[&_.swatch]:[vertical-align:-3px] max-[820px]:[&_.swatch]:[margin-right:10px]"><span className="swatch" />Wipelo Teal · <b>#00B4A0</b> — if it’s this teal, it’s us.</span></div> */}
    <div className="foot-base [border-top:1px_solid_var(--hairline-dark)] [padding-top:26px] flex items-center justify-between [gap:20px] flex-wrap [&_.legal]:[font-family:var(--mo)] [&_.legal]:[font-size:9.5px] [&_.legal]:[letter-spacing:.1em] [&_.legal]:[text-transform:uppercase] [&_.legal]:[color:var(--cream-45)]"><span className="legal">© {new Date().getFullYear()} Wipelo · Functional Wet Wipes™ · Skin is skin. Everywhere.™</span><div className="pay-icons flex [gap:8px] max-[520px]:flex-wrap [&_span]:[font-family:var(--mo)] [&_span]:[font-size:8.5px] [&_span]:[letter-spacing:.06em] [&_span]:[border:1px_solid_var(--hairline-dark)] [&_span]:[border-radius:4px] [&_span]:[padding:5px_8px] [&_span]:[color:var(--cream-70)] [&_span]:[text-transform:uppercase]"><span>Visa</span><span>MC</span><span>Amex</span><span>Apple&nbsp;Pay</span><span>Shop&nbsp;Pay</span><span>PayPal</span></div></div>
  </div></footer>;
}
