import type { Metadata } from "next";
import { ComparisonSection } from "@/components/home/comparison";
import { MechanismSection } from "@/components/home/mechanism";
import { ProblemSection } from "@/components/home/problem";
import { RevealEffects } from "@/components/reveal-effects";

export const metadata: Metadata = { title: "The Science" };

export default function SciencePage() {
  return <RevealEffects>
    <ProblemSection />
    <MechanismSection />
    <ComparisonSection />
  </RevealEffects>;
}
