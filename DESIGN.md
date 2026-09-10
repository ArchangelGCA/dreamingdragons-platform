---
name: DreamingDragons Platform
description: An OLED-black ocean abyss lit by dragonfire teal, where tales and art rest as dark scales and the loved ones gleam gold.
colors:
  primary: "#00a594"
  primary-bright: "#20dde0"
  primary-hover: "#8ff7f8"
  deep-1: "#0f2c4b"
  deep-2: "#004a5a"
  gold: "#ffc94d"
  gold-soft: "#ffd88a"
  accent-ink: "#02120f"
  gold-ink: "#241a04"
  abyss: "#000000"
  abyss-2: "#04090f"
  surface: "#0a141f"
  surface-2: "#0e1c2e"
  edge: "#1c3350"
  text-primary: "#f0f8ff"
  text-secondary: "#cce0e5"
  text-muted: "#8ba3b0"
typography:
  display:
    fontFamily: "'Comfortaa', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontWeight: 700
  body:
    fontFamily: "'Comfortaa', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontWeight: 400
    fontSize: "1rem"
  label:
    fontFamily: "'Comfortaa', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontWeight: 600
  mono:
    fontFamily: "'Menlo', 'Consolas', 'Monaco', 'Liberation Mono', 'Lucida Console', monospace"
rounded:
  tooltip: "5px"
  scrollbar: "8px"
  button: "8px"
  card: "16px"
  pill: "32px"
spacing:
  unit: "1rem"
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "3rem"
components:
  button-purple:
    backgroundColor: "{colors.primary}"
    textColor: "#02120f"
    rounded: "{rounded.button}"
    padding: "0.375rem 0.75rem"
  button-purple-hover:
    backgroundColor: "{colors.primary-bright}"
    textColor: "#012a26"
  button-upload:
    backgroundColor: "{colors.deep-1}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.button}"
  button-register:
    backgroundColor: "{colors.primary}"
    textColor: "#02120f"
    rounded: "{rounded.button}"
  card-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.card}"
  tooltip:
    backgroundColor: "rgba(0, 65, 80, 0.95)"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.tooltip}"
    padding: "10px"
  badge-purple:
    backgroundColor: "{colors.primary}"
    textColor: "#02120f"
    rounded: "{rounded.pill}"
---

# Design System: DreamingDragons Platform

## Overview

**Creative North Star: "The Dragon's Deep"**

DreamingDragons is a night dive into dragon waters. The page ground is true OLED black (`#000000`) — pixels off, battery saved — with a single breath of dragonfire teal at the top of the viewport. Content rests on flat abyss surfaces (`#04090f` wells, `#0a141f` cards, `#0e1c2e` raised), edged with deep-sea hairlines (`#1c3350`, teal `rgba(32,221,224,0.14)`). The identity is the mother site's dragonfire teal (`#00a594`, bright aqua `#20dde0`, hover `#8ff7f8`), drawn from dreamingdragons.net's `--color-accent` family and its deep-sea gradient roots (`#0f2c4b → #004a5a`). Fresh work sparks aqua; loved work gleams trophy gold (`#ffc94d`, soft `#ffd88a`, from the mother site's gold accents); everything else stays calm and dark. It feels like surfacing beside a dragon at night: dark water, one warm breath of light, gold where the hoard is loved.

The voice is **deep-sea teal**: calm, premium, deliberate. Depth is built from flat tonal steps and hairlines first, with at most one subtle top sheen per surface — never stacked gradients. Glow is selective: hover, focus-visible, fresh sparks, loved gold. Motion is calm by default — no breathing or pulsing loops at rest; feedback answers interaction only, and `prefers-reduced-motion` silences what remains. Small playful details (dragons, the hoard voice) keep the deep from feeling cold.

**Key Characteristics:**
- OLED-at-rest: true black ground (`#000000`) with one subtle teal breath at the top; flat abyss surfaces carry content, most pixels stay off.
- Dragonfire teal is the spine: links, buttons, badges, focus rings and scrollbar thumbs all resolve to `#00a594` / `#20dde0`.
- Gold is the reward: loved hearts, popular badges and celebration moments gleam `#ffc94d`; fresh work sparks `#20dde0`; everything else cools to deep sea (`#0f2c4b`).
- Content cards are dark scales: flat `#0a141f` body, solid `rgba(2,8,14,0.88)` inscription overlay, one faint top sheen, teal hairline on top.
- Flat tones first, sheen second, glow last: elevation comes from surface steps + hairlines; one sheen max; glow only for heat, hover, focus, active.
- Rounded and soft: 8px buttons, 16px cards, pill badges — nothing sharp.
- Centered, confident rhythm: Bootstrap 12-col grid, centered hero/stat blocks, masonry content, horizontal drag-scroll rows.

## Colors

A two-force palette: dragonfire teal family for identity and calm, trophy gold for love and celebration, over a true-black ocean abyss. Aligned to dreamingdragons.net (`#0f2c4b`, `#004a5a`, `#00a594`, `#20dde0`, gold `#FFD700` refined to OLED-safe `#ffc94d`).

### Primary
- **Dragonfire Teal** (`#00a594`): The identity color. Primary buttons (dark `#02120f` ink), badges, focus rings, scrollbar thumbs, active states.
- **Bright Aqua** (`#20dde0`): Links at rest, fresh sparks, hover fills, search accents, avatar rings.
- **Aqua Hover** (`#8ff7f8`): Link hover, bright focus outlines, the lightest touch — never a large fill.

### Secondary
- **Deep Sea** (`#0f2c4b`): Mother-site primary. Upload/secondary buttons, cool heat-dot, section depth.
- **Deep Teal** (`#004a5a`): Mother-site secondary. Toast success fills (with `#f0f8ff` text), avatar fallback, wells, unread washes.

### Tertiary — Gold Heat
- **Trophy Gold** (`#ffc94d`): Loved hearts, popular badges, celebration. Dark `#241a04` ink on gold fills. Sparing by design.
- **Gold Soft** (`#ffd88a`): The bright tip — badge text, icon gleams, hover on gold.

### Neutral — Abyss & Scale
- **Abyss** (`#000000`): Page ground — true black, OLED pixels off.
- **Abyss-2** (`#04090f`): Wells, reading plates, large panels, dropdown/offcanvas bodies.
- **Surface** (`#0a141f`): Card and panel surface — the primary resting surface.
- **Surface-2** (`#0e1c2e`): Raised surfaces and hover states.
- **Edge** (`#1c3350`): Hairline edges; teal hairline `rgba(32,221,224,0.14)` for lit edges.
- **Text** (`#f0f8ff`): Primary body text (mother's lightest).
- **Secondary Text** (`#cce0e5`): Secondary labels and metadata (mother's light).
- **Muted Text** (`#8ba3b0`): Timestamps and fine print.
- **Dark Ink** (`#02120f`): Text on teal fills. **Gold Ink** (`#241a04`): text on gold fills.

### Named Rules
**The Gold Sparsity Rule.** Gold is love, not surface. At rest, screens are teal-on-abyss; gold appears on liked hearts, popular badges, and rare celebration moments. Its rarity is what makes it gleam.
**The Heat Ramp Rule.** Freshness and love read as light: newest work sparks bright aqua (`#20dde0`), most-loved work gleams gold (`#ffc94d`), everything else cools to deep sea. Never invert the ramp.
**The One Teal Rule.** All teal family members derive from hue 174 (`#00a594` spine). Never introduce purple, magenta or orange — the old hue-273 / ember system is retired.
**The Calm Surface Rule.** Flat solid fills first; at most one subtle top sheen per surface; no stacked multi-stop gradients; no infinite rest animations. A surface must earn every layer.

## Typography

**Display/Body Font:** Comfortaa (Google Fonts), fallback `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
**Mono Font:** Menlo, Consolas, Monaco, monospace (code and technical snippets)

**Character:** Comfortaa's rounded, friendly geometry carries the community warmth; its single weight (Google's default) keeps headings and body visually unified. The pairing is cozy and modern — a fantasy community that still feels approachable.

### Hierarchy
- **Display / Page Titles** (700, `h1`/`h2` scale, Comfortaa): Page identity — home titles, section headers, profile names.
- **Headline** (600, `h4`–`h5`): Section and card titles.
- **Body** (400, `1rem`, Comfortaa): Default reading text; chapter content sits in a flat abyss well with generous padding and a 72ch measure.
- **Label / Badge** (600, small caps via Bootstrap badges, uppercase for content-type badges): Chips, tags, badges.
- **Small Text** (400, `0.8rem`): `.small-text` captions, timestamps, footer fine print.

### Named Rules
**The Comfortaa-Only Rule.** All UI copy uses Comfortaa. Do not introduce a second display face; hierarchy is expressed through size, weight, and light, not a new family.

## Layout

Bootstrap 5.3 12-column grid on a fluid container (`container-fluid`, `max-width: 100%`, `overflow-x: hidden`). The system is centered and columnar:

- **Navbar (the Deep Gate):** full-width row, logo left (`col-2/3/4`), search center, notifications + profile right. Flat `#04090f` bar with a teal hairline seal (`--dd-fire-line`, teal-into-gold, low opacity) separating it from content; one faint teal breath at the top only.
- **Search:** flat abyss fill with a teal hairline; focused state gains a calm teal glow via `input-group:focus-within`.
- **Content:** centered rows (`justify-content-center`) with a masonry column layout for tale/art cards (`Masonry` component, min column 350px, 10px gap). Sections are ranked by light: "Newest Content" (aqua spark), "Most Liked" (gold gleam), "Recently Updated" (cooled deep sea).
- **Horizontal rows:** `.row-horizontal` flex-nowrap rows with drag-scroll (`@svelte-put/dragscroll`) for follow feeds and most-liked carousels.
- **Responsive:** Bootstrap breakpoints (sm 576px / md 768px / lg 992px / xl 1200px / xxl 1400px). Cards collapse to single column, badges shrink, and the notification panel goes full-width below 576px. On touch devices (`hover: none`), content-card overlays are always visible — no hover-gated information on mobile.
- **Vertical rhythm:** Bootstrap `gap`/`g-*` scale and `--spacing-unit: 1rem`; generous vertical padding (`py-2`/`mt-3`/`mb-4`) for breathing room.

## Elevation & Depth

**Flat abyss + one sheen + selective glow.** Depth is constructed in three strict layers:

1. **Tonal steps (always on):** `#000000` ground → `#04090f` wells → `#0a141f` cards → `#0e1c2e` raised, separated by `#1c3350` / teal hairlines.
2. **One sheen (sparingly):** a single `linear-gradient(180deg, rgba(255,255,255,0.03), transparent 22%)` top light on plates and cards. Never two gradients on one surface.
3. **Glow (selective):** teal box-shadows answer hover, focus-visible and fresh sparks; gold answers loved/popular. Glow is the language of "this responds."

### Shadow Vocabulary
- **Focus Glow** (`0 0 0.7rem 0.15rem rgba(32,221,224,0.4)`): `form-control:focus`, `:focus-visible` outlines, search focus.
- **Hover Lift** (`0 0 0.7rem 0.15rem rgba(32,221,224,0.4)`): primary button hover, card hover.
- **Gold Gleam** (`0 0 0.5rem 0.1rem rgba(255,201,77,0.5)`): popular badges, liked hearts.
- **Iron Drop** (`0 2px 12px rgba(0,0,0,0.45)`): cards rest with a soft black shadow; forged plate (`0 6px 24px rgba(0,0,0,0.35)`) for profile stats bars and reading wells.
- **Tooltip Drop** (`0 2px 8px rgba(0,0,0,0.3)`): tooltip panels lift with a soft black shadow, not a glow.

### Named Rules
**The Selective Glow Rule.** No random glows and no rest animations. A glow must answer heat, hover, focus-visible, or active. At rest, surfaces stay flat.

## Shapes

Soft and round everywhere — nothing sharp or clinical.

- **Buttons:** 8px radius (`rounded-3`); active state presses to `scale(0.97)`.
- **Cards / Containers:** 16px radius (`rounded-4`); cover images clip to the card via `overflow: hidden`.
- **Badges / Chips:** pill radius (`rounded-pill`/`rounded-5`); content-type badges use full pills with `border-radius: 1rem`.
- **Tooltips:** 5px radius.
- **Scrollbars:** 8–10px radius thumbs with solid teal fills.
- **Avatars:** full circles with a subtle teal ring and teal glow on hover.
- **Notification panel:** 16px top radius on mobile, left radius on desktop, flat `#04090f` with a teal hairline.

## Components

### Buttons
- **Shape:** rounded 8px; hover glows calmly, active `scale(0.97)`; transitions `all 0.12s ease-in-out`; visible `:focus-visible` teal outline.
- **Primary (`btn-purple` / canonical `btn-dragon`):** solid dragonfire teal `#00a594` with dark `#02120f` ink and a teal hairline; hover brightens to `#20dde0` with a calm teal glow. No breathing animation.
- **Upload:** solid deep sea `#0f2c4b` with `#f0f8ff` text and a teal hairline; hover lifts slightly with teal glow.
- **Register:** solid dragonfire teal (same as primary); hover bright aqua.
- **Gold (`btn-gold`, rare):** solid `#ffc94d` with `#241a04` ink for celebration moments only.
- **Outline Search:** teal border (`#20dde0`) + aqua text; hover fills `rgba(0,165,148,0.18)` and glows calmly.
- **Danger / Warning / Info:** Bootstrap semantic colors, used sparingly. Discord blurple and Reddit orange stay as brand exceptions.

### Cards / Containers (Scales)
- **Corner Style:** 16px radius.
- **Background:** flat abyss surface `#0a141f` with `0 2px 12px rgba(0,0,0,0.45)` drop over the black ground.
- **Top Sheen:** at most one faint `rgba(255,255,255,0.03 → 0)` light at the top of the cover; the card reads as a dark scale, not a gem.
- **Heat Light:** fresh cards carry an aqua under-light, loved cards a gold gleam (`#ffc94d` heart + soft gold shadow).
- **Shadow Strategy:** flat at rest; teal glow on hover, gold on loved.
- **Border:** `1px solid var(--dd-edge)` on plates; lit edges use `rgba(32,221,224,0.14)`.
- **Internal Padding:** `p-2`–`p-3` scale.

### Section Heads & Heat Dots
- **Section headings** use central `.forge-section-head` with a `.heat-dot`: hot/fresh (bright aqua dot + aqua glow, static), ember/loved (gold dot + gold glow), cool/updated (deep-sea dot with teal hairline). Copy voice stays ("Fresh off the anvil", "The hot rack", "Tempered").
- **Plates** (`.forge-title`, `.bg-info-profile`, `.bg-info-stats`): flat `#0a141f` panels with one faint top sheen and a `#1c3350` border.

### Inputs / Fields
- **Style:** flat abyss fill (`#04090f`), 1px `#1c3350` or teal hairline, rounded-3.
- **Focus:** calm teal glow + visible outline, no border shift.
- **Search:** input-group with teal search button; the whole group glows calmly on focus.

### Navigation (the Deep Gate)
- **Dropdown menu:** flat `#04090f` with a teal hairline border and calm teal shadow; item hover solid `#00a594` with dark ink and 4px radius, active item scale-down.
- **Navbar icons:** static at rest; bell and upload icons lift with teal glow on hover (no idle breathing).
- **Links:** `#20dde0` at rest → `#8ff7f8` on hover; `.link-purple` is kept as a teal alias.
- **Avatars:** solid `#004a5a` fallback with a teal ring at rest (`rgba(32,221,224,0.4)`), teal glow on hover.

### Badges / Chips
- **Teal badge** (`bg-purple` kept as alias / canonical `chip-dragon`): solid `#00a594` fill, dark `#02120f` ink, pill.
- **Content-type badge:** dark plate (`rgba(6,16,26,0.95)`) with a teal hairline and a bright-aqua glyph; hover lights the border teal and lifts 1px.
- **Popular badge:** gold system — `rgba(255,201,77,0.12)` surface, `rgba(255,201,77,0.4)` border, `#ffd88a` text; the icon is a Font Awesome flame (`fa-fire`), never an emoji glyph. Static — no pulse.
- **Chapter number:** circular deep-teal plate with the index.

### Tooltip
- **Panel:** deep-teal `rgba(0,65,80,0.95)` fill, `#f0f8ff` text, 5px radius, 10px padding, 300px max-width, centered text, fade (~150ms), no arrow (via `svelte-tooltip-gca`).

### Reading Wells (the Deep Ledger)
- **Tale description & chapter text:** flat `#04090f` well, 1px `#1c3350` border, at most one faint top sheen, `0 8px 28px rgba(0,0,0,0.4)` drop, body text `#f0f8ff`/`#cce0e5` with `line-height: 1.75–1.8` and a 72ch measure centered.

### Notifications (the Keeper's Ledger)
- **Panel:** flat `#04090f`, 16px corners, teal hairline, calm teal shadow; header icon solid `#004a5a`.
- **Item:** flat abyss row, unread items carry a calm teal wash (`rgba(0,165,148,0.15–0.25)`) and a static aqua indicator dot; hover lights a teal border.
- **Empty state:** a bell-slash mark with the copy "All caught up!"

### Signature Component: Content Cards (Tale/Art Scales)
- 16px rounded flat `#0a141f` card with full-bleed cover (`object-fit: cover`, lazy-loaded via srcset), one faint top sheen across the cover, a solid `rgba(2,8,14,0.88)` overlay at the bottom (teal hairline top border) carrying title + owner, a heart/like counter that gleams gold (`#ffc94d`, soft gold shadow) when liked, a chapter badge as a deep-teal plate, and a calm teal "Click to view" affordance. Popular cards gain the gold hairline. On touch devices the overlay inscription is always visible.

## Do's and Don'ts

### Do:
- **Do** keep all teal family colors on hue 174 — it's the identity lock.
- **Do** use `#20dde0` → `#8ff7f8` for link hover; the aqua lift is a system signature.
- **Do** build depth from flat abyss tonal steps and hairlines first, one sheen second, glow last.
- **Do** use rounded shapes (8px buttons, 16px cards, pill badges) everywhere.
- **Do** reserve gold for love and celebration — sparsity keeps it gleaming.
- **Do** let content cards read as dark scales: flat body, faint top sheen, heat-colored light; liked work gleams gold.
- **Do** keep the reading experience centered and calm: Comfortaa, generous spacing, flat abyss reading wells.
- **Do** keep true black (`#000000`) for large grounds so OLED pixels rest.
- **Do** use Font Awesome glyphs for icons; never let emoji stand in for an icon.

### Don't:
- **Don't** introduce light backgrounds or light-mode surfaces — this system is OLED-dark at rest.
- **Don't** add a second display font or a serif pairing; Comfortaa alone carries the voice.
- **Don't** apply glow or animation to resting content — flat surfaces at rest, light as a heat/state response.
- **Don't** use sharp corners (0px) or clinical flat buttons without hairlines on core surfaces.
- **Don't** place gold or bright aqua on large areas; they are light, not fills.
- **Don't** invert the heat ramp — newest work sparks aqua, most-loved gleams gold.
- **Don't** stack multiple gradients on one surface or reintroduce purple/magenta/orange.
- **Don't** gate content information behind hover on touch devices; `hover: none` surfaces the card inscriptions.
