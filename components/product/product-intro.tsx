import type { CommerceProduct } from "@/lib/commerce";
import { moneyLabel } from "@/lib/money";
import { productIntros } from "@/lib/product-intro";
import type { ProductCategory } from "@/lib/product-profiles";
import styles from "./product-intro.module.css";

const icons = {
  drop: <><path d="M12 3c3.4 4.4 6 7.7 6 11a6 6 0 0 1-12 0c0-3.3 2.6-6.6 6-11Z" /><path d="M10 15h4" /></>,
  texture: <><path d="M7 3v18M12 3v18M17 3v18M3 7h18M3 12h18M3 17h18" /></>,
  pack: <><path d="M3 6h18v14H3zM3 10h18M8 15h8" /></>,
  shield: <path d="m12 3 9 3v7c0 4-4 7-9 9-5-2-9-5-9-9V6l9-3Z" />,
};

export function ProductIntro({ product, category }: { product: CommerceProduct; category: ProductCategory }) {
  const content = productIntros[category];
  if (!content) return null;
  const lowestPrice = product.variants.filter((variant) => variant.availableForSale).reduce<(typeof product.variants)[number] | undefined>((lowest, variant) => !lowest || Number(variant.price.amount) < Number(lowest.price.amount) ? variant : lowest, undefined)?.price;

  return <section className={`${styles.section} ${styles[category]}`} aria-labelledby="product-intro-title">
    <div className={styles.copy}>
      <p className={styles.kicker}><span>New</span>{content.kicker}</p>
      <h2 id="product-intro-title" className={styles.title}>{content.title}<br /><em>{content.titleEnd}</em></h2>
      <p className={styles.description}>{content.description}</p>
      <div className={styles.benefits}>
        {content.benefits.map((benefit) => <div className={styles.benefit} key={benefit.title}>
          <span className={styles.icon}><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[benefit.icon]}</svg></span>
          <h3>{benefit.title}</h3><p>{benefit.body}</p>
        </div>)}
      </div>
      <div className={styles.story}>
        <p className={styles.eyebrow}>Why {content.name} exists</p>
        <h3>{content.storyTitle}</h3>
        <p>{content.story}</p>
        <a className={styles.cta} href="#product">Shop {content.name}{lowestPrice && <> · from {moneyLabel(lowestPrice)}</>}<span aria-hidden="true">→</span></a>
        <small>Proposed formulation ranges; final values printed on pack.</small>
      </div>
    </div>
    <div className={styles.media}>
      <img src={content.image} alt={content.imageAlt} loading="lazy" width="1024" height="1536" />
      <dl className={styles.facts}>{content.facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
    </div>
  </section>;
}
