"use client";

import { useState, type ReactNode } from "react";
import { Reveal, Stagger } from "@/components/motion/reveal";

export type FAQItem = { question: string; answer: ReactNode };

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openItems, setOpenItems] = useState<Set<number>>(() => new Set());

  function toggleItem(index: number) {
    setOpenItems((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return <section className="sec" id="faq">
    <div className="wrap">
      <Stagger className="sec-head" gap={0.09}>
        <Reveal as="span" className="mono-tag">// Wipelo, explained</Reveal>
        <Reveal as="h2" className="h-section">A few helpful answers.</Reveal>
      </Stagger>
      <Stagger className="faq-list" gap={0.06}>
        {items.map((item, index) => {
          const isOpen = openItems.has(index);
          const questionId = `faq-question-${index + 1}`;
          const answerId = `faq-answer-${index + 1}`;

          return <Reveal className={`faq-item${isOpen ? " is-open" : ""}`} key={questionId}>
            <button
              className="faq-trigger"
              type="button"
              id={questionId}
              aria-expanded={isOpen}
              aria-controls={answerId}
              onClick={() => toggleItem(index)}
            >
              <span className="faq-question">{item.question}</span>
              <span className="pm" aria-hidden="true">+</span>
            </button>
            <div
              id={answerId}
              className={`faq-answer-clip${isOpen ? " is-visible" : ""}`}
              role="region"
              aria-labelledby={questionId}
              aria-hidden={!isOpen}
              inert={!isOpen}
            >
              <div className="faq-answer-inner">
                <div className="faq-a">{item.answer}</div>
              </div>
            </div>
          </Reveal>;
        })}
      </Stagger>
    </div>
  </section>;
}
