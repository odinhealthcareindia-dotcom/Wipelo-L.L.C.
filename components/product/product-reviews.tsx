"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { categoryProductLabel, reviewCategories, type ProductReview, type RatingSummary, type ReviewCategory } from "@/lib/product-reviews";

type Filter = "all" | ReviewCategory;
type Sort = "helpful" | "recent" | "highest" | "lowest";

const PAGE_SIZE = 4;
const STRIP_SIZE = 8;
const SORTS: { value: Sort; label: string }[] = [
  { value: "helpful", label: "Most helpful" },
  { value: "recent", label: "Most recent" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
];

function timeAgo(days: number) {
  if (days < 7) return days <= 1 ? "1 day ago" : `${days} days ago`;
  if (days < 30) { const weeks = Math.round(days / 7); return `${weeks} week${weeks === 1 ? "" : "s"} ago`; }
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

function Stars({ value, size = 18 }: { value: number; size?: number }) {
  return <span className="pdp6-rev-stars" role="img" aria-label={`${value} out of 5 stars`} style={{ fontSize: size }}>
    {Array.from({ length: 5 }, (_, index) => <span key={index} aria-hidden="true" className={index < Math.round(value) ? undefined : "is-off"}>★</span>)}
  </span>;
}

// Combined figures for the "All" filter, weighted by review count.
function combine(summaries: RatingSummary[]): RatingSummary {
  const count = summaries.reduce((sum, item) => sum + item.count, 0);
  const weigh = (pick: (item: RatingSummary) => number) => summaries.reduce((sum, item) => sum + pick(item) * item.count, 0) / count;
  return {
    count,
    average: Math.round(weigh((item) => item.average) * 10) / 10,
    distribution: [0, 1, 2, 3, 4].map((index) => Math.round(weigh((item) => item.distribution[index]))) as RatingSummary["distribution"],
    recommendPercent: Math.round(weigh((item) => item.recommendPercent)),
    noStingPercent: Math.round(weigh((item) => item.noStingPercent)),
    photoCount: summaries.reduce((sum, item) => sum + item.photoCount, 0),
  };
}

export function ProductReviewsSection({ initial, reviews, summaries, productTitle }: { initial: Filter; reviews: ProductReview[]; summaries: Record<ReviewCategory, RatingSummary>; productTitle: string }) {
  const [filter, setFilter] = useState<Filter>(initial);
  const [sort, setSort] = useState<Sort>("helpful");
  const [page, setPage] = useState(0);
  const [votes, setVotes] = useState<Record<string, "yes" | "no" | undefined>>({});

  const summary = filter === "all" ? combine(reviewCategories.map((category) => summaries[category])) : summaries[filter];
  const list = useMemo(() => {
    const filtered = reviews.filter((review) => filter === "all" || review.category === filter);
    return [...filtered].sort((a, b) => sort === "recent" ? a.ageDays - b.ageDays : sort === "highest" ? b.rating - a.rating || b.helpful - a.helpful : sort === "lowest" ? a.rating - b.rating || b.helpful - a.helpful : b.helpful - a.helpful);
  }, [reviews, filter, sort]);
  const photoReviews = useMemo(() => list.filter((review) => review.photo), [list]);
  // Lightbox: null = closed, "grid" = all photos, number = index into photoReviews.
  const [viewer, setViewer] = useState<null | "grid" | number>(null);
  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const visible = list.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  function choose(next: Filter) { setFilter(next); setPage(0); }
  function goTo(next: number) {
    setPage(next);
    document.getElementById("pdp6-rev-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return <section className="pdp6-section pdp6-rev" id="reviews" aria-labelledby="pdp6-rev-title">
    <div className="wrap">
      <Stagger className="pdp6-rev-head" gap={0.09}>
        <Reveal as="span" className="pdp6-eyebrow">// Customer reviews</Reveal>
        <Reveal as="h2" id="pdp6-rev-title">Real people. <em>Real in-between moments.</em></Reveal>
        <Reveal as="p">From verified buyers of {filter === "all" ? "ON THE GO, SPOTLESS and HER" : categoryProductLabel[filter]}.</Reveal>
      </Stagger>

      <Reveal className="pdp6-rev-summary">
        <div className="pdp6-rev-score">
          <b>{summary.average.toFixed(1)}</b>
          <Stars value={summary.average} size={22} />
          <span>Based on {summary.count.toLocaleString("en-US")} reviews</span>
        </div>
        <ul className="pdp6-rev-bars" aria-label="Rating breakdown">
          {summary.distribution.map((percent, index) => <li key={index}>
            <span>{5 - index} ★</span>
            <i aria-hidden="true"><s style={{ width: `${Math.max(percent, 1)}%` }} /></i>
            <span>{percent}%</span>
          </li>)}
        </ul>
        <div className="pdp6-rev-kpis">
          <div><b className="is-accent">{summary.recommendPercent}%</b><span>would recommend</span></div>
          <div><b>{summary.noStingPercent}%</b><span>say “no sting”</span></div>
        </div>
      </Reveal>

      <Reveal className="pdp6-rev-photos">
        <div className="pdp6-rev-photos-head"><b>Customer photos</b><span>{summary.photoCount} photos</span></div>
        <ul>{photoReviews.slice(0, STRIP_SIZE).map((review, index) => {
          const more = index === STRIP_SIZE - 1 && photoReviews.length > STRIP_SIZE ? photoReviews.length - index : 0;
          return <li key={review.id}>
            <button type="button" onClick={() => setViewer(more ? "grid" : index)} aria-label={more ? `See all ${photoReviews.length} customer photos` : `Open photo from ${review.name}`}>
              <img src={review.photo} alt="" loading="lazy" />
              {more > 0 && <span className="pdp6-rev-more" aria-hidden="true">+{more}</span>}
            </button>
          </li>;
        })}</ul>
      </Reveal>

      <div className="pdp6-rev-toolbar">
        {/* <div className="pdp6-rev-filters" role="group" aria-label="Filter reviews by product">
          {(["all", ...reviewCategories] as Filter[]).map((value) => <button key={value} type="button" aria-pressed={filter === value} className={filter === value ? "is-active" : undefined} onClick={() => choose(value)}>{value === "all" ? "All" : categoryProductLabel[value]}</button>)}
        </div> */}
        <div className="pdp6-rev-actions">
          <label className="pdp6-rev-sort">Sort:
            <select value={sort} onChange={(event) => { setSort(event.target.value as Sort); setPage(0); }}>
              {SORTS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <a className="pdp6-rev-write" href={`mailto:founder@wipelo.com?subject=${encodeURIComponent(`Review: ${productTitle}`)}`}>Write a review</a>
        </div>
      </div>

      <p className="pdp6-rev-count" id="pdp6-rev-list" aria-live="polite">Showing {visible.length} of {list.length} reviews</p>
      <ol className="pdp6-rev-list">
        {visible.map((review) => {
          const vote = votes[review.id];
          return <li className="pdp6-rev-card" key={review.id}>
            <div className="pdp6-rev-author">
              <span className={`pdp6-rev-avatar is-${review.category}`} aria-hidden="true">{review.initials}</span>
              <div>
                <b>{review.name}</b>
                {review.verified && <span className="pdp6-rev-verified"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor" /><path d="M7 12.4 10.4 15.6 17 8.8" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>Verified buyer</span>}
                <small>{review.context}</small>
              </div>
            </div>
            <div className="pdp6-rev-main">
              <div className="pdp6-rev-meta"><Stars value={review.rating} /><span className={`pdp6-rev-tag is-${review.category}`}>{categoryProductLabel[review.category]}</span><span>{timeAgo(review.ageDays)}</span></div>
              <h3>{review.title}</h3>
              <p>{review.body}</p>
              <div className="pdp6-rev-helpful">Helpful?{" "}
                <button type="button" aria-pressed={vote === "yes"} onClick={() => setVotes((current) => ({ ...current, [review.id]: current[review.id] === "yes" ? undefined : "yes" }))}>Yes ({review.helpful + (vote === "yes" ? 1 : 0)})</button>
                {" · "}
                <button type="button" aria-pressed={vote === "no"} onClick={() => setVotes((current) => ({ ...current, [review.id]: current[review.id] === "no" ? undefined : "no" }))}>No</button>
              </div>
            </div>
            {review.photo && <button type="button" className="pdp6-rev-photo" onClick={() => setViewer(photoReviews.indexOf(review))} aria-label={`Open photo from ${review.name}`}><img src={review.photo} alt="" loading="lazy" /></button>}
          </li>;
        })}
      </ol>

      {pageCount > 1 && <nav className="pdp6-rev-pages" aria-label="Review pages">
        {Array.from({ length: pageCount }, (_, index) => <button key={index} type="button" aria-current={index === page ? "page" : undefined} className={index === page ? "is-active" : undefined} onClick={() => goTo(index)}>{index + 1}</button>)}
      </nav>}
    </div>
    {viewer !== null && <ReviewLightbox items={photoReviews} view={viewer} onView={setViewer} onClose={() => setViewer(null)} />}
  </section>;
}

function ReviewLightbox({ items, view, onView, onClose }: { items: ProductReview[]; view: "grid" | number; onView: (next: "grid" | number) => void; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const review = typeof view === "number" ? items[view] : null;
  const step = (delta: number) => { if (typeof view === "number") onView((view + delta + items.length) % items.length); };

  // Native modal dialog: traps focus, closes on Esc, and hands focus back to the photo that opened it.
  // The dialog is removed on unmount rather than closed, so no close event fires during cleanup.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    openerRef.current ??= document.activeElement as HTMLElement | null;
    if (!dialog.open) dialog.showModal();
    return () => { const opener = openerRef.current; requestAnimationFrame(() => { if (opener?.isConnected && !document.querySelector(".pdp6-lb[open]")) opener.focus({ preventScroll: true }); }); };
  }, []);

  return <dialog
    ref={dialogRef}
    className="pdp6-lb"
    aria-label={review ? `Photo from ${review.name}` : "All customer photos"}
    onClose={onClose}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    onKeyDown={(event) => {
      if (!review) return;
      if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
    }}
  >
    <div className="pdp6-lb-panel">
      <div className="pdp6-lb-bar">
        {review
          ? <button type="button" className="pdp6-lb-back" onClick={() => onView("grid")}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>All photos</button>
          : <b className="pdp6-lb-title">Customer photos <span>{items.length}</span></b>}
        <button type="button" className="pdp6-lb-close" onClick={onClose} aria-label="Close"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
      </div>

      {review ? <div className="pdp6-lb-body">
        <figure className="pdp6-lb-media">
          <img key={review.id} src={review.photo} alt={`Photo shared by ${review.name}`} />
          {items.length > 1 && <>
            <button type="button" className="pdp6-lb-nav is-prev" onClick={() => step(-1)} aria-label="Previous photo"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
            <button type="button" className="pdp6-lb-nav is-next" onClick={() => step(1)} aria-label="Next photo"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          </>}
        </figure>
        <div className="pdp6-lb-info" key={review.id}>
          <h3>{review.name}</h3>
          <Stars value={review.rating} />
          <blockquote>“{review.body}”</blockquote>
          <dl>
            <div><dt>Profile</dt><dd>{review.context}</dd></div>
            <div><dt>Product</dt><dd>{categoryProductLabel[review.category]}</dd></div>
            <div><dt>Posted</dt><dd>{timeAgo(review.ageDays)}{review.verified ? " · Verified buyer" : ""}</dd></div>
          </dl>
          <p className="pdp6-lb-count" aria-live="polite">{(view as number) + 1} / {items.length}</p>
        </div>
      </div>
      : <ul className="pdp6-lb-grid">
        {items.map((item, index) => <li key={item.id}><button type="button" onClick={() => onView(index)} aria-label={`Open photo from ${item.name}`}><img src={item.photo} alt="" loading="lazy" /></button></li>)}
      </ul>}
    </div>
  </dialog>;
}
