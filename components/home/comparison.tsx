"use client";

import { m, type Variants } from "framer-motion";
import { useRef, type KeyboardEvent } from "react";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { nextTabIndex, useAutoRotate } from "./use-auto-rotate";

// Long enough to scan the competitor column before it changes.
const ROTATE_MS = 4000;

type Mark = { ok: boolean | null; text?: string };

const competitors = [
  { name: "Baby wipes", price: "$0.04" },
  { name: "“Fresh” body wipes", price: "$0.35" },
  { name: "Bar of soap", price: "$0.02" },
];

const rows: { label: string; wipelo: Mark; others: Mark[] }[] = [
  { label: "Removes surface sweat", wipelo: { ok: true }, others: [{ ok: true }, { ok: true }, { ok: true }] },
  { label: "Formulated for adult body skin", wipelo: { ok: true }, others: [{ ok: false, text: "infants" }, { ok: false }, { ok: false }] },
  { label: "pH-matched 4.5–5.5", wipelo: { ok: true, text: "pH-True™" }, others: [{ ok: false }, { ok: false }, { ok: false, text: "pH ~10" }] },
  { label: "Treatment active, dosed", wipelo: { ok: true, text: "one per SKU" }, others: [{ ok: false }, { ok: false, text: "perfume" }, { ok: false }] },
  { label: "Individually sealed", wipelo: { ok: true, text: "all 50" }, others: [{ ok: false, text: "shared tub" }, { ok: false }, { ok: null }] },
  { label: "Odor treated at source", wipelo: { ok: true, text: "zinc complex" }, others: [{ ok: false }, { ok: false, text: "masked" }, { ok: false, text: "briefly" }] },
  { label: "Fits in a jacket pocket", wipelo: { ok: true }, others: [{ ok: false }, { ok: true }, { ok: false }] },
];

const wipeloPrice = "$0.60";

// Wipelo's ticks pop in on a spring once the rows have landed.
const markPop: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 22, delay: 0.12 } },
};

function MarkCell({ mark, us = false }: { mark: Mark; us?: boolean }) {
  // Only Wipelo's column pops in on scroll; the competitor column re-mounts on every switch and fades in instead.
  return <m.span className="honest-mark" variants={us ? markPop : undefined}>
    {mark.ok === true && <span className={`honest-yes${us ? " is-us" : ""}`} aria-label="Yes">
      <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="M2.5 6.2 5 8.6l4.6-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>}
    {mark.ok === false && <span className="honest-no" aria-label="No">
      <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
    </span>}
    {mark.ok === null && <span className="honest-na" aria-label="Not applicable">—</span>}
    {mark.text && <span className="honest-text">{mark.text}</span>}
  </m.span>;
}

export function ComparisonSection() {
  const rotation = useAutoRotate(competitors.length);
  const { active } = rotation;
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const competitor = competitors[active];

  function onPillKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = nextTabIndex(event.key, index, competitors.length);
    if (next === null) return;
    event.preventDefault();
    rotation.pick(next);
    pillRefs.current[next]?.focus();
  }

  return (
    <section className="sec honest-section" aria-labelledby="honest-title">
      <div className="wrap">
        <Stagger className="honest-head" gap={0.09}>
          <Reveal as="span" className="honest-tag">// The honest table</Reveal>
          <Reveal as="h2" id="honest-title">Any wipe removes sweat.<br /><em>That was never the question.</em></Reveal>
        </Stagger>

        <div className="honest-body" {...rotation.rootProps}>
          <Reveal className="honest-switch">
            <span id="honest-switch-label">Compare Wipelo with</span>
            <div role="tablist" aria-labelledby="honest-switch-label">
              {competitors.map((item, index) => {
                const selected = index === active;
                return <button
                  key={item.name}
                  ref={(node) => { pillRefs.current[index] = node; }}
                  type="button"
                  role="tab"
                  id={`honest-tab-${index}`}
                  aria-selected={selected}
                  aria-controls="honest-panel"
                  tabIndex={selected ? 0 : -1}
                  className={selected ? "is-active" : undefined}
                  onClick={() => rotation.pick(index)}
                  onKeyDown={(event) => onPillKey(event, index)}
                >
                  {selected && rotation.rotating && <span
                    key={active}
                    className="honest-progress"
                    aria-hidden="true"
                    style={{ animationDuration: `${ROTATE_MS}ms`, animationPlayState: rotation.running ? "running" : "paused" }}
                    onAnimationEnd={rotation.advance}
                  />}
                  <span className="honest-pill-label">{item.name}</span>
                </button>;
              })}
            </div>
          </Reveal>

          <Reveal variant="fadeIn" className="honest-card" role="tabpanel" id="honest-panel" aria-labelledby={`honest-tab-${active}`}>
            <Stagger as="table" className="honest-table" gap={0.05}>
              <thead>
                <tr>
                  <th scope="col">What matters</th>
                  <th scope="col" className="is-us">Wipelo</th>
                  <th scope="col" className="is-them"><span key={active} className="honest-swap">{competitor.name}</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => <Reveal as="tr" variant="fadeIn" key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td className="is-us"><MarkCell mark={row.wipelo} us /></td>
                  <td className="is-them"><span key={active} className="honest-swap"><MarkCell mark={row.others[active]} /></span></td>
                </Reveal>)}
              </tbody>
              {/* <tfoot>
                <Reveal as="tr" variant="fadeIn">
                  <th scope="row">Price per use</th>
                  <td className="is-us honest-price">{wipeloPrice}</td>
                  <td className="is-them honest-price"><span key={active} className="honest-swap">{competitor.price}</span></td>
                </Reveal>
              </tfoot> */}
            </Stagger>
          </Reveal>

          {/* <p className="honest-note" aria-live={rotation.userPicked ? "polite" : "off"}>Row one is a tie on purpose. We don&rsquo;t win on price either — we win on engineering. If {competitor.price} does it for you, we genuinely respect that.</p> */}
        </div>
      </div>
    </section>
  );
}
