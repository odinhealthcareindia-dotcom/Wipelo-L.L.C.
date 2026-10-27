import Link from "next/link";
import { socialProfiles } from "@/lib/social-links";
import { FooterNewsletter } from "@/components/footer-newsletter";
import { Reveal, Stagger } from "@/components/motion/reveal";

const footerNavigation = [
  {
    title: "Shop",
    links: [
      { label: "ON THE GO", href: "/products/on-the-go" },
      { label: "SPOTLESS", href: "/products/spotless" },
      { label: "HER", href: "/products/her" },
      { label: "Shop all", href: "/shop" },
    ],
  },
  {
    title: "Brand",
    links: [
      { label: "The Science", href: "/science" },
      { label: "Our Story", href: "/our-story" },
    ],
  },
  {
    title: "Support",
    links: [{ label: "FAQs", href: "/#faq" }],
  },
];

function SocialIcon({ name }: { name: "instagram" | "facebook" }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      {name === "instagram" ? <>
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </> : <path d="M14.5 21v-8h2.7l.4-3.2h-3.1v-2c0-.9.3-1.6 1.6-1.6h1.7V3.3a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2.3H8.3V13h2.8v8h3.4Z" fill="currentColor" />}
    </svg>
  );
}

// A tiny rotating seal sitting in the dot of the wordmark's "i".
function FooterSeal() {
  return <span className="wipe-footer-seal" aria-hidden="true">
    <svg viewBox="0 0 100 100">
      <defs><path id="footer-seal-ring" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" /></defs>
      <text><textPath href="#footer-seal-ring" textLength="230" lengthAdjust="spacing">Wipelo · Est. 2025 · Wipelo · Est. 2025 ·</textPath></text>
    </svg>
    <span className="wipe-footer-seal-w">W</span>
  </span>;
}

export function SiteFooter() {
  return (
    <footer className="wipe-footer" aria-label="Wipelo footer">
      <picture className="wipe-footer-background" aria-hidden="true">
        <source media="(max-width: 640px)" srcSet="/images/footer/wipe-mobile-small.webp 480w, /images/footer/wipe-mobile.webp 941w" sizes="100vw" />
        <img
          src="/images/footer/wipe-desktop.webp"
          srcSet="/images/footer/wipe-desktop-small.webp 1200w, /images/footer/wipe-desktop.webp 1774w"
          sizes="100vw"
          width="1774"
          height="887"
          alt=""
          loading="lazy"
          decoding="async"
        />
      </picture>

      <div className="wipe-footer-shell">
        <Reveal><FooterNewsletter /></Reveal>

        <div className="wipe-footer-top">
          <Stagger as="nav" className="wipe-footer-nav" gap={0.08} aria-label="Footer">
            {footerNavigation.map(({ title, links }) => <Reveal className="wipe-footer-column" key={title}>
              <h2>{title}</h2>
              <ul>{links.map(({ label, href }) => <li key={href}>
                <Link href={href}>{label}</Link>
              </li>)}</ul>
            </Reveal>)}
          </Stagger>

          <Reveal className="wipe-footer-intro" delay={0.2}>
            <p>Functional personal care.<br />Made for real life.</p>
            <div className="wipe-footer-socials" aria-label="Social media">
              {socialProfiles.map(({ name, icon, href }) => href ? (
                <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Wipelo on ${name} (opens in a new tab)`} className="wipe-footer-social" title={name}>
                  <SocialIcon name={icon} />
                </a>
              ) : (
                <span key={name} className="wipe-footer-social is-unlinked" role="img" aria-label={name}>
                  <SocialIcon name={icon} />
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <Link href="/" className="wipe-footer-wordmark" aria-label="Wipelo home">W<span className="wipe-footer-i">i<FooterSeal /></span>pelo</Link>

        <div className="wipe-footer-bottom">
          <small>© {new Date().getFullYear()} Wipelo</small>
          <span className="wipe-footer-signoff">Skin is skin. Everywhere.</span>
          <a className="wipe-footer-back" href="#">Back to top <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
        </div>
      </div>
    </footer>
  );
}
