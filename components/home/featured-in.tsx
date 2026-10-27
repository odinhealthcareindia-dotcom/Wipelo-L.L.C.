"use client";

import { useReducedMotion } from "framer-motion";
import Marquee from "react-fast-marquee";
import { Reveal } from "@/components/motion/reveal";

// Placeholder wordmarks for fictional publications — swap for real press logos before launch.
const featuredLogos = [
  { name: "Skin Ledger", src: "/featured-logo/skin-ledger.png" },
  { name: "Body Notes", src: "/featured-logo/body-notes.png" },
  { name: "The Daily Rinse", src: "/featured-logo/daily-rinse.png" },
  { name: "Fresh Matter", src: "/featured-logo/fresh-matter.png" },
  { name: "Well & Kept", src: "/featured-logo/well-and-kept.png" },
  { name: "Care Report", src: "/featured-logo/care-report.png" },
  { name: "Ritual Weekly", src: "/featured-logo/ritual-weekly.png" },
];

export function FeaturedInStrip() {
  const reduced = useReducedMotion();
  return <section className="featured-strip" aria-label="As featured in">
    <Reveal variant="fadeIn" className="wrap featured-strip-inner">
      <span className="featured-strip-label">As featured in</span>
      <div className="featured-strip-track">
        <ul className="sr-only">
          {featuredLogos.map((logo) => <li key={logo.name}>{logo.name}</li>)}
        </ul>
        <div aria-hidden="true">
          <Marquee className="featured-marquee" speed={30} play={!reduced} pauseOnHover pauseOnClick autoFill gradient gradientColor="#FAF5EF" gradientWidth="10%">
            {featuredLogos.map((logo) => <span className="featured-marquee-item" key={logo.name}>
              <img src={logo.src} alt="" loading="lazy" decoding="async" />
            </span>)}
          </Marquee>
        </div>
      </div>
    </Reveal>
  </section>;
}
