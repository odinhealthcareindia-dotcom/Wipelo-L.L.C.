"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProductCategory } from "@/lib/product-profiles";
import { AnimatePresence, m } from "framer-motion";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { EASE } from "@/lib/motion";

export type QuizProduct = { handle: string; category: ProductCategory; title: string; price: string };

const choices = [
  { handle: "on-the-go", label: "I want a refresh between showers", detail: "For surface sweat, odor-causing residue, and everyday buildup on the body." },
  { handle: "spotless", label: "I want care for body breakouts", detail: "For breakout-prone areas such as the back, chest, and shoulders." },
  { handle: "her", label: "I want an intimate-area refresh", detail: "For occasional, fragrance-free cleansing of external intimate skin." },
] as const;

export function QuizSection({ products }: { products: QuizProduct[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const choice = choices.find((item) => item.handle === selected);
  // Answers map to a product category, so a renamed handle in Shopify still finds the right product.
  const product = products.find((item) => item.category === selected);

  return <section className="sec" style={{ paddingTop: 0 }} id="choose-your-wipe">
    <div className="wrap">
      <Reveal className="quiz">
        <div className="quiz-head">
          <span className="mono-tag">// Choose by what you need</span>
          <h2 className="h-card" style={{ margin: "12px 0 8px" }}>Which moment is yours?</h2>
          <p style={{ fontSize: "14.5px", color: "var(--ink-60)" }}>Start with the kind of care you’re looking for.</p>
        </div>
        <div className="quiz-steps">
          <div className="q-step">
            <span className="q-label">Choose one</span>
            <Stagger className="q-opts" gap={0.08} data-q="1">
              {choices.map((item) => <Reveal
                as="button"
                className={`q-opt${selected === item.handle ? " sel" : ""}`}
                type="button"
                aria-pressed={selected === item.handle}
                key={item.handle}
                onClick={() => setSelected(item.handle)}
                whileHover={{ y: -1 }}
              >
                {selected === item.handle && <m.span layoutId="quiz-highlight" className="q-opt-highlight" transition={{ duration: 0.45, ease: EASE }} aria-hidden="true" />}
                <span className="q-opt-label">{item.label}</span>
              </Reveal>)}
            </Stagger>
          </div>
        </div>
        <div aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {choice && <m.div
              key={choice.handle}
              className="quiz-result show"
              id="quizResult"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <div className="qr-copy">
                <span className="mono-tag">// A place to start</span>
                <h3>{product?.title ?? "Choose a moment above"}</h3>
                <p>{choice.detail}</p>
              </div>
              {product && <Link className="btn btn-teal" href={`/products/${encodeURIComponent(product.handle)}`}>
                Explore {product.title} · {product.price}
              </Link>}
            </m.div>}
          </AnimatePresence>
        </div>
      </Reveal>
    </div>
  </section>;
}
