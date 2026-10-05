# Wipelo Funnel System — Master Plan
*Built 2026-07-06 · for high-spend paid acquisition ($500k/day scale logic) · all landers live in `site/funnels/`*

## 1. The Circular Motion

```
            ┌──────────────  UGC / reviews / word-of-mouth  ◄─────────────┐
            ▼                                                             │
   TOFU (awareness)          MOFU (consideration)         BOFU (purchase) │
   ───────────────           ────────────────────         ─────────────── │
   learn.html (education)    quiz.html (personalize)      first.html PDP ─┤
   lab.html (play)      ──►  listicle.html (pre-sell) ──► cart/checkout   │
   advertorial.html (story)  advertorial.html (deep)      offer blocks    │
            ▲                                                             │
            └── retargeting loops: every stage re-feeds the one below ────┘
```

- **Cold traffic never lands on the PDP.** PDPs convert the educated; landers educate.
- **Every lander sells the next click, not the product** — except its offer blocks, which are always present for the ready-now minority.
- **Circular:** buyers → Welcome Kit unboxing → UGC → creative for TOFU. Non-buyers → pixel → next-stage retargeting.

## 2. The Lander Library

| File | Stage | Job | Traffic in | CTA out |
|---|---|---|---|---|
| `learn.html` | TOFU | Define the category; capture email | Broad interest, lookalikes, organic/SEO | quiz / lab / email |
| `lab.html` | TOFU/MOFU | Interactive proof (pH meter, day sim, tear-reveal) | Broad + engaged-video retargeting | PDP via unlocked offer |
| `advertorial.html` | TOFU/MOFU | Story-sell: problem → failed alternatives → discovery | Cold interruption (FB/IG, native) | PDP + sticky bar |
| `listicle.html` | MOFU | 5-point pre-sell, objections killed in order | Warm/engaged, clickers who didn't buy | PDP (offer at #3 and #5) |
| `quiz.html` | MOFU→BOFU | Personalize SKU + supply; commitment via micro-yeses | Retargeting all non-buyers; broad "quiz" creative | PDP with matched config |
| `offer.html` | BOFU | **The Converter** — DR offer page, buy box above the fold, sticky CTA | ALL paid-funnel grads (default paid closer) | Cart/checkout |
| `compare.html` | BOFU | Honest comparison + verdicts + "when NOT to buy" | Bottom search ("wipelo vs", "best body wipes") | offer.html |
| `her.html` | MOFU | A8 angle — microbiome education with dignity | Women 22–38 interest + HER retargeting | HER PDP (phase 2) |
| `../first.html` | BOFU | Brand PDP — full argument | Brand search, warm/organic, email clicks | Checkout |
| `../index.html` | Brand | Home for brand search + press | Organic, direct | Everything |

Every lander: distraction-free header, offer mirrors PureSkin structure, guarantee under every CTA, `?h=1/2/3` headline variants built in, `noindex` on paid-only pages.

## 3. Angle Matrix (creative × lander)

| # | Angle | Hook example | Best lander | Persona |
|---|---|---|---|---|
| A1 | The Gap | "8-step face routine. Baby wipe for everything else." | advertorial ?h=1, quiz ?h=1 | Ingredient-literate |
| A2 | Odor honesty | "Deodorant hides it. Zinc removes it." | advertorial ?h=2, quiz ?h=2, listicle ?h=3 | Active |
| A3 | Gym→meeting | "The 8:40 a.m. gap" | listicle ?h=1, lab (day sim) | Active/professional |
| A4 | pH education | "Your soap is pH 10. Your skin is 4.5." | lab, advertorial ?h=3, quiz ?h=3 | Skeptic/science |
| A5 | Category ownership | "Yes, wet wipes. Functional ones." | learn, brand video → home | All (brand) |
| A6 | Baby-wipe callout | "It was designed for someone three weeks old" | listicle ?h=2 | All (humor) |
| A7 | Single-Seal | "The 50th wipe identical to the 1st" / tear ASMR | lab (tear), listicle #4 | Travel |
| A8 | HER-specific | "Your pH, respected." | dedicated HER lander (phase 2) | Women 22–38 |

Rule: **one angle per ad per lander variant.** Ad hook must match lander H1 (scent match) — that's what `?h=` is for.

## 4. $500k/Day Allocation Logic

- **70% proven / 20% scaling tests / 10% wild tests.** Nothing unproven gets >$5k/day.
- Stage split at scale: ~55% TOFU (advertorial + lab + video views), ~30% MOFU retargeting (quiz + listicle), ~15% BOFU (PDP retargeting, brand search, cart abandon).
- Kill rule: CPA > 1.5× target after 3× target spend → kill variant, keep angle if another variant works.
- Scale rule: 20%/day budget bumps on winners; clone winning angle to a second lander format before scaling past $25k/day (format fatigue insurance).

## 5. Stat Framework (what the variants are FOR)

Track per `utm_campaign = {angle}-{lander}-{h-variant}`:
`hook CTR → LP read-depth (50% scroll) → LP→PDP CTR → ATC → CVR → AOV → sub-take-rate → 60-day LTV → blended CAC/MER`.
Diagnosis map: weak CTR = angle/hook · weak read-depth = lander lead · weak LP→PDP = offer/scent-match · weak CVR = PDP/price · weak sub-take = kit framing.

## 6. Retargeting Loops (the circle, wired)

1. Video viewers 50% / lab players → quiz (A2/A4 hooks)
2. Quiz finishers, no purchase → PDP with their matched SKU angle, then guarantee-led creative day 4+
3. PDP viewers, no ATC → listicle (objection killing), then advertorial (story)
4. ATC, no purchase → PDP + "reminder email 3 days before every refill" trust creative (never countdown/guilt — banned mechanics apply to ADS too)
5. Buyers day 10+ → Welcome Kit UGC prompt → whitelisted UGC becomes TOFU creative
6. 60-day buyers → cross-sell BARE/HER/CLEAN ("complete the routine")

## 7. Compliance / honesty gates (non-negotiable before spend)

- Advertorial persona/story is FICTIONAL placeholder — replace with a true, verified story; keep "Advertisement" label.
- All stats/reviews are dummy until real (site manifests list every figure).
- pH claims need batch data; "derm-assessed" needs the actual assessment.
- Banned in ads as on site: countdowns, fake scarcity, guilt copy.

## 8. The Lifecycle Machine (owned channels — where paid profit compounds)

**Email/SMS pays for the ads.** Sequences, all in brand voice ("messages, not newsletters"):
- **Welcome (non-buyer, from quiz/learn capture):** D0 your match + spec sheet → D1 the pH story → D3 founder honesty note ("when NOT to buy") → D5 kit offer → D8 review wall. Then weekly Journal.
- **Abandon (ATC/checkout):** H1 "your kit is packed" (contents itemized) → D1 guarantee-led ("30 days, <1% ask") → D3 quiz redirect if still cold. NO discount rescues, NO guilt — banned mechanics apply.
- **Post-purchase:** D0 what-to-expect (the Honest Arc) → D3 "how to use" ritual → D10 UGC ask (photo of tin = feature + early access) → D21 review ask → D24 refill reminder (the 3-day promise) → D40 cross-sell one SKU by quiz data.
- **Winback:** D60 "the honest check-in" — did it work? One question, one click. Answers route to refill, swap, or exit-with-grace.

**Ops cadence at scale:** Mon — kill/scale review vs stat framework · Tue — 3 new hooks per live angle · Wed — 1 new lander variant into the 10% wild bucket · Thu — creative×lander matrix refresh (scent-match audit) · Fri — LTV cohort read; rebalance 70/20/10.

## 9. Phase 2 backlog
HER PDP + HER offer page · post-purchase upsell flow · email/SMS sequences per stage · TikTok Shop variants · localized landers.
