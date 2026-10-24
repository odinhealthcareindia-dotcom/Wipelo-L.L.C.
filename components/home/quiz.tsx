"use client";

import { useState } from "react";
import Link from "next/link";

export type QuizProduct = { handle: string; title: string; price: string };

const choices = [
  { handle: "on-the-go", label: "I want a refresh between showers", detail: "For surface sweat, odor-causing residue, and everyday buildup on the body." },
  { handle: "spotless", label: "I want care for body breakouts", detail: "For breakout-prone areas such as the back, chest, and shoulders." },
  { handle: "her", label: "I want an intimate-area refresh", detail: "For occasional, fragrance-free cleansing of external intimate skin." },
] as const;

export function QuizSection({ products }: { products: QuizProduct[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const choice = choices.find((item) => item.handle === selected);
  const product = products.find((item) => item.handle === selected);

  return <section className="sec" style={{ paddingTop: 0 }} id="choose-your-wipe">
    <div className="wrap">
      <div className="quiz rv">
        <div className="quiz-head">
          <span className="mono-tag">// Choose by what you need</span>
          <h2 className="h-card" style={{ margin: "12px 0 8px" }}>Which moment is yours?</h2>
          <p style={{ fontSize: "14.5px", color: "var(--ink-60)" }}>Start with the kind of care you’re looking for.</p>
        </div>
        <div className="quiz-steps">
          <div className="q-step">
            <span className="q-label">Choose one</span>
            <div className="q-opts" data-q="1">
              {choices.map((item) => <button
                className={`q-opt${selected === item.handle ? " sel" : ""}`}
                type="button"
                aria-pressed={selected === item.handle}
                key={item.handle}
                onClick={() => setSelected(item.handle)}
              >{item.label}</button>)}
            </div>
          </div>
        </div>
        <div className={`quiz-result${choice ? " show" : ""}`} id="quizResult" aria-live="polite">
          <div className="qr-copy">
            <span className="mono-tag">// A place to start</span>
            <h3>{product?.title ?? "Choose a moment above"}</h3>
            <p>{choice?.detail ?? "We’ll point you to the wipe made for that need."}</p>
          </div>
          {product && <Link className="btn btn-teal" href={`/products/${encodeURIComponent(product.handle)}`}>
            Explore {product.title} · {product.price}
          </Link>}
        </div>
      </div>
    </div>
  </section>;
}
