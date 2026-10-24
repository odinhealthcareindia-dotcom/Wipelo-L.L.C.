import Link from "next/link";
export function HeroVisual() {
  return <div className="hero-visual rv">
    <div className="hero-comp home-product-hero">
      <div className="hero-badge"><span className="mono">Three wipes. Three distinct needs.</span></div>
      <img
          className="home-product-hero-image"
          src="/hero-image.png"
          alt="Wipelo ON THE GO, HER, and SPOTLESS individually wrapped wipes"
          width={1186}
          height={735}
        />
      <div className="home-product-hero-details">
        <span className="mono">ON THE GO · SPOTLESS · HER</span>
        <Link className="link-arrow" href="/shop#products">Explore the range →</Link>
      </div>
    </div>
  </div>;
}
