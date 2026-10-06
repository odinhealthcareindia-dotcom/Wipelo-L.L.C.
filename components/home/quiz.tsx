"use client";

import { useState } from "react";
import Link from "next/link";

export type QuizProduct = { handle: string; title: string; description: string; price: string };

const questions = [
  {
    label: "01 — Where's the need?",
    options: [
      ["bare", "Back, shoulders, body breakouts"],
      ["first", "Everywhere in-between"],
      ["her", "Feminine care"],
      ["clean", "Just honest clean, no actives"],
    ],
  },
  {
    label: "02 — When do you reach?",
    options: [
      ["gym", "After training"],
      ["intim", "Before & after intimacy"],
      ["travel", "Travel & long days"],
      ["daily", "Every day, everywhere"],
    ],
  },
  {
    label: "03 — Your skin is…",
    options: [
      ["breakout", "Breakout-prone"],
      ["sensitive", "Reactive, easily stripped"],
      ["normal", "Low-maintenance"],
    ],
  },
] as const;

export function QuizSection({ products }: { products: QuizProduct[] }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const wanted = answers[1]?.toLowerCase();
  let match = wanted ? products.find((product) => product.handle.toLowerCase().includes(wanted) || product.title.toLowerCase().includes(wanted)) : undefined;
  if (wanted === "first" && answers[3] === "breakout") {
    match = products.find((product) => /bare|acne|body|back/i.test(`${product.handle} ${product.title}`)) ?? match;
  }
  match ??= products[0];
  const showResult = Object.keys(answers).length > 0;

  return <section className="sec" style={{ paddingTop: 0 }}>
    <div className="wrap">
      <div className="quiz rv">
        <div className="quiz-head">
          <span className="mono-tag">// 3 taps, 10 seconds</span>
          <h2 className="h-card" style={{ margin: "12px 0 8px" }}>Build your routine.</h2>
          <p style={{ fontSize: "14.5px", color: "var(--ink-60)" }}>Answer three questions. We&apos;ll match the active to the need — that&apos;s the whole science.</p>
        </div>
        <div className="quiz-steps">
          {questions.map((question, index) => <div className="q-step" key={question.label}>
            <span className="q-label">{question.label}</span>
            <div className="q-opts" data-q={index + 1}>
              {question.options.map(([value, label]) => <button
                className={`q-opt${answers[index + 1] === value ? " sel" : ""}`}
                data-v={value}
                type="button"
                aria-pressed={answers[index + 1] === value}
                key={value}
                onClick={() => setAnswers((current) => ({ ...current, [index + 1]: value }))}
              >{label}</button>)}
            </div>
          </div>)}
        </div>
        <div className={`quiz-result${showResult ? " show" : ""}`} id="quizResult" aria-live="polite">
          <div className="qr-copy">
            <span className="mono-tag">// Your match</span>
            <h3>{match?.title ?? "Your routine starts here."}</h3>
            <p>{match?.description || "Products will appear as soon as they are added and published in Shopify."}</p>
          </div>
          <Link className="btn btn-teal" href={match ? `/products/${encodeURIComponent(match.handle)}` : "/shop"}>
            {match ? `Explore ${match.title} · ${match.price}` : "Visit the shop →"}
          </Link>
        </div>
      </div>
    </div>
  </section>;
}
