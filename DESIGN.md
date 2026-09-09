---
name: DreamingDragons Platform
description: A dark, royal-purple dragon's treasure vault at night, where tales and art glow as jewels on the hoard floor.
colors:
  primary: "hsl(273, 100%, 33%)"
  primary-alpha-90: "hsla(273, 100%, 33%, 0.9)"
  accent-magenta: "#c400ff"
  accent-magenta-hover: "#ff00fb"
  vault-night: "#06030b"
  vault-stone: "#0d0815"
  vault-velvet: "#150c22"
  vault-velvet-2: "#221332"
  vault-edge: "#332046"
  royal-indigo: "#0b0086"
  royal-purple-mid: "#410075"
  royal-ember: "#3d34c7"
  royal-rose: "#830054"
  ember: "#ff7b2b"
  ember-soft: "#ffab5e"
  ember-magenta: "#ff2bd6"
  search-violet: "#b200e8"
  text-primary: "hsl(0, 0%, 90%)"
  text-secondary: "hsl(0, 0%, 65%)"
  text-muted: "hsl(0, 0%, 60%)"
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
    textColor: "{colors.text-primary}"
    rounded: "{rounded.button}"
    padding: "0.375rem 0.75rem"
  button-purple-hover:
    backgroundColor: "hsl(273, 100%, 43%)"
    textColor: "{colors.text-primary}"
  button-upload:
    backgroundColor: "{colors.royal-ember}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.button}"
  button-register:
    backgroundColor: "{colors.royal-rose}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.button}"
  card-surface:
    backgroundColor: "{colors.vault-velvet}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.card}"
  tooltip:
    backgroundColor: "{colors.primary-alpha-90}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.tooltip}"
    padding: "10px"
  badge-purple:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
---

# Design System: DreamingDragons Platform

## Overview

**Creative North Star: "The Dragon's Hoard"**

DreamingDragons is a dragon's treasure vault at night. Every tale and artwork is a jewel laid on the hoard floor: fresh work still glows with ember warmth from the deep, loved work gleams brightest magenta, and the whole chamber rests in deep royal-purple torchlight. The community feed is the hoard itself — the interface expresses value as light on a gem, and the more the community loves a piece, the hotter it glows. It feels like entering a well-kept vault: composed and regal at rest, warm and alive when you reach for a treasure, and hottest where the newest work rests.

The voice is **refined royal purple**: polished, confident, premium. Depth is built from layered near-black indigo stone (`#06030b` ground) and deep velvet surfaces (`#150c22`), lit by hue-273 torch pools from above and a faint ember breath off the floor. The ember is reserved for heat: fresh content, likes, hover, and focus. Motion is present but purposeful — ember flicker on hot badges, breathing glows on primary actions, a soft lift and gem-gleam on hover, never gratuitous. Small playful details (dragons, emojis in copy, the treasure voice) keep the royal tone from feeling cold.

**Key Characteristics:**
- Dark-at-rest: near-black indigo vault night (`#06030b`) with royal-purple torch pools from the top corners and a faint ember breath rising off the floor (`body` radial gradients); deep velvet surfaces carry content.
- Royal purple is the spine: links, buttons, badges, and borders all resolve to the hue-273 primary `hsl(273, 100%, 33%)`.
- Ember heat is the process: fresh work glows ember-orange (`#ff7b2b` → `#c400ff`), loved work glows brightest magenta (`#ff2bd6`), and content cools to royal-purple rest. Heat is ranked: Freshly Mined (hot) > Most Precious (magenta gleam) > Kept Updated (cooled).
- Content cards are gems: the cover is the stone, a facet gleam catches torchlight at the top, and a heat under-glow ranks the work.
- Layered tones first, glow second: elevation comes from stone/velvet tonal layering and gradients; glow is a selective reward for heat, hover, and focus.
- Rounded and soft: 8px buttons, 16px cards, pill badges — nothing sharp.
- Centered, confident rhythm: Bootstrap 12-col grid, centered hero/stat blocks, masonry content, horizontal drag-scroll rows.

## Colors

A two-force palette: royal purple family for identity and calm, ember-magenta family for heat and feedback, over a near-black indigo vault night.

### Primary
- **Royal Purple** (`hsl(273, 100%, 33%)`): The identity color. Links, primary buttons, badges, borders, scrollbar thumbs, focus glows, `bg-purple` utilities, and the tooltip background.
- **Royal Purple Alpha-90** (`hsla(273, 100%, 33%, 0.9)`): Tooltip panels and semi-transparent purple fills over imagery.

### Secondary
- **Royal Indigo** (`#0b0086`): The deep partner in gradients — dropdown menus, upload/primary buttons, notification panels.
- **Royal Purple Mid** (`#410075`): Gradient midpoint for menus and panels.
- **Royal Ember** (`#3d34c7`): The upload button's brighter gradient stop.
- **Royal Rose** (`#830054`): The register button's warmer gradient stop.

### Tertiary — Ember Heat
- **Ember** (`#ff7b2b`): The vault's forge-heat — used sparingly as glow, the warm side of the heat ramp on fresh content, popular badges, and the torch seam.
- **Ember Soft** (`#ffab5e`): The bright tip of the ember — placeholder accents and badge glyphs.
- **Ember Magenta** (`#ff2bd6`): The spark side of the heat ramp — the hot end of liked/active states; a liked heart ignites this color.
- **Accent Magenta** (`#c400ff`): Hover states for links, `.link-purple`, `text-purple`, search borders (`#b200e8` sits close by), and the bright side of the glow range.
- **Magenta Hover** (`#ff00fb`): The brightest ember — link hover and intense glow highlights.

### Neutral — Vault Stone & Velvet
- **Vault Night** (`#06030b`): Deepest page ground — the vault at night.
- **Vault Stone** (`#0d0815`): Wells, large panels, and the dark well behind auth cards.
- **Vault Velvet** (`#150c22`): Card and panel surface — the primary resting surface of the site.
- **Vault Velvet-2** (`#221332`): Raised surfaces and hover states.
- **Vault Edge** (`#332046`): Hairline edges on velvet surfaces.
- **Gem Gleam** (`rgba(255, 255, 255, 0.13)`): The facet highlight that catches torchlight on the top of content cards.
- **Text** (`hsl(0, 0%, 90%)`): Primary body text.
- **Secondary Text** (`hsl(0, 0%, 65%)`): Secondary labels and metadata.
- **Muted Text** (`hsl(0, 0%, 60%)`): Timestamps and fine print.
- **White** (`#ffffff`): Text on primary/colored fills.

### Named Rules
**The Ember Sparsity Rule.** Magenta/ember is heat, not surface. At rest, screens are purple-on-dark-velvet; ember appears on fresh content, hover, focus, likes, and a few sanctioned highlights. Its rarity is what makes it glow.
**The Heat Ramp Rule.** Freshness and engagement are expressed as a heat ramp: hottest (ember-orange → magenta) on the newest content and highest likes, cooling to the hue-273 purple family at rest. Never invert the ramp; heat always marks what is new or loved.
**The One Purple Rule.** All purple family members derive from hue 273. Never introduce a blue-violet or red-violet outside the documented gradient stops.

## Typography

**Display/Body Font:** Comfortaa (Google Fonts), fallback `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
**Mono Font:** Menlo, Consolas, Monaco, monospace (code and technical snippets)

**Character:** Comfortaa's rounded, friendly geometry carries the community warmth; its single weight (Google's default) keeps headings and body visually unified. The pairing is cozy and modern — a fantasy community that still feels approachable.

### Hierarchy
- **Display / Page Titles** (700, `h1`/`h2` scale, Comfortaa): Page identity — home titles, section headers, profile names.
- **Headline** (600, `h4`–`h5`): Section and card titles.
- **Body** (400, `1rem`, Comfortaa): Default reading text; chapter content sits in a warm dark stone well with generous padding and a 72ch measure.
- **Label / Badge** (600, small caps via Bootstrap badges, uppercase for content-type badges): Chips, tags, badges.
- **Small Text** (400, `0.8rem`): `.small-text` captions, timestamps, footer fine print.

### Named Rules
**The Comfortaa-Only Rule.** All UI copy uses Comfortaa. Do not introduce a second display face; hierarchy is expressed through size, weight, and glow, not a new family.

## Layout

Bootstrap 5.3 12-column grid on a fluid container (`container-fluid`, `max-width: 100%`, `overflow-x: hidden`). The system is centered and columnar:

- **Navbar (the Vault Gate):** full-width row, logo left (`col-2/3/4`), search center, notifications + profile right. Background is a torch-lit gate: royal-purple torch pools from the top corners over a vertical fade, with a faint ember breath at the top edge; a 2px torch seam (`--ember-line`) separates it from content.
- **Search ledger slit:** the search field reads as a torch-lit ledger opening — dark stone fill with a violet hairline, focused state gains a magenta glow via `input-group:focus-within`.
- **Content:** centered rows (`justify-content-center`) with a masonry column layout for tale/art cards (`Masonry` component, min column 350px, 10px gap). Sections are ranked by heat as hoard strata: "Freshly Mined — Still warm from the deep" (ember gem), "Most Precious — The crown jewels" (magenta gem), "Kept Updated — Polished and kept" (cooled gem).
- **Horizontal rows:** `.row-horizontal` flex-nowrap rows with drag-scroll (`@svelte-put/dragscroll`) for follow feeds and most-liked carousels.
- **Responsive:** Bootstrap breakpoints (sm 576px / md 768px / lg 992px / xl 1200px / xxl 1400px). Cards collapse to single column, badges shrink, and the notification panel goes full-width below 576px. On touch devices (`hover: none`), content-card overlays are always visible — no hover-gated information on mobile.
- **Vertical rhythm:** Bootstrap `gap`/`g-*` scale and `--spacing-unit: 1rem`; generous vertical padding (`py-2`/`mt-3`/`mb-4`) for breathing room.

## Elevation & Depth

**Layered stone/velvet + selective ember glow.** Depth is constructed in two layers:

1. **Tonal layering (always on):** dark velvet translucent surfaces (`var(--vault-velvet)` cards, warm dark stone wells for reading), gradient panels (`.bg-purple-gradient` with an ember radial at the top, dropdown `linear-gradient(160deg, #0b0086, #2e0a55 60%, #1a0736)` with an ember kiss), and subtle velvet edge distinctions.
2. **Ember glow (selective):** magenta/ember box-shadows reward heat, hover, focus, and active interaction. Glow is the language of "this responds."

### Shadow Vocabulary
- **Focus / Input Glow** (`0 0 0.6rem 0.25rem rgba(92, 0, 166, 0.75)`): `form-control:focus`, avatar hover, dropdown menus, upload/link hover.
- **Hot Ember Glow** (`0 0 0.8rem 0.3rem rgba(196, 0, 255, 0.8)`): `.link-animated:hover`, register button hover.
- **Breathing Glow** (`0 0 0.2rem 0.1rem rgba(196, 0, 255, 0.3)` → `0 0 0.6rem 0.25rem rgba(196, 0, 255, 0.6)`): the `.link-animated`/upload breathing animation cycle.
- **Iron Drop** (`0 2px 12px rgba(0, 0, 0, 0.45)`): cards lift with a soft black shadow; the forged plate (`0 6px 24px rgba(0,0,0,0.35)`) for profile stats bars and reading wells.
- **Loved Gem Gleam** (`0 0 0.5rem 0.12rem rgba(196, 0, 255, 0.35)` at rest → `0 0 0.9rem 0.3rem rgba(255, 43, 214, 0.5)` on hover): the heat under-glow on loved content cards.
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
- **Avatars:** full circles with a subtle magenta ring and purple glow; they read as companion seals.
- **Notification panel:** 16px top radius on mobile, left radius on desktop, gradient `#0b0086 → #2e0a55 → #1a0736` with an ember kiss at the top.

## Components

### Buttons
- **Shape:** rounded 8px; hover scales glow, active `scale(0.95)`; transitions `all 0.12s ease-in-out`.
- **Primary (`btn-purple`):** royal purple velvet fill with a top highlight, white text, ember breathing pulse (`@keyframes pulse` 2s) at rest; hover lightens purple +16% and glows magenta. A 1px magenta hairline borders it.
- **Upload:** gradient `linear-gradient(270deg, #3d34c7, #5c00a6)` with breathing glow animation.
- **Register:** gradient `linear-gradient(270deg, #830054, #5c00a6)` with magenta box-shadow on hover.
- **Outline Search:** violet border (`#b200e8`) + violet text; hover fills royal purple and glows magenta.
- **Danger / Warning / Info:** Bootstrap semantic colors (danger `hsl(0,70%,50%)`, warning `hsl(45,90%,50%)`, success `hsl(140,60%,50%)`), used sparingly for destructive/moderate actions.

### Cards / Containers (Gems)
- **Corner Style:** 16px radius.
- **Background:** vault velvet — `var(--vault-velvet)` (`#150c22`) with `0 2px 12px rgba(0,0,0,0.45)` drop, over the vault-night ground.
- **Facet Gleam:** a `.gem-facet` overlay catches torchlight at the top of the cover (`linear-gradient(180deg, var(--gem-gleam) 0%, rgba(255,255,255,0.02) 34%, transparent 55%)`); the card reads as a faceted gem.
- **Heat Under-Glow:** `gem-rest` (royal purple at rest), `gem-loved` (magenta gleam, `#ff2bd6` on the like state).
- **Shadow Strategy:** velvet at rest; magenta/ember glow on hover.
- **Border:** none or `border-purple` (`1px solid var(--primary-color)`) on admin panels; ember hairline (`rgba(255, 171, 94, 0.20)`) tops the overlay plate.
- **Internal Padding:** `p-2`–`p-3` scale.

### Hoard Strata & Heat Gems
- **Section headings** use `.forge-section-head` with a `.heat-dot` gem: hot (ember-orange gem, flickers), ember (magenta crown gem), cooled (royal purple gem). Section subtitles carry the vault voice ("Still warm from the deep", "The crown jewels", "Polished and kept").
- **Vault plate** (`.forge-title`, `.bg-info-profile`, `.bg-info-stats`): a stone panel with a faint ember radial at the top and a 1px magenta hairline; profile stats and tale stats bars use this treatment.
- **Cooling sheen** (`.forge-rack`): a subtle ember sheen fading downward behind the freshly mined grid.

### Inputs / Fields
- **Style:** dark stone fill (`rgba(6, 3, 11, 0.55)`), `border-0` or a violet hairline, rounded-3.
- **Focus:** royal purple glow (`0 0 0.6rem 0.25rem rgba(92,0,166,0.75)`), no border shift.
- **Search:** input-group with violet search button; the whole group glows magenta on focus.

### Navigation (the Vault Gate)
- **Dropdown menu:** gradient `linear-gradient(160deg, #0b0086, #2e0a55 60%, #1a0736)` with a faint ember radial at the top, magenta hairline border, purple glow shadow, item hover `background-color: #5c00a6` with 4px radius, active item scale-down.
- **Navbar icons:** breathing glow animation on the upload link; bell and upload icons scale to 1.1 with purple glow on hover.
- **Links:** `#c400ff` at rest → `#ff00fb` on hover; `.link-purple` variant uses the same pair.
- **Avatars:** companion seals — a faint magenta ring at rest (`0 0 0 2px rgba(196, 0, 255, 0.28)`), purple glow on hover.

### Badges / Chips
- **Purple badge** (`bg-purple`): royal purple fill, white text, pill.
- **Content-type badge:** jeweled spine — dark velvet (`rgba(34,19,50,0.95)` → `rgba(21,12,34,0.98)`) with an ember radial and a warm ember hairline; the book glyph is ember (`#ffab5e`) with an ember glow; hover lights the border magenta and lifts 1px.
- **Popular badge:** ember heat — a hot gradient (`hsla(28,100%,52%) → hsla(320,100%,48%) → hsla(273,100%,46%)`) with warm ember shadow, pulsing opacity; the icon is a Font Awesome flame (`fa-fire`), never an emoji glyph. The wrapper glows in ember→magenta→purple.
- **Chapter number:** circular purple plate with the index.

### Tooltip
- **Panel:** royal purple alpha-90 fill, white text, 5px radius, 10px padding, 300px max-width, centered text, fade+position animation (~150ms), no arrow (since the tooltip migration to `svelte-tooltip-gca`).

### Reading Wells (the Vault's Ledger)
- **Tale description & chapter text:** warm dark stone well — a radial ember whisper at the top over a `rgba(6,3,11,0.62) → rgba(21,12,34,0.65)` gradient, 1px magenta hairline, inset top highlight, `0 8px 28px rgba(0,0,0,0.4)` drop, body text at `hsl(0,0%,88%)` with `line-height: 1.75–1.8` and a 72ch measure centered.

### Notifications (the Keeper's Ledger)
- **Panel:** 16px corner radius, gradient `#0b0086 → #2e0a55 → #1a0736` with an ember kiss at the top and a purple torch pool from the top-right; header icon is a faceted bell-crystal with a magenta glow.
- **Item:** dark velvet row, unread items carry a gradient magenta/indigo wash and a pulsing ember-magenta indicator dot; hover translates right and lights a magenta border.
- **Empty state:** a bell-slash crystal with the copy "All caught up!"

### Signature Component: Content Cards (Tale/Art Gems)
- 16px rounded velvet card with full-bleed cover (`object-fit: cover`, lazy-loaded via srcset), a `.gem-facet` torchlight gleam across the top of the cover, a velvet overlay at the bottom (ember radial rising from the edge + dark purple gradient, ember hairline top border) carrying title + owner, a heart/like counter that ignites magenta (`#ff2bd6`, drop-shadow glow) when liked, a chapter badge as a jeweled spine, and a purple-glow "Click to view" affordance. Popular cards gain the ember heat glow border. On touch devices the overlay inscription is always visible.

## Do's and Don'ts

### Do:
- **Do** keep all purple family colors on hue 273 — it's the identity lock.
- **Do** use `#c400ff` → `#ff00fb` for link hover; the ember progression is a system signature.
- **Do** build depth from dark stone/velvet translucent layers and gradients first, glow second.
- **Do** use rounded shapes (8px buttons, 16px cards, pill badges) everywhere.
- **Do** reserve ember/magenta glow for heat, hover, focus, and breathing accents — sparsity keeps it glowing.
- **Do** let content cards read as gems: velvet body, facet gleam at the top, heat-colored under-glow; liked work ignites magenta.
- **Do** keep the reading experience centered and calm: Comfortaa, generous spacing, warm stone reading wells.
- **Do** use the documented gradient stops (`#0b0086`, `#410075`, `#5c00a6`, `#3d34c7`, `#830054`) rather than inventing new purple mixes.
- **Do** use Font Awesome glyphs for icons; never let emoji stand in for an icon.

### Don't:
- **Don't** introduce light backgrounds or light-mode surfaces — this system is dark-at-rest.
- **Don't** add a second display font or a serif pairing; Comfortaa alone carries the voice.
- **Don't** apply glow to resting content — tonal velvet surfaces at rest, glow as a heat/state response.
- **Don't** use sharp corners (0px) or clinical flat buttons on core surfaces.
- **Don't** place ember/magenta on large areas; it is heat, not a fill.
- **Don't** invert the heat ramp — newest and most-liked content must always read hotter than old content.
- **Don't** invent purple hues outside the documented family; stay on the hue-273 royal spine.
- **Don't** gate content information behind hover on touch devices; `hover: none` surfaces the card inscriptions.
