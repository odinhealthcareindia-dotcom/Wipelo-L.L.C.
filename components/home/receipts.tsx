import { BeforeAfterSlider } from "./before-after";

export function ReceiptsSection() {
  return (
    <section className="sec" style={{ paddingTop: "0" }}>
      <div className="wrap">
        <div className="sec-head rv" style={{ marginBottom: "28px" }}>
          <span className="mono-tag">// Seen on your feed*</span>
          <h2 className="h-section">The receipts.</h2>
          <p className="lede">Real people, real counters, real gym bags. (*Prototype: placeholder creators & clips.)</p>
        </div>
        <div className="ugc-strip rv">
          <div className="ugc-card"><img src="https://images.unsplash.com/photo-1594556754132-d05bd5a8c36a?w=500&q=70&auto=format&fit=crop" alt="" /><span className="u-views">▶ 2.1M</span><div className="u-play">▶</div><div className="u-bot"><span className="u-handle">@marcus.lifts<span className="vtick"></span></span><span className="u-cap">gym → boardroom in 20 min. the sealed singles are cheating</span></div></div>
          <div className="ugc-card"><img src="https://images.unsplash.com/photo-1519455953755-af066f52f1a6?w=500&q=70&auto=format&fit=crop" alt="" /><span className="u-views">▶ 890K</span><div className="u-play">▶</div><div className="u-bot"><span className="u-handle">@dana.reads<span className="vtick"></span></span><span className="u-cap">the pack they said i wouldn't be embarrassed by. correct.</span></div></div>
          <div className="ugc-card"><img src="https://images.unsplash.com/photo-1541752857837-f8a0154fd092?w=500&q=70&auto=format&fit=crop" alt="" /><span className="u-views">▶ 1.4M</span><div className="u-play">▶</div><div className="u-bot"><span className="u-handle">@priya.flies<span className="vtick"></span></span><span className="u-cap">40 flights a year. wipe #50 as wet as wipe #1. tested it.</span></div></div>
          <div className="ugc-card"><img src="https://images.unsplash.com/photo-1574421233376-06f2ccf017f7?w=500&q=70&auto=format&fit=crop" alt="" /><span className="u-views">▶ 640K</span><div className="u-play">▶</div><div className="u-bot"><span className="u-handle">@samwdesign<span className="vtick"></span></span><span className="u-cap">tear ASMR you didn't know you needed 🤌</span></div></div>
          <div className="ugc-card"><img src="https://images.unsplash.com/photo-1572379925848-81b5b2b185df?w=500&q=70&auto=format&fit=crop" alt="" /><span className="u-views">▶ 3.2M</span><div className="u-play">▶</div><div className="u-bot"><span className="u-handle">@thelabtests<span className="vtick"></span></span><span className="u-cap">i pH-tested 6 wipes on camera. one was telling the truth.</span></div></div>
        </div>
        <div className="cmt-grid rv" style={{ marginTop: "14px" }}>
          <div className="cmt"><div className="c-top"><img src="https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=80&h=80&q=60&auto=format&fit=crop&crop=faces" alt="" /><div className="c-h">@jrdn.moves<span className="vtick"></span><small>reply · 2w</small></div></div><p>bought after the pH video. my back cleared in a month, not kidding</p><div className="c-meta"><span>♥ 4,218</span><span>reply</span></div></div>
          <div className="cmt"><div className="c-top"><img src="https://images.unsplash.com/photo-1524550158212-33f2ff985344?w=80&h=80&q=60&auto=format&fit=crop&crop=faces" alt="" /><div className="c-h">@elenav.mia<span className="vtick"></span><small>reply · 1w</small></div></div><p>the "we email you 3 days before shipping" thing is real btw. most respectful sub I have</p><div className="c-meta"><span>♥ 2,907</span><span>reply</span></div></div>
          <div className="cmt"><div className="c-top"><img src="https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=80&h=80&q=60&auto=format&fit=crop&crop=faces" alt="" /><div className="c-h">@coach.dre<span className="vtick"></span><small>reply · 3d</small></div></div><p>told my whole 6am class. the tin lives in my duffel now</p><div className="c-meta"><span>♥ 1,655</span><span>reply</span></div></div>
        </div>
        
        <div className="rv" style={{ marginTop: "34px" }}>
          <span className="mono-tag" style={{ display: "block", marginBottom: "14px" }}>// Wipelo Bare · salicylic 2% · drag the line</span>
          <BeforeAfterSlider />
          <p style={{ fontSize: "11px", color: "var(--ink-40)", marginTop: "10px" }}>*Illustrative placeholder images — not real customer results. Real before/afters require documented, consented customer photos + typical-results disclosure.</p>
        </div>
      </div>
    </section>
  );
}
