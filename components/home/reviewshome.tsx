"use client";

import { m } from "framer-motion";
import { useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { CountUp } from "@/components/motion/count-up";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { EASE } from "@/lib/motion";
import { nextTabIndex, useAutoRotate } from "./use-auto-rotate";

const ROTATE_MS = 5000;

const reviews = [
  { name: "Marcus T.", city: "Chicago", product: "ON THE GO", stars: 5, photo: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=200&h=200&q=70&auto=format&fit=crop&crop=faces", quote: "The 40 minutes between the gym and my 9 a.m. used to be a problem. Now it's one sealed packet. Nobody at work knows, which is the whole point." },
  { name: "Dana R.", city: "Austin", product: "HER", stars: 5, photo: "https://images.unsplash.com/photo-1524550158212-33f2ff985344?w=200&h=200&q=70&auto=format&fit=crop&crop=faces", quote: "Finally a brand that says what it's for without being weird about it. No sting, no perfume cloud, no baby-aisle shame." },
  { name: "Priya K.", city: "NYC", product: "ON THE GO", stars: 5, photo: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=200&h=200&q=70&auto=format&fit=crop&crop=faces", quote: "I fly weekly. Individually sealed means the last wipe in the box is as wet as the first — every other brand I tried dried into sadness by week two." },
  { name: "Jordan M.", city: "LA", product: "SPOTLESS", stars: 4, photo: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=200&h=200&q=70&auto=format&fit=crop&crop=faces", quote: "SPOTLESS actually helped my back after two weeks of consistent use. Wish it was cheaper, but it's the only thing that treated it like skincare instead of a punishment." },
  { name: "Sam W.", city: "Portland", product: "ON THE GO", stars: 5, photo: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=200&h=200&q=70&auto=format&fit=crop&crop=faces", quote: "Bought for travel, stayed for everything else. The spec label on the pack is a conversation starter — I've converted three friends by leaving it on the counter." },
  { name: "Elena V.", city: "Miami", product: "HER", stars: 5, photo: "https://images.unsplash.com/photo-1489278353717-f64c6ee8a4d2?w=200&h=200&q=70&auto=format&fit=crop&crop=faces", quote: "My skin strips if you look at it wrong. pH-matched turned out to be the difference between 'refreshed' and 'tight and angry.' HER is the first one that gets it." },
];

function Stars({ count }: { count: number }) {
  return <span className="voice-stars" aria-label={`${count} out of 5 stars`}>
    {Array.from({ length: 5 }, (_, index) => <span key={index} aria-hidden="true" className={index < count ? undefined : "is-off"}>★</span>)}
  </span>;
}

export function ReviewsSectionHome() {
  const rotation = useAutoRotate(reviews.length);
  const { active } = rotation;
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStart = useRef<number | null>(null);
  const last = reviews.length - 1;
  // Which quote just left, and which way the carousel is moving (1 = forward), for the slide direction.
  const [slide, setSlide] = useState({ prev: -1, dir: 1 });

  function go(index: number, focus = false, dir = index > active ? 1 : -1) {
    if (index === active) return;
    setSlide({ prev: active, dir });
    rotation.pick(index);
    if (focus) dotRefs.current[index]?.focus();
  }

  function advance() {
    setSlide({ prev: active, dir: 1 });
    rotation.advance();
  }

  function quoteState(index: number) {
    if (index === active) return { opacity: 1, x: 0 };
    if (index === slide.prev) return { opacity: 0, x: -slide.dir * 40 };
    // Park the rest on the side the next quote will arrive from; they're invisible, so the jump is instant.
    return { opacity: 0, x: slide.dir * 40, transition: { duration: 0 } };
  }

  function onDotKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = nextTabIndex(event.key, index, reviews.length);
    if (next === null) return;
    event.preventDefault();
    go(next, true);
  }

  function onTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStart.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    if (Math.abs(delta) < 40) return;
    go(delta < 0 ? (active === last ? 0 : active + 1) : (active === 0 ? last : active - 1), false, delta < 0 ? 1 : -1);
  }

  return (
    <section className="sec voice-section" id="reviews" aria-labelledby="voice-title">
      <div className="wrap" {...rotation.rootProps}>
        <Stagger className="voice-head" gap={0.09}>
          <Reveal as="h2" id="voice-title" className="voice-tag">
            // <CountUp to={4.8} decimals={1} />{" "}
            <Stagger as="span" className="voice-tag-stars" gap={0.05} aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => <Reveal as="span" variant="pop" key={index}>★</Reveal>)}
            </Stagger>
            {" "}· 2,847 verified reviews*
          </Reveal>
          <Reveal as="p">97% would recommend*</Reveal>
        </Stagger>

        <Reveal className="voice-stage">
          <button type="button" className="voice-arrow" aria-label="Previous review" onClick={() => go(active === 0 ? last : active - 1, false, -1)}>←</button>
          <div
            className="voice-quotes"
            role="tabpanel"
            id="voice-panel"
            aria-labelledby={`voice-tab-${active}`}
            aria-live={rotation.userPicked ? "polite" : "off"}
            onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
            onTouchEnd={onTouchEnd}
          >
            {reviews.map((review, index) => <m.figure
              key={review.name}
              className={index === active ? "is-active" : undefined}
              aria-hidden={index !== active}
              initial={false}
              animate={quoteState(index)}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <div className="voice-meta"><Stars count={review.stars} /><span className="voice-product">{review.product}</span></div>
              <blockquote>&ldquo;{review.quote}&rdquo;</blockquote>
            </m.figure>)}
          </div>
          <button type="button" className="voice-arrow is-next" aria-label="Next review" onClick={() => go(active === last ? 0 : active + 1, false, 1)}>→</button>
        </Reveal>

        <Reveal className="voice-people">
          <div className="voice-dots" role="tablist" aria-label="Choose a review">
            {reviews.map((review, index) => {
              const selected = index === active;
              return <button
                key={review.name}
                ref={(node) => { dotRefs.current[index] = node; }}
                type="button"
                role="tab"
                id={`voice-tab-${index}`}
                aria-selected={selected}
                aria-controls="voice-panel"
                aria-label={`Review from ${review.name}`}
                tabIndex={selected ? 0 : -1}
                className={selected ? "is-active" : undefined}
                onClick={() => go(index)}
                onKeyDown={(event) => onDotKey(event, index)}
              >
                <m.img key={selected ? "on" : "off"} src={review.photo} alt="" width="200" height="200" loading="lazy" initial={selected ? { scale: 0.9 } : false} animate={{ scale: 1 }} transition={{ duration: 0.45, ease: EASE }} />
                {selected && rotation.rotating && <svg className="voice-ring" viewBox="0 0 100 100" aria-hidden="true">
                  <circle
                    key={active}
                    cx="50" cy="50" r="48" pathLength="100"
                    style={{ animationDuration: `${ROTATE_MS}ms`, animationPlayState: rotation.running ? "running" : "paused" }}
                    onAnimationEnd={advance}
                  />
                </svg>}
              </button>;
            })}
          </div>
          <div className="voice-who" key={active}>
            <b>{reviews[active].name}<span className="voice-tick" aria-label="Verified buyer">
              <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="M2.5 6.2 5 8.6l4.6-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span></b>
            <span>{reviews[active].city}</span>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
