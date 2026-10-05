import type { Metadata } from "next";
import { LegacyInteractions } from "@/components/legacy-interactions";
import { getScienceMarkup } from "@/lib/legacy-content";

export const metadata: Metadata = { title: "The Science" };

export default function SciencePage() {
  return <LegacyInteractions><div dangerouslySetInnerHTML={{ __html: getScienceMarkup() }} /></LegacyInteractions>;
}
