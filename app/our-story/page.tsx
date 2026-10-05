import type { Metadata } from "next";
import { LegacyInteractions } from "@/components/legacy-interactions";
import { getStoryMarkup } from "@/lib/legacy-content";

export const metadata: Metadata = { title: "Our Story" };

export default function OurStoryPage() {
  return <>
    <section className="sec story-intro"><div className="wrap"><span className="mono-tag">// The reason Wipelo exists</span><h1 className="h-display">Skin is skin.<br /><em>Everywhere.</em></h1><p className="lede">Body care deserved the thought we already give to our faces.</p></div></section>
    <LegacyInteractions><div dangerouslySetInnerHTML={{ __html: getStoryMarkup() }} /></LegacyInteractions>
  </>;
}
