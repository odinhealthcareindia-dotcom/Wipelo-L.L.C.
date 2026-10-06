"use client";

import { useState } from "react";

type FAQItem = { questionHTML: string; answerHTML: string };

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

  return <section className="sec [padding:clamp(72px,9vw,128px)_0]" id="faq">
    <div className="wrap [max-width:var(--max)] [margin:0_auto] [padding:0_min(5vw,40px)] max-[1020px]:[&.hero-grid]:[padding-left:min(5vw,40px)] max-[1020px]:[&.hero-grid]:[padding-right:min(5vw,40px)] max-[1020px]:[&.pdp]:[padding-left:min(5vw,40px)] max-[1020px]:[&.pdp]:[padding-right:min(5vw,40px)]">
      <div className="sec-head rv [margin-bottom:clamp(36px,5vw,64px)] [max-width:760px] [opacity:0] [transform:translateY(26px)] [transition:opacity_.8s_var(--ease),transform_.8s_var(--ease)] motion-reduce:[opacity:1] motion-reduce:[transform:none] motion-reduce:[transition:none] [&_.mono-tag]:[display:block] [&_.mono-tag]:[margin-bottom:16px] [&_p]:[margin-top:18px] [&.in]:[opacity:1] [&.in]:[transform:none] [&.rv-now]:[transition:none]">
        <span className="mono-tag font-wipelo-mono [font-size:10px] [letter-spacing:.16em] uppercase text-wipelo-teal-deep">// Asked, answered</span>
        <h2 className="h-section [font-size:clamp(32px,4.2vw,56px)]">Questions people actually ask.</h2>
      </div>
      <div className="faq-list rv [max-width:820px] [opacity:0] [transform:translateY(26px)] [transition:opacity_.8s_var(--ease),transform_.8s_var(--ease)] motion-reduce:[opacity:1] motion-reduce:[transform:none] motion-reduce:[transition:none] [&.in]:[opacity:1] [&.in]:[transform:none] [&.rv-now]:[transition:none]">
        {items.map((item, index) => {
          const isOpen = openItems.has(index);
          const questionId = `faq-question-${index + 1}`;
          const answerId = `faq-answer-${index + 1}`;

          return <div className={`faq-item [border-bottom:1px_solid_var(--hairline)] [&_.faq-trigger]:[appearance:none] [&_.faq-trigger]:[width:100%] [&_.faq-trigger]:[border:0] [&_.faq-trigger]:[background:transparent] [&_.faq-trigger]:[color:inherit] [&_.faq-trigger]:[text-align:left] [&_.faq-trigger]:[display:flex] [&_.faq-trigger]:[align-items:center] [&_.faq-trigger]:[justify-content:space-between] [&_.faq-trigger]:[gap:24px] [&_.faq-trigger]:[padding:24px_4px] [&_.faq-trigger]:[cursor:pointer] [&_.faq-trigger]:[font:600_16.5px/1.4_var(--in)] [&_.faq-trigger:focus-visible]:[outline:2px_solid_var(--teal)] [&_.faq-trigger:focus-visible]:[outline-offset:3px] [&_.faq-trigger:focus-visible]:[border-radius:2px] [&_.faq-trigger_.pm]:[font-family:var(--mo)] [&_.faq-trigger_.pm]:[font-size:18px] [&_.faq-trigger_.pm]:[color:var(--teal-deep)] [&_.faq-trigger_.pm]:[transition:transform_.3s_var(--ease)] [&_.faq-trigger_.pm]:[flex:none] [&.is-open_.faq-trigger_.pm]:[transform:rotate(45deg)] [&_.faq-a]:[padding:0_4px_26px] [&_.faq-a]:[font-size:14.5px] [&_.faq-a]:[line-height:1.7] [&_.faq-a]:[color:var(--ink-60)] [&_.faq-a]:[max-width:64ch]${isOpen ? " is-open" : ""}`} key={questionId}>
            <button
              className="faq-trigger"
              type="button"
              id={questionId}
              aria-expanded={isOpen}
              aria-controls={answerId}
              onClick={() => toggleItem(index)}
            >
              <span className="faq-question" dangerouslySetInnerHTML={{ __html: item.questionHTML }} />
              <span className="pm" aria-hidden="true">+</span>
            </button>
            <div
              id={answerId}
              className={`faq-answer-clip grid [grid-template-rows:0fr] [opacity:0] [visibility:hidden] [transition:grid-template-rows_.38s_cubic-bezier(.22,1,.36,1),opacity_.22s_ease,visibility_0s_linear_.38s] [&.is-visible]:[grid-template-rows:1fr] [&.is-visible]:[opacity:1] [&.is-visible]:[visibility:visible] [&.is-visible]:[transition:grid-template-rows_.38s_cubic-bezier(.22,1,.36,1),opacity_.22s_ease,visibility_0s]${isOpen ? " is-visible" : ""}`}
              role="region"
              aria-labelledby={questionId}
              aria-hidden={!isOpen}
              inert={!isOpen}
            >
              <div className="faq-answer-inner [min-height:0] overflow-hidden">
                <div className="faq-a" dangerouslySetInnerHTML={{ __html: item.answerHTML }} />
              </div>
            </div>
          </div>;
        })}
      </div>
    </div>
  </section>;
}
