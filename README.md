# 1-shanten Oracle — Push-Pull Trainer

A browser-based training tool for Japanese mahjong push/pull decisions with 1-shanten hands facing an opponent's riichi. Built around Unimaru's push/fold framework, with a companion lookup tool.

**Live site:** [1-shanten-oracle-trainer.vercel.app](https://1-shanten-oracle-trainer.vercel.app/)

---

## Overview

The project ships as two standalone HTML files:

| File | Purpose |
|---|---|
| `index.html` | Interactive trainer with four modes, three quiz steps, scoring, and results |
| `oracle.html` | Reference lookup tool for on-the-fly decisions during actual play |

Both are zero-build, zero-dependency (beyond Font Awesome via CDN). They run entirely in the browser, persist state to `localStorage`, and require no server.

---

## Trainer (index.html)

### Modes

- **Regular** — 10-question scored run. Score and grade revealed at the end.
- **Zen Mode** — Endless push/fold drill. No timer, no results screen. Live accuracy and max-combo panel updates in real time.
- **Time Attack** — 45-second countdown. Correct push/fold buys more time. Runs until the clock hits zero.
- **Custom Practice** — Endless practice with hand-picked tile categories, turns, shapes, seatings, roles, and question count.

### Quiz structure

Each question presents a 1-shanten hand facing an opponent's riichi and asks three sequential questions:

1. **Passed Suji** — Count the unique suji lines opened by the riichi player's pond
2. **Deal-in Rate** — Estimate the risk of the tile being considered for discard
3. **Push/Fold** — Weigh the tile's danger against the hand's threshold

### Scoring

- Step 1: 300 pts exact, 100 pts off-by-one
- Step 2: 300 pts correct bucket
- Step 3: 400 pts correct decision, 200 pts borderline
- Combo multiplier: capped at ×1.5 (reached at combo 25)
- Time bonus: up to 200 pts per question

Grades from **E** (below 30% of theoretical max) to **S+** (above 95%).

### Reference panels

The trainer includes live reference panels for shape tiers and deal-in thresholds, plus modal references for shapes, deal-in rates, and the full threshold tables. All panels can be toggled between **Auto** (matching the current question) and manual navigation.

### Controls

- `Enter` — submit answer / advance
- `Esc` — back / close modal / return to menu
- `A` — About
- `S` — Shape reference
- `D` — Deal-in reference
- `1–6` — switch shape tier tables
- `Q–Y` — switch threshold tables
- `7` / `U` — toggle auto mode for the respective panel

---

## Oracle (oracle.html)

A lookup tool for use during real games or study sessions.

- Enter your conditions (dealer/non-dealer, hand state, seat position, ippatsu, turn)
- Select hand shape and ron value
- Get the threshold deal-in rate for your hand
- Optionally compute a full PUSH/PULL verdict by entering the tile category and passed suji count

Includes expandable reference sections for deal-in rates, shape examples, tier tables, and full threshold tables.

---

## The Framework

The tier classification and threshold values come from **Unimaru's** push/fold framework for 1-shanten hands:

- Hand shape and value determine a **tier** (1 = strongest, 8+ = weakest)
- Tier and turn determine a **threshold deal-in rate**
- Threshold is compared against the estimated deal-in rate of the tile being considered for discard
- Below threshold → PUSH, above threshold → PULL, close → BORDERLINE

Special cases accounted for:

- **Open hands vs kamicha riichi** — separate tier table (kamicha's discards create chii opportunities)
- **Closed hands with surviving yaku** — evaluated on the open chart, 1.5 tiers better
- **Pinfu** — interpolated between adjacent tiers 0.5 tiers better
- **Ippatsu turn** — adjusts threshold based on roles
- **Non-standard shapes** — [S] tier Kuttsuki/Headless use [A] Perfect as base, adjusted one tier up

Deal-in rate estimates come from **Miinin's** statistical data (統計学のマージャン戦術).

---

## Setup

### Local development

1. Clone or download the repository
2. Open `index.html` in any modern browser
3. That's it — no build step, no server required

### File structure
```
/
├── index.html # Trainer
├── oracle.html # Lookup tool
├── favicon.ico # Site icon
├── long.png # Home/background image
├── birb.png # About modal image
├── gong.mp3 # Special-results sound
└── tiles/ # Tile images
  ├── 1m.webp, 2m.webp, ..., 9m.webp
  ├── 1p.webp, ..., 9p.webp
  ├── 1s.webp, ..., 9s.webp
  ├── 1z.webp, ..., 7z.webp # Honor tiles (東南西北白發中)
  └── 0m.webp, 0p.webp, 0s.webp # Red 5s
```

Tile images are optional at runtime — if a `.webp` file is missing, the app falls back to a text-rendered tile that shows the number and suit or honor character.

### Deployment

The app is entirely static. Any static host works:

- **Vercel** — drop the folder in
- **Netlify** — same
- **GitHub Pages** — push to a `gh-pages` branch
- **Any web server** — just serve the files

No environment variables, no build commands, no server-side code.

---

## Tech Stack

- **Pure HTML/CSS/JavaScript** — no framework, no bundler, no npm dependencies
- **Font Awesome 6.7.2** via CDN (icons)
- **Web Audio API** — sound effects generated procedurally (no audio assets needed beyond `gong.mp3`)
- **localStorage** — persists high scores, language preference, custom practice config, sound state
- **CSS Grid + Flexbox** — responsive layout with a mobile-first design

---

## Internationalization

Full English and Japanese translations. Language preference is persisted per browser. Toggle via the language button in the top-right of every screen.

---

## Accessibility

- All interactive controls have visible focus states
- Keyboard navigation is fully supported
- Sound toggle cycles through mute / low / high
- ARIA labels on all modals and close buttons

---

## Credits

**Design and development:** kakino_tea ([@mican8saku](https://x.com/mican8saku))

**Framework source:** Unimaru 『うに丸式 セオリーで勝つ麻雀』, Chapters 22–24, plus his YouTube videos on 1-shanten push/fold theory

**Deal-in rate data:** Miinin 『統計学のマージャン戦術』

**Framework data basis:** 『新・科学する麻雀』 simulation data

**Tileback:** Originally comes from [mahgen by eric03742](http://wiki.lingshangkaihua.com/mediawiki/index.php/%E9%A6%96%E9%A1%B5) with the original credit going to "最完整的日本麻将中文维基百科".

---

## Disclaimer

This tool is a **reference**, not a definitive authority. The model is intended primarily for push/fold decisions in flat point standings and does not account for every factor that may matter in a real game.

Treat the results as training guidance, not as commands.


---

## License

CC BY-NC-SA 4.0
