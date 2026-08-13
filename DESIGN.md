---
name: DreamingDragons Platform
description: A dark, royal-purple dragon-smith's foundry for sharing and reading tales and visual art.
colors:
  primary: "hsl(273, 100%, 33%)"
  primary-alpha-90: "hsla(273, 100%, 33%, 0.9)"
  royal-indigo: "#0b0086"
  royal-purple-mid: "#410075"
  royal-ember: "#3d34c7"
  royal-rose: "#830054"
  accent-magenta: "#c400ff"
  accent-magenta-hover: "#ff00fb"
  search-violet: "#b200e8"
  scrollbar-deep: "#1f002e"
  scrollbar-mid: "#370050"
  scrollbar-hover: "#5b0083"
  scrollbar-hover-light: "#6e00a1"
  text-primary: "hsl(0, 0%, 90%)"
  text-secondary: "hsl(0, 0%, 65%)"
  text-muted: "hsl(0, 0%, 60%)"
  background: "hsl(0, 0%, 10%)"
  surface: "hsl(0, 0%, 15%)"
  border: "hsl(0, 0%, 25%)"
  forge-night: "#0a0610"
  forge-floor: "#120a1c"
  forge-iron: "#170d21"
  forge-iron-2: "#221430"
  forge-edge: "#342043"
  ember: "#ff7b2b"
  ember-soft: "#ffab5e"
  ember-magenta: "#ff2bd6"
  login-glow: "hsl(290, 100%, 50%)"
  register-glow: "hsl(300, 100%, 50%)"
  magic-link: "hsl(275, 100%, 67%)"
  rss-orange: "#ff6600"
  white: "#ffffff"
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
    textColor: "{colors.white}"
    rounded: "{rounded.button}"
    padding: "0.375rem 0.75rem"
  button-purple-hover:
    backgroundColor: "hsl(273, 100%, 43%)"
    textColor: "{colors.white}"
  button-upload:
    backgroundColor: "{colors.royal-ember}"
    textColor: "{colors.white}"
    rounded: "{rounded.button}"
  button-register:
    backgroundColor: "{colors.royal-rose}"
    textColor: "{colors.white}"
    rounded: "{rounded.button}"
  card-surface:
    backgroundColor: "{colors.forge-iron}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.card}"
  tooltip:
    backgroundColor: "{colors.primary-alpha-90}"
    textColor: "{colors.white}"
    rounded: "{rounded.tooltip}"
    padding: "10px"
  badge-purple:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
---

# Design System: DreamingDragons Platform

## Overview

**Creative North Star: "The Ember-Forge"**

DreamingDragons is a dragon-smith's foundry at night. The community feed is the forge floor: every tale and artwork is a freshly forged piece cooling on the racks, still glowing with the heat of its making. The identity lives in the tension between two forces: the calm authority of deep royal purple — indigo-to-violet gradients, dark iron surfaces, generous rounded corners — and the living magenta-ember heat that marks freshly forged work, liked work, and every interactive moment. It feels like a well-kept night foundry: composed and regal at rest, warm and alive when you reach for something, and hottest where the work is newest.

The voice is **refined royal purple**: polished, confident, premium. Depth is built from layered charcoal-iron tones (near-black indigo `#0a0610` ground, `#170d21` iron surfaces) with the ember reserved for heat: fresh content, likes, hover, and focus. Motion is present but purposeful — ember flicker on hot badges, breathing glows on primary actions, gentle scale on hover, never gratuitous. Small playful details (dragons, emojis in copy) keep the royal tone from feeling cold.

**Key Characteristics:**
- Dark-at-rest: near-black indigo foundry night with a soft ember glow rising off the bottom of the viewport (`body` radial gradients); dark iron surfaces carry content.
- Royal purple is the spine: links, buttons, badges, and borders all resolve to the primary hue `hsl(273, 100%, 33%)`.
- Ember heat is the process: freshly forged work glows magenta-ember (`#ff7b2b` → `#c400ff`), liked work glows brightest, and content cools to royal-purple rest. Heat is ranked: Newest (hot) > Most Liked (ember) > Recently Updated (cooled).
- Layered tones first, glow second: elevation comes from iron tonal layering and gradients; glow is a selective reward for heat, hover, and focus.
- Rounded and soft: 8px buttons, 16px cards, pill badges — nothing sharp.
- Centered, confident rhythm: Bootstrap 12-col grid, centered hero/stat blocks, masonry content, horizontal drag-scroll rows.

## Colors

A two-force palette: royal purple family for identity and calm, ember-magenta family for heat and feedback, over a near-black indigo foundry night.

### Primary
- **Royal Purple** (`hsl(273, 100%, 33%)`): The identity color. Links, primary buttons, badges, borders, scrollbar thumbs, focus glows, `bg-purple` utilities, and the tooltip background.
- **Royal Purple Alpha-90** (`hsla(273, 100%, 33%, 0.9)`): Tooltip panels and semi-transparent purple fills over imagery.

### Secondary
- **Royal Indigo** (`#0b0086`): The deep partner in gradients — dropdown menus, upload/primary buttons, notification panels.
- **Royal Purple Mid** (`#410075`): Gradient midpoint for menus and panels.
- **Royal Ember** (`#3d34c7`): The upload button's brighter gradient stop.
- **Royal Rose** (`#830054`): The register button's warmer gradient stop.

### Tertiary — Ember Heat
- **Ember** (`#ff7b2b`): The forge's heat — used sparingly as glow, the warm side of the heat ramp on fresh content, popular badges, and the anvil-edge line.
- **Ember Soft** (`#ffab5e`): The bright tip of the ember — placeholder accents and badge glyphs.
- **Ember Magenta** (`#ff2bd6`): The spark side of the heat ramp — the hot end of liked/active states.
- **Accent Magenta** (`#c400ff`): Hover states for links, `.link-purple`, `text-purple`, search borders (`#b200e8` sits close by), and the bright side of the glow range.
- **Magenta Hover** (`#ff00fb`): The brightest ember — link hover and intense glow highlights.

### Neutral — Foundry Iron
- **Forge Night** (`#0a0610`): Deepest page ground (replaces the old neutral-only background); the foundry night.
- **Forge Floor** (`#120a1c`): Wells, large panels, and the dark well behind auth cards.
- **Forge Iron** (`#170d21`): Card and panel surface — the primary resting surface of the site.
- **Forge Iron-2** (`#221430`): Raised surfaces and hover states.
- **Forge Edge** (`#342043`): Hairline edges on iron surfaces.
- **Night Indigo** (`#1f002e`): Deepest background for scrollbar tracks and page wells.
- **Violet Dusk** (`#370050` / `#5b0083` / `#6e00a1`): Scrollbar thumb resting, hover, and hover-bright.
- **Text** (`hsl(0, 0%, 90%)`): Primary body text.
- **Secondary Text** (`hsl(0, 0%, 65%)`): Secondary labels and metadata (overridden to 35–45% on light surfaces).
- **Muted Text** (`hsl(0, 0%, 60%)`): Timestamps and fine print.
- **White** (`#ffffff`): Text on primary/colored fills.

### Named Rules
**The Ember Sparsity Rule.** Magenta/ember is heat, not surface. At rest, screens are purple-on-dark-iron; ember appears on fresh content, hover, focus, likes, and a few sanctioned highlights. Its rarity is what makes it glow.
**The Heat Ramp Rule.** Freshness and engagement are expressed as a heat ramp: hottest (ember-orange → magenta) on the newest content and highest likes, cooling to the hue-273 purple family at rest. Never invert the ramp; heat always marks what is new or loved.
**The One Purple Rule.** All purple family members derive from hue 273. Never introduce a blue-violet or red-violet outside the documented gradient stops.

## Typography

**Display/Body Font:** Comfortaa (Google Fonts), fallback `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
**Mono Font:** Menlo, Consolas, Monaco, monospace (code and technical snippets)

**Character:** Comfortaa's rounded, friendly geometry carries the community warmth; its single weight (Google's default) keeps headings and body visually unified. The pairing is cozy and modern — a fantasy forum that still feels approachable.

### Hierarchy
- **Display / Page Titles** (700, `h1`/`h2` scale, Comfortaa): Page identity — home titles, section headers, profile names.
- **Headline** (600, `h4`–`h5`): Section and card titles.
- **Body** (400, `1rem`, Comfortaa): Default reading text; chapter content sits in a warm dark iron well with generous padding and a 72ch measure.
- **Label / Badge** (600, small caps via Bootstrap badges, uppercase for content-type badges): Chips, tags, badges.
- **Small Text** (400, `0.8rem`): `.small-text` captions, timestamps, footer fine print.

### Named Rules
**The Comfortaa-Only Rule.** All UI copy uses Comfortaa. Do not introduce a second display face; hierarchy is expressed through size, weight, and glow, not a new family.

## Layout

Bootstrap 5.3 12-column grid on a fluid container (`container-fluid`, `max-width: 100%`, `overflow-x: hidden`). The system is centered and columnar:

- **Navbar:** full-width row, logo left (`col-2/3/4`), search center, notifications + profile right. Background is a forge-hall vertical fade from `rgba(65, 0, 117, 0.55)` to transparent with a faint ember glow at the top edge; a 2px ember heat line (`--ember-line`) separates it from content.
- **Search vent:** the search field reads as a furnace vent — dark foundry fill with a violet hairline, focused state gains a magenta glow via `input-group:focus-within`.
- **Content:** centered rows (`justify-content-center`) with a masonry column layout for tale/art cards (`Masonry` component, min column 350px, 10px gap). Sections are ranked by heat: "Newest Content — Fresh off the anvil" (hot dot), "Most Liked — The hot rack" (ember dot), "Recently Updated — Tempered" (cooled dot).
- **Horizontal rows:** `.row-horizontal` flex-nowrap rows with drag-scroll (`@svelte-put/dragscroll`) for follow feeds and most-liked carousels.
- **Responsive:** Bootstrap breakpoints (sm 576px / md 768px / lg 992px / xl 1200px / xxl 1400px). Cards collapse to single column, badges shrink, and the notification panel goes full-width below 576px.
- **Vertical rhythm:** Bootstrap `gap`/`g-*` scale and `--spacing-unit: 1rem`; generous vertical padding (`py-2`/`mt-3`/`mb-4`) for breathing room.

## Elevation & Depth

**Layered iron + selective ember glow.** Depth is constructed in two layers:

1. **Tonal layering (always on):** dark iron translucent surfaces (`var(--forge-iron)` cards, warm dark wells for reading), gradient panels (`.bg-purple-gradient` with an ember radial at the top, dropdown `linear-gradient(75deg, #0b0086, #410075)` with an ember kiss), and subtle iron edge distinctions.
2. **Ember glow (selective):** magenta/ember box-shadows reward heat, hover, focus, and active interaction. Glow is the language of "this responds."

### Shadow Vocabulary
- **Focus / Input Glow** (`0 0 0.6rem 0.25rem rgba(92, 0, 166, 0.75)`): `form-control:focus`, avatar hover, dropdown menus, upload/link hover.
- **Hot Ember Glow** (`0 0 0.8rem 0.3rem rgba(196, 0, 255, 0.8)`): `.link-animated:hover`, register button hover.
- **Breathing Glow** (`0 0 0.2rem 0.1rem rgba(196, 0, 255, 0.3)` → `0 0 0.6rem 0.25rem rgba(196, 0, 255, 0.6)`): the `.link-animated`/upload breathing animation cycle.
- **Iron Drop** (`0 2px 12px rgba(0, 0, 0, 0.45)`): cards lift with a soft black shadow; the forged plate (`0 6px 24px rgba(0,0,0,0.35)`) for profile stats bars and reading wells.
- **Tooltip Drop** (`0 2px 8px rgba(0, 0, 0, 0.3)`): tooltip panels lift with a soft black shadow, not a glow.

### Named Rules
**The Selective Glow Rule.** No random glows. A glow must answer heat, hover, focus, active, or a sanctioned breathing accent. At rest, surfaces stay tonal.

## Shapes

Soft and round everywhere — nothing sharp or clinical.

- **Buttons:** 8px radius (`rounded-3`); active state presses to `scale(0.95)`.
- **Cards / Containers:** 16px radius (`rounded-4`); cover images clip to the card via `overflow: hidden`.
- **Badges / Chips:** pill radius (`rounded-pill`/`rounded-5`); content-type badges use full pills with `border-radius: 1rem`.
- **Tooltips:** 5px radius.
- **Scrollbars:** 8–10px radius thumbs with purple gradient fills.
- **Avatars:** full circles with a purple glow on hover.
- **Notification panel:** 16px top radius on mobile, left radius on desktop, gradient `#0b0086 → #410075` with an ember radial at the top.

## Components

### Buttons
- **Shape:** rounded 8px; hover scales glow, active `scale(0.95)`; transitions `all 0.12s ease-in-out`.
- **Primary (`btn-purple`):** royal purple iron fill with a top highlight, white text, ember breathing pulse (`@keyframes pulse` 2s) at rest; hover lightens purple +16% and glows magenta. A 1px magenta hairline borders it.
- **Upload:** gradient `linear-gradient(270deg, #3d34c7, #5c00a6)` with breathing glow animation.
- **Register:** gradient `linear-gradient(270deg, #830054, #5c00a6)` with magenta box-shadow on hover.
- **Outline Search:** violet border (`#b200e8`) + violet text; hover fills royal purple and glows magenta.
- **Danger / Warning / Info:** Bootstrap semantic colors (danger `hsl(0,70%,50%)`, warning `hsl(45,90%,50%)`, success `hsl(140,60%,50%)`), used sparingly for destructive/moderate actions.

### Cards / Containers
- **Corner Style:** 16px radius.
- **Background:** forge iron — `var(--forge-iron)` (`#170d21`) with `0 2px 12px rgba(0,0,0,0.45)` drop, over the foundry night ground.
- **Shadow Strategy:** iron at rest; magenta/ember glow on hover.
- **Border:** none or `border-purple` (`1px solid var(--primary-color)`) on admin panels; ember hairline (`rgba(255, 171, 94, 0.22)`) tops the overlay plate.
- **Internal Padding:** `p-2`–`p-3` scale.

### Forge Racks & Heat Plates
- **Section headings** use `.forge-section-head` with a `.heat-dot`: hot (ember-orange radial, flickers), ember (magenta), cooled (royal purple). Section subtitles carry the forge voice ("Fresh off the anvil", "The hot rack", "Tempered").
- **Forge plate** (`.forge-title`, `.bg-info-profile`, `.bg-info-stats`): an iron panel with a faint ember radial at the top and a 1px magenta hairline; profile stats and tale stats bars use this treatment.
- **Cooling rack** (`.forge-rack`): a subtle ember sheen fading downward behind the newest-content grid.

### Inputs / Fields
- **Style:** dark foundry fill (`rgba(10, 6, 16, 0.55)`), `border-0` or a violet hairline, rounded-3.
- **Focus:** royal purple glow (`0 0 0.6rem 0.25rem rgba(92,0,166,0.75)`), no border shift.
- **Search:** input-group with violet search button; the whole group glows magenta on focus.

### Navigation
- **Dropdown menu:** gradient `linear-gradient(75deg, #0b0086, #410075)` with a faint ember radial at the top, magenta hairline border, purple glow shadow, item hover `background-color: #5c00a6` with 4px radius, active item scale-down.
- **Navbar icons:** breathing glow animation on the upload link; bell and upload icons scale to 1.1 with purple glow on hover.
- **Links:** `#c400ff` at rest → `#ff00fb` on hover; `.link-purple` variant uses the same pair.

### Badges / Chips
- **Purple badge** (`bg-purple`): royal purple fill, white text, pill.
- **Content-type badge:** forged plate — dark iron (`rgba(23,13,33,0.98)` → `rgba(34,20,48,0.95)`) with an ember radial and a warm ember hairline; the book glyph is ember (`#ffab5e`) with an ember glow; hover lights the border magenta and lifts 1px.
- **Popular badge/glow:** ember heat — a hot gradient (`hsla(28,100%,52%) → hsla(320,100%,48%) → hsla(273,100%,46%)`) with warm ember shadow, pulsing opacity; the wrapper glows in ember→magenta→purple.
- **Chapter number:** circular purple plate with the index.

### Tooltip
- **Panel:** royal purple alpha-90 fill, white text, 5px radius, 10px padding, 300px max-width, centered text, fade+position animation (~150ms), no arrow (since the tooltip migration to `svelte-tooltip-gca`).

### Reading Wells (Smith's Journal)
- **Tale description & chapter text:** warm dark iron well — a radial ember whisper at the top over a `rgba(10,6,16,0.62) → rgba(23,13,33,0.65)` gradient, 1px magenta hairline, inset top highlight, `0 8px 28px rgba(0,0,0,0.4)` drop, body text at `hsl(0,0%,88%)` with `line-height: 1.75–1.8` and a 72ch measure centered.

### Signature Component: Content Cards (Tale/Art)
- 16px rounded iron card with full-bleed cover (`object-fit: cover`, lazy-loaded via srcset), a forged overlay at the bottom (ember radial rising from the edge + dark purple gradient, ember hairline top border) carrying title + owner, heart/like counter with magenta glow when liked, chapter badge as a forged plate, and a purple-glow "Click to view" affordance. Popular cards gain the ember heat glow border.

## Do's and Don'ts

### Do:
- **Do** keep all purple family colors on hue 273 — it's the identity lock.
- **Do** use `#c400ff` → `#ff00fb` for link hover; the ember progression is a system signature.
- **Do** build depth from dark iron translucent layers and gradients first, glow second.
- **Do** use rounded shapes (8px buttons, 16px cards, pill badges) everywhere.
- **Do** reserve ember/magenta glow for heat, hover, focus, and breathing accents — sparsity keeps it glowing.
- **Do** keep the reading experience centered and calm: Comfortaa, generous spacing, warm iron reading wells.
- **Do** use the documented gradient stops (`#0b0086`, `#410075`, `#5c00a6`, `#3d34c7`, `#830054`) rather than inventing new purple mixes.

### Don't:
- **Don't** introduce light backgrounds or light-mode surfaces — this system is dark-at-rest.
- **Don't** add a second display font or a serif pairing; Comfortaa alone carries the voice.
- **Don't** apply glow to resting content — tonal iron surfaces at rest, glow as a heat/state response.
- **Don't** use sharp corners (0px) or clinical flat buttons on core surfaces.
- **Don't** place ember/magenta on large areas; it is heat, not a fill.
- **Don't** invert the heat ramp — newest and most-liked content must always read hotter than old content.
- **Don't** invent purple hues outside the documented family; stay on the hue-273 royal spine.
