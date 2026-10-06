"use client";

import { useEffect, useRef, type ReactNode } from "react";

type QuizProduct = { handle: string; title: string; description: string; price: string };

export function LegacyInteractions({ children, products = [] }: { children: ReactNode; products?: QuizProduct[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef(products);
  productsRef.current = products;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const showReveals = () => {
      const viewHeight = window.innerHeight || document.documentElement.clientHeight;
      root.querySelectorAll<HTMLElement>(".rv:not(.in)").forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (rect.top < viewHeight - 30 && rect.bottom > 0) item.classList.add("in");
      });
      root.querySelectorAll<HTMLElement>("[data-count]:not(.counted)").forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (rect.top >= viewHeight - 20 || rect.bottom <= 0) return;
        item.classList.add("counted");
        const target = Number(item.dataset.count);
        const suffix = item.dataset.suffix || "";
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reducedMotion || !Number.isFinite(target)) {
          item.textContent = `${target}${suffix}`;
          return;
        }
        let start: number | null = null;
        const animate = (time: number) => {
          start ??= time;
          const progress = Math.min(1, (time - start) / 1100);
          const eased = 1 - Math.pow(1 - progress, 3);
          item.textContent = `${Math.round(target * eased)}${suffix}`;
          if (progress < 1) window.requestAnimationFrame(animate);
        };
        window.requestAnimationFrame(animate);
      });
    };
    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const choice = target.closest<HTMLButtonElement>(".q-opt");
      if (choice && root.contains(choice)) {
        const group = choice.closest<HTMLElement>(".q-opts");
        group?.querySelectorAll(".q-opt").forEach((option) => option.classList.remove("sel"));
        choice.classList.add("sel");
        const picked = root.querySelector<HTMLButtonElement>(".q-opts[data-q='1'] .q-opt.sel")?.dataset.v;
        const products = productsRef.current;
        const wanted = picked?.toLowerCase();
        let match = wanted ? products.find((product) => product.handle.toLowerCase().includes(wanted) || product.title.toLowerCase().includes(wanted)) : undefined;
        if (picked === "first" && root.querySelector<HTMLElement>(".q-opts[data-q='3'] .q-opt.sel")?.dataset.v === "breakout") {
          match = products.find((product) => /bare|acne|body|back/i.test(`${product.handle} ${product.title}`)) ?? match;
        }
        match ??= products[0];
        const result = root.querySelector<HTMLElement>("#quizResult");
        const name = root.querySelector<HTMLElement>("#qrName");
        const why = root.querySelector<HTMLElement>("#qrWhy");
        const cta = root.querySelector<HTMLAnchorElement>("#qrCta");
        if (result && name && why && cta) {
          result.classList.add("show");
          if (match) {
            name.textContent = match.title;
            why.textContent = match.description || "A product from the Wipelo Shopify catalog.";
            cta.href = `/products/${match.handle}`;
            cta.textContent = `Explore ${match.title} · ${match.price}`;
          } else {
            name.textContent = "Your routine starts here.";
            why.textContent = "Products will appear as soon as they are added and published in Shopify.";
            cta.href = "/shop";
            cta.textContent = "Visit the shop →";
          }
        }
      }

      const filter = target.closest<HTMLButtonElement>(".chip[data-f]");
      if (filter && root.contains(filter)) {
        root.querySelectorAll(".chip[data-f]").forEach((chip) => chip.classList.remove("on"));
        filter.classList.add("on");
        const tag = filter.dataset.f;
        root.querySelectorAll<HTMLElement>(".rev-card").forEach((card) => {
          const visible = tag === "all" || (card.dataset.tags || "").split(/\s+/).includes(tag || "");
          card.classList.toggle("hidden", !visible);
          if (visible) card.classList.add("in");
        });
      }

      const sachet = target.closest<HTMLElement>(".sachet");
      if (sachet && root.contains(sachet)) sachet.classList.toggle("torn");
    };
    const handleKey = (event: KeyboardEvent) => {
      if ((event.key === "Enter" || event.key === " ") && event.target instanceof HTMLElement && event.target.classList.contains("sachet")) {
        event.preventDefault();
        event.target.classList.toggle("torn");
      }
    };
    const handleInput = (event: Event) => {
      if (!(event.target instanceof HTMLInputElement) || !event.target.closest("#baSlider")) return;
      event.target.closest<HTMLElement>("#baSlider")?.style.setProperty("--cut", `${event.target.value}%`);
    };
    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || !form.matches(".nl-form")) return;
      event.preventDefault();
      form.reset();
      const toast = root.querySelector<HTMLElement>(".toast") ?? document.createElement("div");
      toast.className = "toast on";
      toast.setAttribute("role", "status");
      toast.textContent = "Welcome in. Messages, not newsletters.";
      if (!toast.parentElement) root.appendChild(toast);
      window.setTimeout(() => toast.classList.remove("on"), 2600);
    };

    root.addEventListener("click", handleClick);
    root.addEventListener("keydown", handleKey);
    root.addEventListener("input", handleInput);
    root.addEventListener("submit", handleSubmit);
    window.addEventListener("scroll", showReveals, { passive: true });
    window.addEventListener("resize", showReveals);
    window.setTimeout(showReveals, 40);
    root.querySelectorAll<HTMLElement>(".sachet").forEach((sachet) => {
      sachet.setAttribute("role", "button");
      sachet.setAttribute("aria-label", "Tear the seal");
      sachet.setAttribute("tabindex", "0");
    });

    return () => {
      root.removeEventListener("click", handleClick);
      root.removeEventListener("keydown", handleKey);
      root.removeEventListener("input", handleInput);
      root.removeEventListener("submit", handleSubmit);
      window.removeEventListener("scroll", showReveals);
      window.removeEventListener("resize", showReveals);
    };
  }, []);

  return <div className="legacy-page [&_.rv]:[opacity:1] [&_.rv]:[transform:none] [&_.sku-card_a_h3]:[color:var(--ink)]" ref={rootRef}>{children}</div>;
}
