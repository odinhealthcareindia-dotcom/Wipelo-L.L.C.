import Image from "next/image";
import Link from "next/link";

const steps = [
  { title: "Tear open", body: "One sealed sachet, fits a pocket or gym bag." },
  { title: "One gentle pass", body: "Underarms, feet, neck — wherever the day built up." },
  { title: "Feel reset", body: "No rinse needed. Carry on until your next shower." },
];

export function OnTheGoSection({ productHref, price }: { productHref: string; price?: string }) {
  return (
    <section className="sec otgx-section" aria-labelledby="on-the-go-title">
      <div className="wrap">
        <div className="otgx-grid">
          <div className="otgx-copy rv">
            <span className="otgx-tag">// Wipelo ON THE GO</span>
            <h2 id="on-the-go-title">
              Freshness reset,<br /><em>between showers.</em>
            </h2>
            <p className="otgx-lede">
              One individually sealed wipe lifts surface sweat and odor-causing residue from underarms, feet and body — so the shower can wait.
            </p>
            <div className="otgx-ctas">
              <Link className="otgx-btn" href={productHref}>
                Shop ON THE GO <span aria-hidden="true">→</span>
              </Link>
              <Link className="otgx-link" href="#ingredients">See how it works</Link>
            </div>
            <p className="otgx-meta">{price ? `${price} · ` : ""}Individually sealed wipes · Mild cleansers + zinc ricinoleate</p>
          </div>

          <div className="otgx-visual rv">
            <div className="otgx-orbit">
              <div className="otgx-photo">
                <Image
                  src="/on-the-go-home.png"
                  width={1536}
                  height={1024}
                  sizes="(max-width: 920px) 90vw, 560px"
                  alt="Three moments in a cleansing routine: tearing open a sealed wipe, one gentle pass over the shoulder, and fresh skin after."
                />
              </div>
              <span className="otgx-chip otgx-chip-light" aria-hidden="true">Individually sealed</span>
              <span className="otgx-chip otgx-chip-teal" aria-hidden="true">With zinc ricinoleate</span>
            </div>
          </div>
        </div>

        <ol className="otgx-steps rv">
          {steps.map((step, index) => (
            <li key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <b>{step.title}</b>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
