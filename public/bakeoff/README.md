# Website bake-off — three candidates, one prompt

Prompt: `docs/WEBSITE-BAKEOFF-PROMPT.md` (everything under the line, word for word).

| Candidate | Path | Status |
|---|---|---|
| Atlas | `public/bakeoff/atlas/index.html` | first pass 9/17 — not chosen |
| Candidate 1 (Joshua's external file — Astra or Gemini, TBC) | `public/bakeoff/candidate-1/index.html` | **WINNER 9/17 — Joshua: 'my winner by a long shot'** |
| (third candidate) | — | not run; Joshua called it after two |

Preview: start `mjf-static`, then `http://localhost:8766/bakeoff/<name>/`.
Compare at 375px and 1440px. Joshua picks the BASELINE; it becomes `public/index.html` and gets split into real files (`assets/styles.css`, `assets/site.js`, sections) before any asset wiring or push.

Scraped source material (so nothing of Dean's is lost): `docs/site-scrape/inventory.json` + `docs/site-scrape/images/` (gitignored, 94 originals, 349 MB — on disk and to be mirrored to Drive).
Contact on the current site: dean@makejesusfamous.world · 440-823-1554. On-Demand videos are JS-embedded on Wix — pull the YouTube IDs with a browser pass or ask Dean for the channel.


## Baseline (9/17)
Candidate 1 promoted to `public/index.html` as delivered, plus three surgical fixes: `min-width:0` on the hero container/grid/children (hero was clipped to 569px wide at 375px), the fabricated second testimony replaced with a labeled placeholder (Dean's real line kept), and `noindex,nofollow` until Dean flips. Everything else is untouched for Joshua to vibe-code from. The old `/` redirect to `/partner/` is parked at `public/bakeoff/_old-index-redirect.html`.
