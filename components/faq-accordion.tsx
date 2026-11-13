"use client";

import { useState, type ReactNode } from "react";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { BackgroundVideo, type BackgroundVideoSource } from "@/components/motion/background-video";

export type FAQItem = { question: string; answer: ReactNode };

export function FAQAccordion({
  items,
  tag = "// Wipelo, explained",
  title = "A few helpful answers.",
  backgroundVideo,
}: {
  items: FAQItem[];
  tag?: string;
  title?: string;
  /** Optional silent looping video behind the section; switches on the frosted, readable layout. */
  backgroundVideo?: BackgroundVideoSource;
}) {
  const [openItems, setOpenItems] = useState<Set<number>>(() => new Set());

  function toggleItem(index: number) {
    setOpenItems((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return <section className={backgroundVideo ? "sec faq-video-section" : "sec"} id="faq">
    {backgroundVideo && <div className="faq-video-bg" aria-hidden="true">
      <BackgroundVideo className="faq-video" src={backgroundVideo.src} poster={backgroundVideo.poster} />
      <div className="faq-video-scrim" />
    </div>}
    <div className="wrap">
      <Stagger className="sec-head" gap={0.09}>
        <Reveal as="span" className="mono-tag">{tag}</Reveal>
        <Reveal as="h2" className="h-section">{title}</Reveal>
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
