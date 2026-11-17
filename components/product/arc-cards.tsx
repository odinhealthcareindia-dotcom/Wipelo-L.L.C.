"use client";

import { m, type PanInfo, type Transition } from "framer-motion";
import { useEffect, useState } from "react";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { useMobileSlider } from "@/components/motion/use-mobile-slider";
import type { ProductProfile } from "@/lib/product-profiles";

type Expectation = ProductProfile["expectations"][number];

const ADVANCE_MS = 4000;
const SWIPE_PX = 50;
const SETTLE = { type: "spring", stiffness: 240, damping: 28 } as const;
const FLICK: Transition = { duration: 0.8, times: [0, 0.42, 1], ease: [0.4, 0, 0.2, 1] };

function visibleStats(item: Expectation, showDrafts: boolean) {
  return item.stats.filter((stat) => showDrafts || !stat.placeholder);
}

/** Desktop: the original three-column cards, untouched. */
function ArcGrid({ items, showDrafts }: { items: Expectation[]; showDrafts: boolean }) {
  return <Stagger as="ol" className="pdp6-arc-cards" gap={0.12}>
    {items.map((item, index) => <Reveal as="li" className="pdp6-arc-card" key={item.window}>
      <div className="pdp6-arc-media">
        <img src={item.img} alt={item.imgAlt ?? ""} loading="lazy" />
        <span className="pdp6-arc-window">{item.window}</span>
        <span className="pdp6-arc-num" aria-hidden="true">{index + 1}</span>
      </div>
      <div className="pdp6-arc-body">
        <h3>{item.title}</h3>
        <p>{item.body}</p>
        {visibleStats(item, showDrafts).length > 0 && <ul className="pdp6-arc-stats">
          {visibleStats(item, showDrafts).map((stat) => <li key={stat.label}><b>{stat.value}</b> {stat.label}</li>)}
        </ul>}
      </div>
    </Reveal>)}
  </Stagger>;
}

// Where a card sits in the deck: 0 is the front card, 1 and 2 peek out to the right behind it.
function deckPose(depth: number, width: number) {
  return { x: depth * width * 0.075, scale: 1 - depth * 0.06, rotate: depth * 2.5, opacity: 1 };
}

/**
 * "What actually happens". Desktop shows the three-column cards. On phones the steps become a
 * deck of play cards: the front card flicks off to the left every few seconds and the next one
 * steps up (1 → 2 → 3 → 1). Swipe left/right to move through it; tap a card to pause.
 */
export function ArcCards({ items, showDrafts }: { items: Expectation[]; showDrafts: boolean }) {
  const count = items.length;
  const { mobile, reduced, viewportRef, viewportWidth, index, paused, togglePaused, goTo, advance } = useMobileSlider({ count, intervalMs: ADVANCE_MS });
  // The card that is mid-flick (the old front card going forward, or the card coming back on
  // a backward swipe). Derived during render so the very first frame already knows it.
  const [shown, setShown] = useState(index);
  const [flick, setFlick] = useState<{ card: number; forward: boolean } | null>(null);
  if (shown !== index) {
    const forward = ((index - shown + count) % count) === 1 || count === 2;
    setShown(index);
    setFlick(reduced ? null : { card: forward ? shown : index, forward });
  }
  useEffect(() => {
    if (!flick) return;
    const timer = window.setTimeout(() => setFlick(null), 820);
    return () => window.clearTimeout(timer);
  }, [flick]);
  const width = viewportWidth || 320;

  if (!mobile) return <ArcGrid items={items} showDrafts={showDrafts} />;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_PX || info.velocity.x < -400) advance(1);
    else if (info.offset.x > SWIPE_PX || info.velocity.x > 400) advance(-1);
  };

  return <div className="pdp6-deck" role="region" aria-roledescription="carousel" aria-label="What actually happens">
    <div className="pdp6-deck-stage" ref={viewportRef}>
      <ol className="pdp6-deck-cards" aria-live={paused ? "polite" : "off"}>
        {items.map((item, i) => {
          const depth = (i - index + count) % count;
          const pose = deckPose(depth, width);
          const front = depth === 0;
          // Flicking card: out to the left above the deck, then into its new place (the back
          // of the deck going forward, the front coming back).
          const flicking = flick?.card === i;
          const animate = flicking
            ? { x: [null, -width * 1.12, pose.x], rotate: [null, -10, pose.rotate], scale: [null, 0.96, pose.scale], opacity: [1, 0, 1] }
            : pose;
          const stats = visibleStats(item, showDrafts);
          return <m.li
            key={item.window}
            className={`pdp6-deck-card${front ? " is-front" : ""}`}
            style={{ zIndex: flicking ? count + 1 : count - depth }}
            initial={false}
            animate={animate}
            transition={reduced ? { duration: 0 } : flicking ? FLICK : SETTLE}
            drag={front ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.55}
            onDragEnd={front ? onDragEnd : undefined}
            onTap={front || flicking ? togglePaused : undefined}
            aria-hidden={front ? undefined : true}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
          >
            <div className="pdp6-deck-photo">
              <img src={item.img} alt={item.imgAlt ?? ""} loading="lazy" draggable={false} />
              <span className="pdp6-deck-pip" aria-hidden="true">{i + 1}</span>
            </div>
            <div className="pdp6-deck-body">
              <span className="pdp6-deck-window">{item.window}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              {stats.length > 0 && <ul className="pdp6-deck-stats">{stats.map((stat) => <li key={stat.label}><b>{stat.value}</b> {stat.label}</li>)}</ul>}
            </div>
            {/* The mirrored corner index, as on a playing card. */}
            <span className="pdp6-deck-pip pdp6-deck-pip-flip" aria-hidden="true">{i + 1}</span>
          </m.li>;
        })}
      </ol>
    </div>
    <div className="pdp6-routine-controls">
      <div className="pdp6-routine-dots">
        {items.map((item, i) => <button key={item.window} type="button" className={i === index ? "is-active" : undefined} aria-label={`Show ${item.window}: ${item.title}`} aria-current={i === index ? "step" : undefined} onClick={() => goTo(i)}><span /></button>)}
      </div>
      {!reduced && <button type="button" className="pdp6-routine-toggle" onClick={togglePaused} aria-label={paused ? "Play cards" : "Pause cards"}>
        {paused
          ? <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
          : <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M7.5 5.5h3v13h-3zM13.5 5.5h3v13h-3z" fill="currentColor" /></svg>}
      </button>}
    </div>
  </div>;
}
