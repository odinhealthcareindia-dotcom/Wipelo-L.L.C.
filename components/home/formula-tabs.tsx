"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type KeyboardEvent } from "react";
import { nextTabIndex, useAutoRotate } from "./use-auto-rotate";

// Long enough to read a panel's title and ingredient rows before it changes.
const ROTATE_MS = 4000;

export type FormulaTab = {
  name: string;
  title: string;
  image: string;
  alt: string;
  ingredients: { name: string; role: string }[];
  note: string;
  href: string;
};

export function FormulaTabs({ tabs }: { tabs: FormulaTab[] }) {
  const rotation = useAutoRotate(tabs.length);
  const { active } = rotation;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = nextTabIndex(event.key, index, tabs.length);
    if (next === null) return;
    event.preventDefault();
    rotation.pick(next);
    tabRefs.current[next]?.focus();
  }

  return <div className="formula-tabs" {...rotation.rootProps}>
    <div className="formula-switch" role="tablist" aria-label="Choose a wipe">
      {tabs.map((tab, index) => {
        const selected = index === active;
        return <button
          key={tab.name}
          ref={(node) => { tabRefs.current[index] = node; }}
          type="button"
          role="tab"
          id={`formula-tab-${index}`}
          aria-selected={selected}
          aria-controls="formula-panel"
          tabIndex={selected ? 0 : -1}
          className={selected ? "is-active" : undefined}
          onClick={() => rotation.pick(index)}
          onKeyDown={(event) => onTabKey(event, index)}
        >
          {selected && rotation.rotating && <span
            key={active}
            className="formula-progress"
            aria-hidden="true"
            style={{ animationDuration: `${ROTATE_MS}ms`, animationPlayState: rotation.running ? "running" : "paused" }}
            onAnimationEnd={rotation.advance}
          />}
          <span className="formula-switch-label">{tab.name}</span>
        </button>;
      })}
    </div>

    <div className="formula-card" role="tabpanel" id="formula-panel" aria-labelledby={`formula-tab-${active}`}>
      <div className="formula-media">
        {tabs.map((tab, index) => <Image
          key={tab.image}
          src={tab.image}
          alt={index === active ? tab.alt : ""}
          aria-hidden={index !== active}
          className={index === active ? "is-active" : undefined}
          width={1536}
          height={1024}
          sizes="(max-width: 860px) 92vw, 620px"
        />)}
      </div>
      <div className="formula-body" key={active} aria-live={rotation.userPicked ? "polite" : "off"}>
        <span className="formula-kicker">{String(active + 1).padStart(2, "0")} / {tabs[active].name}</span>
        <h3>{tabs[active].title}</h3>
        <dl className="formula-rows">
          {tabs[active].ingredients.map((ingredient) => <div key={ingredient.name}>
            <dt>{ingredient.name}</dt>
            <dd>{ingredient.role}</dd>
          </div>)}
        </dl>
        <p className="formula-note">{tabs[active].note}</p>
        <Link className="formula-btn" href={tabs[active].href}>Explore {tabs[active].name} <span aria-hidden="true">→</span></Link>
      </div>
    </div>
  </div>;
}
