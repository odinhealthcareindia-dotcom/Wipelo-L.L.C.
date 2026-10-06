"use client";

import { useState } from "react";

export function ReviewsSection() {
  const [filter, setFilter] = useState<string | null>(null);
  const isVisible = (tags: string, index: number) => filter === null ? index < 3 : filter === "all" || tags.split(" ").includes(filter);
  return (
    <section className="sec" style={{ paddingTop: "0" }} id="reviews">
      <div className="wrap">
        <div className="rev-head rv">
          <div className="rev-score">
            <span className="big">4.8</span>
            <div className="meta"><b>2,847 reviews*</b>★★★★★ · verified buyers
              <span className="rec-chip"><b>97%</b> would recommend*</span><br />
              <span style={{ fontSize: "11px", color: "var(--ink-40)" }}>*dummy data — see manifest</span></div>
          </div>
          <div className="chips" role="tablist" aria-label="Filter reviews">
            {[["all", "All"], ["gym", "Gym"], ["travel", "Travel"], ["intim", "Before & after"], ["sensitive", "Sensitive skin"]].map(([value, label]) => <button
              className={`chip${(filter ?? "all") === value ? " on" : ""}`}
              data-f={value}
              type="button"
              aria-pressed={(filter ?? "all") === value}
              onClick={() => setFilter(value)}
              key={value}
            >{label}</button>)}
          </div>
        </div>
        <div className="rev-grid">
          <div className={`rev-card rv${isVisible("gym", 0) ? "" : " hidden"}`} data-tags="gym">
            <span className="rev-stars">★★★★★</span>
            <p>"The 40 minutes between the gym and my 9 a.m. used to be a problem. Now it's one sealed packet. Nobody at work knows, which is the whole point."</p>
            <div className="rev-who"><img src="https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=120&h=120&q=70&auto=format&fit=crop&crop=faces" alt="" /><div><div className="nm">Marcus T.<span className="vtick"></span></div><div className="ctx">@marcus.lifts · Trains 5x/week · Chicago</div></div><span className="rev-verified">✓ Verified</span></div>
          </div>
          <div className={`rev-card rv${isVisible("intim sensitive", 1) ? "" : " hidden"}`} data-tags="intim sensitive">
            <span className="rev-stars">★★★★★</span>
            <p>"Finally a brand that says what it's for without being weird about it. FIRST lives in the nightstand. No sting, no perfume cloud, no baby-aisle shame."</p>
            <div className="rev-who"><img src="https://images.unsplash.com/photo-1524550158212-33f2ff985344?w=120&h=120&q=70&auto=format&fit=crop&crop=faces" alt="" /><div><div className="nm">Dana R.<span className="vtick"></span></div><div className="ctx">@dana.reads · Retinol-literate since 2019 · Austin</div></div><span className="rev-verified">✓ Verified</span></div>
          </div>
          <div className={`rev-card rv${isVisible("travel", 2) ? "" : " hidden"}`} data-tags="travel">
            <span className="rev-stars">★★★★★</span>
            <p>"I fly weekly. Individually sealed means the last wipe in the box is as wet as the first — every other brand I tried dried into sadness by week two."</p>
            <div className="rev-who"><img src="https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=120&h=120&q=70&auto=format&fit=crop&crop=faces" alt="" /><div><div className="nm">Priya K.<span className="vtick"></span></div><div className="ctx">@priya.flies · Travels 40 weeks a year · NYC</div></div><span className="rev-verified">✓ Verified</span></div>
          </div>
          <div className={`rev-card rv${isVisible("gym sensitive", 3) ? "" : " hidden"}`} data-tags="gym sensitive">
            <span className="rev-stars">★★★★☆</span>
            <p>"BARE actually helped my back after two weeks of consistent use. Wish it was cheaper, but it's the only thing that treated it like skincare instead of a punishment."</p>
            <div className="rev-who"><img src="https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=120&h=120&q=70&auto=format&fit=crop&crop=faces" alt="" /><div><div className="nm">Jordan M.<span className="vtick"></span></div><div className="ctx">@jrdn.moves · Hot yoga, 4x/week · LA</div></div><span className="rev-verified">✓ Verified</span></div>
          </div>
          <div className={`rev-card rv${isVisible("travel intim", 4) ? "" : " hidden"}`} data-tags="travel intim">
            <span className="rev-stars">★★★★★</span>
            <p>"Bought for travel, stayed for everything else. The spec label on the pack is a conversation starter — I've converted three friends by leaving it on the counter."</p>
            <div className="rev-who"><img src="https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=120&h=120&q=70&auto=format&fit=crop&crop=faces" alt="" /><div><div className="nm">Sam W.<span className="vtick"></span></div><div className="ctx">@samwdesign · Design lead · Portland</div></div><span className="rev-verified">✓ Verified</span></div>
          </div>
          <div className={`rev-card rv${isVisible("sensitive", 5) ? "" : " hidden"}`} data-tags="sensitive">
            <span className="rev-stars">★★★★★</span>
            <p>"My skin strips if you look at it wrong. pH-matched turned out to be the difference between 'refreshed' and 'tight and angry.' HER is the first one that gets it."</p>
            <div className="rev-who"><img src="https://images.unsplash.com/photo-1489278353717-f64c6ee8a4d2?w=120&h=120&q=70&auto=format&fit=crop&crop=faces" alt="" /><div><div className="nm">Elena V.<span className="vtick"></span></div><div className="ctx">@elenav.mia · Sensitive skin · Miami</div></div><span className="rev-verified">✓ Verified</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
