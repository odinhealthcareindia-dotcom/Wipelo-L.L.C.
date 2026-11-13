"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, m, useInView, useMotionTemplate, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useRef, useState, type FocusEvent } from "react";
import { Reveal } from "@/components/motion/reveal";

export type GalleryImage = {
  src: string;
  alt: string;
  /** Short quotation shown over the image while it is the expanded one. */
  caption: string;
  /** Small label above the quote, e.g. the benefit or ingredient it refers to. */
  kicker?: string;
};

// Track sizes (in fr) for each focused slot. Slot 0 spans both rows on the left;
// slots 1 and 2 stack on the right. Focusing a right-hand slot widens that column
// and gives its row most of the height, so the image grows in place without swapping.
const LAYOUTS = [
  { cols: [2, 1], rows: [1, 1] },
  { cols: [1, 1.85], rows: [2.4, 1] },
  { cols: [1, 1.85], rows: [1, 2.4] },
] as const;

const SPRING = { stiffness: 140, damping: 24, mass: 1 };
const EASE = [0.22, 1, 0.36, 1] as const;

// How long each image stays expanded before the next one takes over.
const ROTATE_MS = 1000;

export function CampaignGallery({
  images,
  label,
  product,
  href,
}: {
  images: GalleryImage[];
  label: string;
  product: string;
  href: string;
}) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touch, setTouch] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const inView = useInView(galleryRef, { amount: 0.4 });

  // Devices without hover can't reveal the CTA by pointing, so it stays visible there.
  useEffect(() => {
    const query = window.matchMedia("(hover: none)");
    const update = () => setTouch(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const paused = hovering || focused;
  const showCta = hovering || focused || touch;

  // Rotate through the images while the gallery is on screen and not hovered or focused.
  // Re-running on `paused` restarts the timer, so after hover ends the held image
  // gets a full interval before the next one expands.
  useEffect(() => {
    if (paused || reduced || !inView || images.length < 2) return;
    const id = window.setInterval(() => setActive((current) => (current + 1) % images.length), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused, reduced, inView, images.length]);

  const col0 = useSpring(LAYOUTS[0].cols[0], SPRING);
  const col1 = useSpring(LAYOUTS[0].cols[1], SPRING);
  const row0 = useSpring(LAYOUTS[0].rows[0], SPRING);
  const row1 = useSpring(LAYOUTS[0].rows[1], SPRING);

  useEffect(() => {
    const { cols, rows } = LAYOUTS[active] ?? LAYOUTS[0];
    const targets: [typeof col0, number][] = [[col0, cols[0]], [col1, cols[1]], [row0, rows[0]], [row1, rows[1]]];
    for (const [value, target] of targets) {
      if (reduced) value.jump(target);
      else value.set(target);
    }
  }, [active, reduced, col0, col1, row0, row1]);

  const gridTemplateColumns = useMotionTemplate`${col0}fr ${col1}fr`;
  const gridTemplateRows = useMotionTemplate`minmax(0, ${row0}fr) minmax(0, ${row1}fr)`;

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
  };

  return (
    <Reveal
      ref={galleryRef}
      variant="softScale"
      className="campaign-story-gallery"
      role="group"
      aria-label={label}
      style={{ gridTemplateColumns, gridTemplateRows }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setHovering(false);
      }}
      onFocus={() => setFocused(true)}
      onBlur={onBlur}
    >
      {images.map((image, index) => {
        const isActive = index === active;
        return (
          <figure
            key={image.src}
            className={`campaign-story-shot${index === 0 ? " is-primary" : ""}${isActive ? " is-active" : ""}`}
            onPointerEnter={(event) => {
              if (event.pointerType !== "mouse") return;
              setActive(index);
              setHovering(true);
            }}
            onClick={() => setActive(index)}
          >
            <m.div
              className="campaign-story-shot-media"
              animate={{ scale: isActive ? 1.025 : 1 }}
              transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 22 }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 720px) 66vw, (max-width: 1200px) 33vw, 420px"
                loading="lazy"
              />
            </m.div>

            <AnimatePresence initial={false}>
              {isActive && (
                <m.figcaption
                  key="caption"
                  className="campaign-shot-caption"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  transition={{ duration: reduced ? 0.15 : 0.4, ease: EASE }}
                >
                  {image.kicker && <span className="campaign-shot-kicker">{image.kicker}</span>}
                  <blockquote className="campaign-shot-quote">
                    <span aria-hidden="true">“</span>{image.caption}<span aria-hidden="true">”</span>
                  </blockquote>
                  <m.div
                    className="campaign-shot-cta-wrap"
                    initial={false}
                    animate={showCta ? { opacity: 1, y: 0, height: "auto" } : { opacity: 0, y: 6, height: 0 }}
                    transition={{ duration: reduced ? 0 : 0.32, ease: EASE }}
                  >
                    {/* Stays tabbable while hidden: focusing it sets `focused`, which reveals it. */}
                    <Link className="campaign-shot-cta" href={href}>
                      Shop {product} <span aria-hidden="true">→</span>
                    </Link>
                  </m.div>
                </m.figcaption>
              )}
            </AnimatePresence>
          </figure>
        );
      })}
    </Reveal>
  );
}
