"use client";

import { useMemo, useState } from "react";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { categoryProductLabel, reviewCategories, type ProductReview, type RatingSummary, type ReviewCategory } from "@/lib/product-reviews";

type Filter = "all" | ReviewCategory;
type Sort = "helpful" | "recent" | "highest" | "lowest";

const PAGE_SIZE = 4;
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
    photos: [...new Set(summaries.flatMap((item) => item.photos.slice(0, 3)))].slice(0, 8),
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
        <ul>{summary.photos.map((photo) => <li key={photo}><img src={photo} alt="Customer photo" loading="lazy" /></li>)}</ul>
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
            {review.photo && <img className="pdp6-rev-photo" src={review.photo} alt={`Photo from ${review.name}`} loading="lazy" />}
          </li>;
        })}
      </ol>

      {pageCount > 1 && <nav className="pdp6-rev-pages" aria-label="Review pages">
        {Array.from({ length: pageCount }, (_, index) => <button key={index} type="button" aria-current={index === page ? "page" : undefined} className={index === page ? "is-active" : undefined} onClick={() => goTo(index)}>{index + 1}</button>)}
      </nav>}
    </div>
  </section>;
}
