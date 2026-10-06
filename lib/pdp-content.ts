import type { ShopifyMetafield } from "@/lib/shopify";

export type PdpContent = {
  version: number;
  breadcrumb: string;
  intro: string;
  bullets: string[];
  announcements: string[];
  systemName: string;
  clothName: string;
  quickFacts: { label: string; value: string }[];
  subscription: { savingsPercent: number; threePackPrice: string; welcomeKitValue: string; note: string };
  pressNote: string;
  moments: { time: string; title: string; body: string }[];
  mechanism: {
    name: string;
    note: string;
    steps: { title: string; body: string }[];
    numbers: { value: string; label: string; note: string }[];
    sources: { label: string; url: string }[];
    proofTitle: string;
    proof: string;
  };
  outcomes: { when: string; body: string }[];
  howToUse: string[];
  perspective: { body: string; source: string; url: string; disclaimer: string };
  comparison: { columns: string[]; rows: string[][]; note: string };
  reviews: { summary: string; filters: string[]; emptyText: string };
  receipts: { items: string[]; emptyText: string };
  crossSell: { handles: string[]; body: string };
  guarantee: { title: string; body: string; note: string };
  ingredients: {
    intro: string;
    tabs: { title: string; body: string }[];
    inci: string;
    freeFrom: string;
  };
  faqs: { question: string; answer: string }[];
  brandBand: { title: string; strapline: string; body: string };
  legal: string;
};

export function parsePdpContent(fields: ShopifyMetafield[]): PdpContent | null {
  const raw = fields.find((field) => field.namespace === "wipelo" && field.key === "pdp_content")?.value;
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as PdpContent;
    if (value.version !== 1 || !value.intro || !Array.isArray(value.faqs)) return null;
    return value;
  } catch {
    return null;
  }
}
