"use client";

import { m } from "framer-motion";
import { Reveal } from "@/components/motion/reveal";
import { useMobileSlider } from "@/components/motion/use-mobile-slider";
import type { IngredientDetail } from "@/lib/product-profiles";

const ADVANCE_MS = 2000;
// Keep in sync with the mobile `gap` on .pdp6-formula-cards in globals.css.
const SLIDE_GAP = 12;

function Card({ ingredient }: { ingredient: IngredientDetail }) {
  return <>
    <div className={`pdp6-formula-media${ingredient.image ? " has-photo" : ""}`}>
      {ingredient.image
        ? <img src={ingredient.image} alt={ingredient.imageAlt ?? ""} loading="lazy" draggable={false} />
        : <span className="pdp6-formula-dish" aria-hidden="true"><b>{(ingredient.dose ?? "✓").split(" · ").map((part) => <span key={part}>{part}</span>)}</b></span>}
    </div>
    <div className="pdp6-formula-copy">
      <h3>{ingredient.title}{ingredient.dose && <span className="sr-only">, {ingredient.dose}</span>}</h3>
      <div><p>{ingredient.does ?? ingredient.body}</p></div>
    </div>
  </>;
}

/**
 * "What's in it" ingredient cards. Desktop keeps the 2×2 grid with per-card reveals. On phones
 * the cards become a slider: auto-advances every 2 s, swipes left/right, pauses on tap.
 */
export function FormulaCards({ ingredients, label }: { ingredients: IngredientDetail[]; label: string }) {
  const count = ingredients.length;
  const { mobile, reduced, viewportRef, index, paused, trackProps, togglePaused, goTo } = useMobileSlider({ count, intervalMs: ADVANCE_MS, gap: SLIDE_GAP });

  return <div className="pdp6-formula-slider" role={mobile ? "region" : undefined} aria-roledescription={mobile ? "carousel" : undefined} aria-label={mobile ? label : undefined}>
    <div className="pdp6-formula-viewport" ref={viewportRef}>
      <m.ul className="pdp6-formula-cards" aria-label={mobile ? undefined : label} {...trackProps}>
        {ingredients.map((ingredient, i) => mobile
          // In the slider, off-screen cards must not wait on a scroll reveal, so they render plain.
          ? <li className="pdp6-formula-card" key={ingredient.title} aria-hidden={i !== index ? true : undefined} aria-roledescription="slide" aria-label={`${i + 1} of ${count}`}><Card ingredient={ingredient} /></li>
          : <Reveal as="li" className="pdp6-formula-card" key={ingredient.title}><Card ingredient={ingredient} /></Reveal>)}
      </m.ul>
    </div>
    {/* Same dots + pause control as the routine slider, so PDP sliders behave and look alike. */}
    <div className="pdp6-routine-controls">
      <div className="pdp6-routine-dots">
        {ingredients.map((ingredient, i) => <button key={ingredient.title} type="button" className={i === index ? "is-active" : undefined} aria-label={`Show ${ingredient.title}`} aria-current={i === index ? "true" : undefined} onClick={() => goTo(i)}><span /></button>)}
      </div>
      {!reduced && <button type="button" className="pdp6-routine-toggle" onClick={togglePaused} aria-label={paused ? "Play ingredient slides" : "Pause ingredient slides"}>
        {paused
          ? <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
          : <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M7.5 5.5h3v13h-3zM13.5 5.5h3v13h-3z" fill="currentColor" /></svg>}
      </button>}
    </div>
  </div>;
}
