"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, type KeyboardEvent } from "react";
import { nextTabIndex, useAutoRotate } from "./use-auto-rotate";

// Long enough to read the headline and four ingredient cards before the panel changes.
const ROTATE_MS = 5000;

type Icon = "drop" | "leaf" | "heart" | "shield" | "flask" | "dots" | "spark";

export type NeedsScienceTab = {
  label: string;
  product: string;
  tone: "mint" | "stone" | "sand";
  image?: string;
  href: string;
  headline: string;
  actives: { icon: Icon; dose: string; name: string; body: string }[];
  specs: { label: string; value: string }[];
  note: string;
};

const iconPaths: Record<Icon, React.ReactNode> = {
  drop: <path d="M12 4c3 4 5 6.6 5 9.2A5 5 0 0 1 7 13.2C7 10.6 9 8 12 4Z" />,
  leaf: <><path d="M6 18c0-7 5-12 12-12 0 7-5 12-12 12Z" /><path d="M6 18 13 11" /></>,
  heart: <path d="M12 19s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 1.8C19 14.6 12 19 12 19Z" />,
  shield: <path d="M12 4 18 6.5v5c0 4-2.6 6.7-6 8-3.4-1.3-6-4-6-8v-5L12 4Z" />,
  flask: <><path d="M10 4h4M10.5 4v5L6.5 17a1.5 1.5 0 0 0 1.4 2h8.2a1.5 1.5 0 0 0 1.4-2L13.5 9V4" /><path d="M8.3 14h7.4" /></>,
  dots: <><circle cx="12" cy="12" r="7" /><circle cx="9.5" cy="11" r=".6" fill="currentColor" /><circle cx="14" cy="10.5" r=".6" fill="currentColor" /><circle cx="12.5" cy="14.5" r=".6" fill="currentColor" /></>,
  spark: <path d="M12 4v3M12 17v3M4 12h3M17 12h3M6.3 6.3l2.1 2.1M15.6 15.6l2.1 2.1M6.3 17.7l2.1-2.1M15.6 8.4l2.1-2.1" />,
};

export function NeedsScience({ tabs, heading }: { tabs: NeedsScienceTab[]; heading: React.ReactNode }) {
  const rotation = useAutoRotate(tabs.length);
  const { active } = rotation;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tab = tabs[active];

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = nextTabIndex(event.key, index, tabs.length);
    if (next === null) return;
    event.preventDefault();
    rotation.pick(next);
    tabRefs.current[next]?.focus();
  }

  return <div className="science-tabs" {...rotation.rootProps}>
    <div className="science-top">
    {heading}
    <div className="science-switch" role="tablist" aria-label="Choose a need">
      {tabs.map((item, index) => {
        const selected = index === active;
        return <button
          key={item.label}
          ref={(node) => { tabRefs.current[index] = node; }}
          type="button"
          role="tab"
          id={`science-tab-${index}`}
          aria-selected={selected}
          aria-controls="science-panel"
          tabIndex={selected ? 0 : -1}
          className={selected ? "is-active" : undefined}
          onClick={() => rotation.pick(index)}
          onKeyDown={(event) => onTabKey(event, index)}
        >
          {selected && rotation.rotating && <span
            key={active}
            className="science-progress"
            aria-hidden="true"
            style={{ animationDuration: `${ROTATE_MS}ms`, animationPlayState: rotation.running ? "running" : "paused" }}
            onAnimationEnd={rotation.advance}
          />}
          <span className="science-switch-label">{item.label}</span>
        </button>;
      })}
    </div>
    </div>

    <div className="science-panel" role="tabpanel" id="science-panel" aria-labelledby={`science-tab-${active}`} aria-live={rotation.userPicked ? "polite" : "off"}>
      <div className={`science-product science-tone-${tab.tone}`} key={`p-${active}`}>
        <div className="science-product-head">
          <span>{String(active + 1).padStart(2, "0")} · {tab.label}</span>
          <b>{tab.product}</b>
        </div>
        <div className="science-pack">
          {tab.image && <span className="science-pack-img"><Image src={tab.image} width={1402} height={1122} sizes="(max-width: 640px) 90vw, (max-width: 1020px) 80vw, 40vw" alt={`Wipelo ${tab.product} carton and individually wrapped wipe pouch`} /></span>}
        </div>
        <dl className="science-specs">
          {tab.specs.map((spec) => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}
        </dl>
      </div>

      <div className="science-detail" key={`d-${active}`}>
        <h3>{tab.headline}</h3>
        <ul className="science-actives">
          {tab.actives.map((item) => <li key={item.name}>
            <span className="science-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{iconPaths[item.icon]}</svg>
            </span>
            <div>
              <span className="science-dose">{item.dose}</span>
              <b>{item.name}</b>
              <p>{item.body}</p>
            </div>
          </li>)}
        </ul>
        <p className="science-note">{tab.note}</p>
        <Link className="science-btn" href={tab.href}>Explore {tab.product} <span aria-hidden="true">→</span></Link>
      </div>
    </div>
  </div>;
}
