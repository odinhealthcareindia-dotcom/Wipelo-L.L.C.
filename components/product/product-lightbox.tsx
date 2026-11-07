"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";

export type LightboxSlide = { image: string; alt: string };

/**
 * Full-screen product image viewer. Built on <dialog> so Escape, focus trapping and an inert page come from the browser.
 * The index is owned by the gallery, so closing the viewer leaves the gallery on the image the shopper last looked at.
 */
export function ProductLightbox({ slides, index, onIndexChange, open, onClose, title }: {
  slides: LightboxSlide[];
  index: number;
  onIndexChange: (index: number) => void;
  open: boolean;
  onClose: () => void;
  title: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const count = slides.length;
  const go = (step: number) => { setZoomed(false); onIndexChange((index + step + count) % count); };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.classList.add("lightbox-lock");
    } else if (!open && dialog.open) dialog.close();
    if (!open) { setZoomed(false); document.documentElement.classList.remove("lightbox-lock"); }
  }, [open]);

  useEffect(() => () => document.documentElement.classList.remove("lightbox-lock"), []);

  // Keep the active thumbnail in view.
  useEffect(() => {
    if (!open) return;
    const rail = thumbsRef.current;
    const thumb = rail?.children[index] as HTMLElement | undefined;
    thumb?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index, open]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
  };

  const setOriginFrom = (event: ReactPointerEvent<HTMLElement>) => {
    const box = (event.currentTarget.querySelector("img") ?? event.currentTarget).getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((event.clientX - box.left) / box.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - box.top) / box.height) * 100));
    setOrigin(`${x}% ${y}%`);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => { pointer.current = { x: event.clientX, y: event.clientY }; };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => { if (zoomed) setOriginFrom(event); };
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointer.current;
    pointer.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!zoomed && Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy)) { go(dx < 0 ? 1 : -1); return; }
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
      if (!zoomed) setOriginFrom(event);
      setZoomed((value) => !value);
    }
  };

  const slide = slides[index];

  return <dialog
    ref={dialogRef}
    className="lightbox"
    aria-label={`${title} images`}
    onClose={onClose}
    onCancel={(event) => { if (zoomed) { event.preventDefault(); setZoomed(false); } }}
    onKeyDown={onKeyDown}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
  >
    {open && slide && <div className="lightbox-shell">
      <header className="lightbox-bar">
        <span className="lightbox-count" aria-live="polite">{index + 1} / {count}</span>
        <span className="lightbox-title">{title}</span>
        <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close full-screen view" autoFocus>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </button>
      </header>

      <div
        className={`lightbox-stage${zoomed ? " is-zoomed" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { pointer.current = null; }}
      >
        <img
          key={slide.image}
          src={slide.image}
          alt={slide.alt}
          draggable={false}
          style={{ transformOrigin: origin }}
        />
        <span className="lightbox-hint" aria-hidden="true">{zoomed ? "Click to zoom out" : "Click to zoom in"}</span>
      </div>

      {count > 1 && <>
        <button type="button" className="lightbox-arrow lightbox-prev" onClick={() => go(-1)} aria-label="Previous image"><span aria-hidden="true" /></button>
        <button type="button" className="lightbox-arrow lightbox-next" onClick={() => go(1)} aria-label="Next image"><span aria-hidden="true" /></button>
        <div className="lightbox-thumbs" ref={thumbsRef}>
          {slides.map((item, i) => <button
            key={`${item.image}-${i}`}
            type="button"
            className={i === index ? "active" : undefined}
            aria-label={`Show image ${i + 1}`}
            aria-current={i === index}
            onClick={() => { setZoomed(false); onIndexChange(i); }}
          ><img src={item.image} alt="" loading="lazy" /></button>)}
        </div>
      </>}
    </div>}
  </dialog>;
}
