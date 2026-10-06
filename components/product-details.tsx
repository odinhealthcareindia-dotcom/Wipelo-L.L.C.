import Link from "next/link";
import { FAQAccordion } from "@/components/faq-accordion";
import type { PdpContent } from "@/lib/pdp-content";
import type { ShopifyProduct } from "@/lib/shopify";
import { moneyLabel } from "@/lib/money";

function safeText(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

export function ProductDetailSections({ content, related }: { content: PdpContent; related: ShopifyProduct[] }) {
  const relatedByHandle = new Map(related.map((product) => [product.handle, product]));
  const crossSell = content.crossSell.handles.map((handle) => relatedByHandle.get(handle)).filter((product): product is ShopifyProduct => Boolean(product));

  return <>
    <div className="press product-press"><div className="wrap press-in"><span className="press-label">The evidence</span><p>{content.pressNote}</p></div></div>

    <section className="sec dark product-moments">
      <div className="wrap">
        <div className="sec-head"><span className="mono-tag">// You know the moments</span><h2 className="h-section">A small reset for<br />the moments between.</h2></div>
        <div className="mom-grid">{content.moments.map((moment, index) => <article className={`mom product-moment product-moment-${index % 4}`} key={`${moment.time}-${moment.title}`}><div className="moment-no mono">0{index + 1}</div><div className="m-cap"><span className="mono">{moment.time}</span><h3>{moment.title}</h3><p>{moment.body}</p></div></article>)}</div>
      </div>
    </section>

    <section className="sec dark product-mechanism" id="science">
      <div className="wrap">
        <div className="mech-grid">
          <div><span className="mono-tag">// The proposed mechanism</span><h2 className="h-section product-mechanism-heading">Designed around<br />{content.mechanism.name}.</h2><p className="mechanism-caveat">{content.mechanism.note}</p><div className="mech-steps">{content.mechanism.steps.map((step, index) => <article className="mech-step" key={step.title}><span className="mn">0{index + 1}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></article>)}</div></div>
          <div className="product-evidence">
            <span className="mono-tag">// Three numbers to know</span>
            <div className="stats-grid product-stats">{content.mechanism.numbers.map((item) => <article className="stat" key={item.value}><span className="num">{item.value}</span><div className="lbl">{item.label}</div><p className="src">{item.note}</p></article>)}</div>
            <aside className="phwrap product-proof"><div className="ph-head"><span className="mono-tag">// One proof visual</span></div><h3>{content.mechanism.proofTitle}</h3><p>{content.mechanism.proof}</p><div className="product-source-list">{content.mechanism.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</div></aside>
          </div>
        </div>
      </div>
    </section>

    <section className="sec product-outcomes"><div className="wrap"><div className="sec-head"><span className="mono-tag">// No promised transformation</span><h2 className="h-section">What actually happens.</h2></div><div className="tl">{content.outcomes.map((outcome) => <article className="tl-cell" key={outcome.when}><span className="when">{outcome.when}</span><p>{outcome.body}</p></article>)}</div></div></section>

    <section className="sec product-howto"><div className="wrap"><div className="sec-head"><span className="mono-tag">// A considered clean-up</span><h2 className="h-section">How to use it.</h2></div><div className="ritual">{content.howToUse.map((step, index) => <article className="rit" key={step}><span className="rn">0{index + 1}</span><span className="rtag">{index === 0 ? "Tear" : index === 1 ? "Wipe" : "Bin"}</span><p>{step}</p></article>)}</div></div></section>

    <section className="sec product-perspective"><div className="wrap"><div className="clin"><div className="perspective-mark" aria-hidden="true">W</div><div><span className="mono-tag">// Independent guidance</span><blockquote>{content.perspective.body}</blockquote><p className="perspective-source"><a href={content.perspective.url} target="_blank" rel="noreferrer">{content.perspective.source} ↗</a></p><p className="perspective-disclaimer">{content.perspective.disclaimer}</p></div></div></div></section>

    <section className="sec product-comparison"><div className="wrap"><div className="sec-head"><span className="mono-tag">// A straightforward comparison</span><h2 className="h-section">Where it fits.</h2></div><div className="cmp-wrap"><table className="cmp-table"><thead><tr>{content.comparison.columns.map((column, index) => <th className={index === 1 ? "us" : undefined} key={column}>{column}</th>)}</tr></thead><tbody>{content.comparison.rows.map((row, index) => <tr key={`${row[0]}-${index}`}>{row.map((cell, cellIndex) => <td className={cellIndex === 1 ? "us" : undefined} key={`${cell}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody></table></div><p className="cmp-note">{content.comparison.note}</p></div></section>

    <section className="sec product-reviews" id="reviews"><div className="wrap"><div className="rev-head"><div><span className="mono-tag">// Customer reviews</span><div className="rev-score"><span className="big">—</span><div className="meta"><b>{content.reviews.summary}</b>0 verified reviews · no aggregate rating yet</div></div></div><span className="mono-tag">New release</span></div><div className="chips" aria-label="Review use-case filters">{content.reviews.filters.map((filter) => <span className="chip" key={filter}>{filter}</span>)}</div><div className="reviews-empty"><p>{content.reviews.emptyText}</p></div></div></section>

    <section className="sec dark product-receipts"><div className="wrap"><div className="sec-head"><span className="mono-tag">// The receipts</span><h2 className="h-section">Real routines, when they arrive.</h2></div><div className="receipt-list">{content.receipts.items.map((item, index) => <div className="receipt-row" key={item}><span className="mn">0{index + 1}</span><p>{item}</p></div>)}</div><p className="receipt-note">{content.receipts.emptyText}</p></div></section>

    {crossSell.length > 0 && <section className="sec product-cross-sell"><div className="wrap"><div className="sec-head"><span className="mono-tag">// The rest of the line</span><h2 className="h-section">A routine for the real world.</h2><p className="lede">{content.crossSell.body}</p></div><div className="xs-grid">{crossSell.map((product) => <Link href={`/products/${product.handle}`} className="xs-card" key={product.id}><span className="mono-tag">Wipelo · 30 individually wrapped wipes</span><h3>{product.title}</h3><p>{product.description}</p><span className="xs-price">From {moneyLabel(product.priceRange.minVariantPrice)}</span><span className="link-arrow">Explore product →</span></Link>)}</div></div></section>}

    <section className="sec product-guarantee"><div className="wrap"><div className="guar"><div><span className="mono-tag">// {content.guarantee.title}</span><h2>{content.guarantee.title}</h2><p>{content.guarantee.body}</p><p className="fine">{content.guarantee.note}</p></div><div className="guar-seal" aria-hidden="true"><div className="seal"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" /></svg><span className="w">W</span></div></div></div></div></section>

    <section className="sec product-ingredients" id="ingredients"><div className="wrap"><div className="sec-head"><span className="mono-tag">// Inside the formula</span><h2 className="h-section">What’s in it.</h2><p className="lede">{content.ingredients.intro}</p></div><div className="ingredient-cards">{content.ingredients.tabs.map((tab, index) => <article className="ingredient-card" key={tab.title}><span className="mono-tag">0{index + 1} / Ingredient note</span><h3>{tab.title}</h3><p>{tab.body}</p></article>)}</div><div className="inci-box"><span className="mono-tag">// Full INCI · indicative only</span><p>{content.ingredients.inci}</p></div><p className="free-from"><b>Free from:</b> {content.ingredients.freeFrom}</p></div></section>

    <FAQAccordion items={content.faqs.map((item) => ({ questionHTML: safeText(item.question), answerHTML: safeText(item.answer) }))} />

    <section className="sec dark beat product-brand-band"><div className="wrap"><span className="mono-tag">// {content.brandBand.strapline}</span><h2>{content.brandBand.title}</h2><p>{content.brandBand.body}</p></div></section>
    <div className="band product-tagline" aria-label={content.brandBand.strapline}><div className="band-track" aria-hidden="true"><span>{content.brandBand.strapline}</span><span className="sp">✦</span><span>{content.brandBand.strapline}</span><span className="sp">✦</span></div></div>
    <section className="product-legal"><div className="wrap"><p>{content.legal}</p><span className="mono">Wipelo · Product information from Shopify</span></div></section>
  </>;
}
