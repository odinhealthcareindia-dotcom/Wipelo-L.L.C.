# Motion

Wipelo is a personal-care brand, so motion is calm: things glide gently into place as they scroll into view, once, and never get in the way of reading.

## Where it lives

| File | What it does |
|---|---|
| `lib/motion.ts` | The only place timings live: `EASE`, `DUR`, `VIEWPORT`, and the variants (`fadeUp`, `fadeIn`, `slideFromLeft`, `slideFromRight`, `scaleIn`, `softScale`, `pop`, `nudgeIn`, `settle`, `drawLine`, `deal`). |
| `components/motion/motion-provider.tsx` | Wraps the app (in `app/layout.tsx`) in `LazyMotion` (`strict`, features loaded lazily) and `MotionConfig reducedMotion="user"`. |
| `components/motion/reveal.tsx` | `<Reveal>` animates one element when it scrolls into view. `<Stagger>` sequences its `<Reveal>` children. |
| `components/motion/parallax.tsx` | `<Parallax offset>` drifts an image on scroll. Desktop only, never on text. Add `fill` when the image covers a frame. |
| `components/motion/count-up.tsx` | `<CountUp to decimals>` counts up once in view. The server HTML already shows the final number. |
| `components/motion/marquee.tsx` | A constant CSS loop that pauses on hover. |
| `components/motion/draw-circle.tsx` | An SVG outline that draws itself. |
| `app/globals.css`, "Motion" block | Hero and header entrance (CSS only, so first paint is never hidden), button hover/press, marquee, parallax sizing. |

## Adding motion to a new section

Sections stay server components; `Reveal` and `Stagger` are the client parts.

```tsx
import { Reveal, Stagger } from "@/components/motion/reveal";

<Stagger className="my-head" gap={0.09}>
  <Reveal as="span" className="tag">// Eyebrow</Reveal>
  <Reveal as="h2">Headline</Reveal>
  <Reveal as="p">Body copy</Reveal>
  <Reveal><Link className="btn">Button</Link></Reveal>
</Stagger>
<Reveal variant="slideFromRight" className="my-image">…</Reveal>
```

- `as` keeps the original tag, so markup and styles don't change. Pass the class straight to `Reveal` instead of adding a wrapper `div`.
- Inside a `Stagger`, children follow the parent's timing. Nested `Stagger`s chain.
- Need a new kind of movement? Add a variant to `lib/motion.ts` and list it in `VARIANTS`. Never put durations or easings in a section.

## Rules

- Animate `opacity` and `transform` only. Every reveal runs once.
- Travel: 28px up, 40px sideways, scale from 0.96. `travel()` halves these on phones automatically.
- Order within a section: eyebrow, headline, body, chips, button, at 0.08–0.1s apart. The whole sequence finishes within about 1.2s.
- Cards lift with `whileHover={cardHover}`. Buttons lift and press through the CSS block.
- **Reduced motion:** `MotionConfig` drops all movement and `Reveal` shortens the fade to 0.3s. Parallax, the marquees, the hero float and the carousels' autoplay all stop.
- **No JavaScript:** a `<noscript>` rule in the layout shows everything with `[data-motion]`.
- Keep the hidden state identical on server and client. Read user preferences after mount, or hydration mismatches.
