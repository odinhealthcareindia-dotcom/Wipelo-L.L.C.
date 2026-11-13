import Link from "next/link";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { CampaignGallery, type GalleryImage } from "@/components/home/campaign-gallery";

type CampaignStory = {
  id: string;
  product: string;
  eyebrow: string;
  title: string;
  body: string;
  hrefKey: "onTheGo" | "spotless" | "her";
  note?: string;
  reversed?: boolean;
  tone: "mist" | "cream";
  images: GalleryImage[];
};

const stories: CampaignStory[] = [
  {
    id: "on-the-go-story",
    product: "ON THE GO",
    eyebrow: "// Freshness for full days",
    title: "A reset that fits between everything.",
    body: "An individually wrapped body wipe for the commute, after a workout, or whenever a shower has to wait.",
    hrefKey: "onTheGo",
    note: "Made for the moments in between",
    tone: "mist",
    images: [
      { src: "/images/campaign/on-the-go/01-on-the-gob3.webp", alt: "A smiling woman holds up an individually wrapped ON THE GO wipe.", caption: "Fresh shouldn’t depend on fragrance. Cleanse the sweat, not just the smell.", kicker: "Zinc ricinoleate · odor control" },
      { src: "/images/campaign/on-the-go/03-on-the-go.webp", alt: "ON THE GO wipes ready beside a bag for the day.", caption: "One wipe, individually wrapped, ready for whatever the day holds.", kicker: "Bag-ready" },
      { src: "/images/campaign/on-the-go/10-on-the-go.webp", alt: "A man holds an individually wrapped ON THE GO wipe.", caption: "A full reset between the gym, the commute and everything after.", kicker: "Freshness for full days" },
    ],
  },
  {
    id: "spotless-story",
    product: "SPOTLESS",
    eyebrow: "// Body care, within reach",
    title: "Give hard-to-reach skin a little more thought.",
    body: "A practical wipe step for breakout-prone body areas like the back, chest, and shoulders. Follow the directions on the pack and introduce active ingredients gradually.",
    hrefKey: "spotless",
    note: "For back · chest · shoulders",
    reversed: true,
    tone: "cream",
    images: [
      { src: "/images/campaign/spotless/03-reach.webp", alt: "A woman reaches for a SPOTLESS wipe from the carton.", caption: "Skincare shouldn’t stop at your face.", kicker: "For back · chest · shoulders" },
      { src: "/images/campaign/spotless/08-three-sachets.webp", alt: "Three individually wrapped SPOTLESS wipes fanned out on a green surface.", caption: "Salicylic acid and niacinamide, one wipe at a time.", kicker: "BHA + niacinamide" },
      { src: "/images/campaign/spotless/07-portrait-male.webp", alt: "A man holds a SPOTLESS wipe beside his face.", caption: "A simple wipe step for the skin you can’t easily reach.", kicker: "Body care, within reach" },
    ],
  },
  {
    id: "her-story",
    product: "HER",
    eyebrow: "// Occasional external care",
    title: "A gentle refresh, with clear boundaries.",
    body: "Individually wrapped for occasional external intimate cleansing, when a little extra comfort and discretion fits your day.",
    hrefKey: "her",
    note: "External use only · Never insert",
    tone: "mist",
    images: [
      { src: "/images/campaign/her/01-her-candid-portrait.webp", alt: "A laughing woman holds the HER carton in front of her.", caption: "A gentle, external refresh, whenever your day needs it.", kicker: "Occasional external care" },
      { src: "/images/campaign/her/06-her-palm-presentation.webp", alt: "The HER carton resting on an open palm against a green wall.", caption: "pH-considerate care with zero added fragrance.", kicker: "Fragrance-free" },
      { src: "/images/campaign/her/09-her-portrait-detail.webp", alt: "A woman with red hair holds an individually wrapped HER wipe beside her face.", caption: "Comfort and discretion, individually wrapped.", kicker: "Pocket-sized" },
    ],
  },
];

export function CampaignStorySections({
  onTheGoHref,
  spotlessHref,
  herHref,
}: {
  onTheGoHref: string;
  spotlessHref: string;
  herHref: string;
}) {
  const productHrefs = { onTheGo: onTheGoHref, spotless: spotlessHref, her: herHref };

  return (
    <div className="campaign-stories">

      {stories.map((story, index) => (
        <section
          key={story.id}
          className={`campaign-story campaign-story--${story.tone}${story.reversed ? " is-reversed" : ""}`}
          aria-labelledby={`${story.id}-title`}
        >
          <div className="wrap campaign-story-grid">
            <Stagger className="campaign-story-copy" gap={0.1}>
              <Reveal as="span" className="campaign-story-eyebrow">{story.eyebrow}</Reveal>
              {/* <Reveal as="span" className="campaign-story-product">{String(index + 1).padStart(2, "0")} / {story.product}</Reveal> */}
              <Reveal as="h2" id={`${story.id}-title`}>{story.title}</Reveal>
              <Reveal as="p" className="campaign-story-body">{story.body}</Reveal>
              {story.note && <Reveal as="p" className="campaign-story-note">{story.note}</Reveal>}
              <Reveal>
                <Link className="campaign-story-link" href={productHrefs[story.hrefKey]}>
                  Explore {story.product} <span aria-hidden="true">→</span>
                </Link>
              </Reveal>
            </Stagger>

            <CampaignGallery
              images={story.images}
              label={`${story.product} campaign images`}
              product={story.product}
              href={productHrefs[story.hrefKey]}
            />
          </div>
        </section>
      ))}
    </div>
  );
}
