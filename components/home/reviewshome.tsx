"use client";

import { useRef, type KeyboardEvent, type TouchEvent } from "react";
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

  function go(index: number, focus = false) {
    rotation.pick(index);
    if (focus) dotRefs.current[index]?.focus();
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
    go(delta < 0 ? (active === last ? 0 : active + 1) : (active === 0 ? last : active - 1));
  }

  return (
    <section className="sec voice-section" id="reviews" aria-labelledby="voice-title">
      <div className="wrap" {...rotation.rootProps}>
        <div className="voice-head rv">
          <h2 id="voice-title" className="voice-tag">// 4.8 <span aria-hidden="true">★★★★★</span> · 2,847 verified reviews*</h2>
          <p>97% would recommend*</p>
        </div>

        <div className="voice-stage rv">
          <button type="button" className="voice-arrow" aria-label="Previous review" onClick={() => go(active === 0 ? last : active - 1)}>←</button>
          <div
            className="voice-quotes"
            role="tabpanel"
            id="voice-panel"
            aria-labelledby={`voice-tab-${active}`}
            aria-live={rotation.userPicked ? "polite" : "off"}
            onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
            onTouchEnd={onTouchEnd}
          >
            {reviews.map((review, index) => <figure key={review.name} className={index === active ? "is-active" : undefined} aria-hidden={index !== active}>
              <div className="voice-meta"><Stars count={review.stars} /><span className="voice-product">{review.product}</span></div>
              <blockquote>&ldquo;{review.quote}&rdquo;</blockquote>
            </figure>)}
          </div>
          <button type="button" className="voice-arrow is-next" aria-label="Next review" onClick={() => go(active === last ? 0 : active + 1)}>→</button>
        </div>

        <div className="voice-people rv">
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
                <img src={review.photo} alt="" width="200" height="200" loading="lazy" />
                {selected && rotation.rotating && <svg className="voice-ring" viewBox="0 0 100 100" aria-hidden="true">
                  <circle
                    key={active}
                    cx="50" cy="50" r="48" pathLength="100"
                    style={{ animationDuration: `${ROTATE_MS}ms`, animationPlayState: rotation.running ? "running" : "paused" }}
                    onAnimationEnd={rotation.advance}
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
        </div>

      </div>
    </section>
  );
}
