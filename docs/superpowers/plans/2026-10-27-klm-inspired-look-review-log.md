# Baseline review log — KLM-inspired look

The plan's Task 11 asked for every contact sheet (`.contact-sheets/`, from
`packages/ui/scripts/contactSheets.ts`) to be reviewed. With 101 ui sheets and 14 email
sheets — 2,542 and 16 oracle/ours pairs — the review was done in two passes instead of
one screenshot per sheet:

1. **Every pair, by machine.** Each themed-Joy (or web) image was compared with ours: equal
   size, and the share of pixels differing by more than 40 in any channel. The same was run
   over `main`'s baselines, so only divergence that is *new or larger on this branch* is
   flagged — two independently rendered elements are rarely pixel-identical, and the suite
   never claimed they were (computed styles are the pass/fail signal).
2. **Every flagged family, by eye** (screenshots opened and looked at), plus Card, Button,
   Chip, Input and NumberInput samples in both schemes.

## Result

| Area | Flagged | Verdict |
|---|---|---|
| Input, NumberInput, OtpInput, Textarea, Autocomplete (outlined / disabled) | 200 pairs, ours 1px taller in the screenshot (29 vs 30) | **ok.** Measured: both roots are exactly 36px tall with identical border, padding and box sizing. The suite captures below 1×, and the second element starts at a fractional y, so its crop rounds to one more row. |
| Radio | 42 pairs, 17 vs 20px | **ok, pre-existing.** `main` had the same crop difference (17 vs 21). |
| Checkbox | 6 pairs, 21 vs 22px | **ok**, same crop rounding as the inputs. |
| TabList / TabNav / List / StepIndicator / Skeleton / Alert | 1–4 pairs each | **ok.** Joy and ours match in computed styles; differences are anti-aliasing at the new 12/24px corners (Alert solid success 679 vs 335 px of edge pixels). |
| Card | — | **ok.** Light default Card white and borderless on the canvas, 24px; dark keeps its outline. |
| Dark scheme, all components | — | **ok.** No warm tone in any dark image looked at; dark values are Joy's. |
| **Email Alert grid (light), AuthNoAccount (light, phone light)** | icons missing | **Resolved.** The seven new alert icon PNGs (new inks) were not on `cdn.hintoric.com` at first, so these baselines showed broken images. They were uploaded to the Drive `cdn` folder `email/alert/` (old files kept for sent mails), went live, and the three baselines were retaken and looked at: every icon renders. |

Nothing contradicts the spec: no visible light Card border, no shadow on a resting input,
no warm tone in dark.
