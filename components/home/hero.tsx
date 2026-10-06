import Link from "next/link";
import type { ShopifyProduct } from "@/lib/shopify";
import { HeroVisual } from "./hero-visual";

export function HeroSection({ product }: { product: ShopifyProduct | null }) {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <span className="mono-tag">✦ Functional Wet Wipes™</span>
          <h1 className="h-display">Skin is skin.<br /><em>Everywhere.</em></h1>
          <p className="lede">Your face has three serums and a sunscreen. Your back has a baby wipe. So we gave the wet wipe a job — one active per need, dosed to work, sealed fresh every single time.</p>
          <div className="hero-ctas">
            <Link href="/shop#products" className="btn btn-abyss btn-lg">Shop the line <span className="ar">→</span></Link>
            <Link href="/science#science" className="link-arrow">Why it's different ↓</Link>
          </div>
          <div className="trust-chips">
            <span className="tchip"><b>✦</b> Derm-assessed*</span>
            <span className="tchip"><b>pH</b> True™ 4.5–5.5</span>
            <span className="tchip"><b>50×</b> Single-Seal</span>
            <span className="tchip"><b>30d</b> Guarantee</span>
          </div>
          <div className="hero-spec spec" style={{ marginTop: "28px" }}>
            <div className="spec-row"><span className="k marker">//</span><span className="k">Active-Matched Formulation™</span><span className="dots"></span><span className="v">Shopify catalog</span></div>
            <div className="spec-row"><span className="k">pH</span><span className="dots"></span><span className="v">4.5–5.5 <span className="marker">[pH-TRUE™]</span></span></div>
            <div className="spec-row"><span className="k">Format</span><span className="dots"></span><span className="v">50 × Single-Seal Fresh™</span></div>
          </div>
        </div>
        <HeroVisual product={product} />
      </div>
    </section>
  );
}
