import { Reveal, Stagger } from "@/components/motion/reveal";

export function ReceiptsSectionPdp() {
  return (
    <section className="sec">
      <div className="wrap">
        <Stagger className="sec-head" gap={0.09} style={{ marginBottom: "28px" }}>
          <Reveal as="span" className="mono-tag">// Seen on your feed*</Reveal>
          <Reveal as="h2" className="h-section">The receipts.</Reveal>
          <Reveal as="p" className="lede">Real people, real counters, real gym bags. (*Prototype: placeholder creators & clips.)</Reveal>
        </Stagger>
        <Stagger className="ugc-strip" gap={0.08}>
          <Reveal className="ugc-card"><img src="https://images.unsplash.com/photo-1594556754132-d05bd5a8c36a?w=500&q=70&auto=format&fit=crop" alt="" /><span className="u-views">▶ 2.1M</span><div className="u-play">▶</div><div className="u-bot"><span className="u-handle">@marcus.lifts<span className="vtick"></span></span><span className="u-cap">gym → boardroom in 20 min. the sealed singles are cheating</span></div></Reveal>
          <Reveal className="ugc-card"><img src="https://images.unsplash.com/photo-1519455953755-af066f52f1a6?w=500&q=70&auto=format&fit=crop" alt="" /><span className="u-views">▶ 890K</span><div className="u-play">▶</div><div className="u-bot"><span className="u-handle">@dana.reads<span className="vtick"></span></span><span className="u-cap">the pack they said i wouldn't be embarrassed by. correct.</span></div></Reveal>
          <Reveal className="ugc-card"><img src="https://images.unsplash.com/photo-1541752857837-f8a0154fd092?w=500&q=70&auto=format&fit=crop" alt="" /><span className="u-views">▶ 1.4M</span><div className="u-play">▶</div><div className="u-bot"><span className="u-handle">@priya.flies<span className="vtick"></span></span><span className="u-cap">40 flights a year. wipe #50 as wet as wipe #1. tested it.</span></div></Reveal>
          <Reveal className="ugc-card"><img src="https://images.unsplash.com/photo-1574421233376-06f2ccf017f7?w=500&q=70&auto=format&fit=crop" alt="" /><span className="u-views">▶ 640K</span><div className="u-play">▶</div><div className="u-bot"><span className="u-handle">@samwdesign<span className="vtick"></span></span><span className="u-cap">tear ASMR you didn't know you needed 🤌</span></div></Reveal>
          <Reveal className="ugc-card"><img src="https://images.unsplash.com/photo-1572379925848-81b5b2b185df?w=500&q=70&auto=format&fit=crop" alt="" /><span className="u-views">▶ 3.2M</span><div className="u-play">▶</div><div className="u-bot"><span className="u-handle">@thelabtests<span className="vtick"></span></span><span className="u-cap">i pH-tested 6 wipes on camera. one was telling the truth.</span></div></Reveal>
        </Stagger>
      </div>
    </section>
  );
}
