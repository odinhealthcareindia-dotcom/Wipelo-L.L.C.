import { Reveal, Stagger } from "@/components/motion/reveal";
import type { ExpertReviewEntry } from "@/lib/expert-reviews";

// Colours come from the product tone (--pdp6-accent), so each product page shows its own palette.
export function ExpertReviewSection({ review }: { review: ExpertReviewEntry }) {
  return <section className="pdp6-section pdp6-expert" id="proof" aria-labelledby="pdp6-expert-title">
    <div className="wrap">
      <Stagger className="pdp6-expert-head" gap={0.09}>
        <Reveal as="h2" id="pdp6-expert-title"><em>Care</em> that you can trust</Reveal>
        <Reveal as="p">Clearly dosed formulas, reviewed by the doctors who treat this skin every day — so body care below the jaw gets the same scrutiny as your face.</Reveal>
      </Stagger>

      <div className="pdp6-expert-stage">
        <Reveal as="figure" variant="slideFromRight" className="pdp6-expert-media">
          <img src={review.image} alt={review.imageAlt} loading="lazy" />
          <span className="pdp6-expert-badge">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6.5 12.4 10.2 16l7.3-8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {review.badge}
          </span>
        </Reveal>
        <Reveal as="blockquote" variant="slideFromLeft" delay={0.15} className="pdp6-expert-card">
          <p>&ldquo;{review.quote}&rdquo;</p>
          <footer>
            <span className="pdp6-expert-avatar" aria-hidden="true">{review.initials}</span>
            <span className="pdp6-expert-who">
              <b>{review.name}<svg viewBox="0 0 24 24" width="17" height="17" role="img" aria-label="Verified"><circle cx="12" cy="12" r="11" fill="currentColor" /><path d="M7 12.4 10.4 15.6 17 8.8" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></b>
              <small>{review.credentials} · {review.affiliation}</small>
            </span>
          </footer>
          {!review.signed && <span className="pdp6-expert-draft">Placeholder — replace with signed advisor quote</span>}
        </Reveal>
      </div>
    </div>
  </section>;
}
