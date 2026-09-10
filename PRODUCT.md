# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

SvelteKit 2 + Svelte 5 (runes), Bootstrap 5, Supabase (auth + database), PocketBase, TinyMCE editor, Resend, sharp, Node 24.x, deployed on Vercel.

## Users

Primary users are creators — writers and artists — who come to publish, share, and showcase their tales/books, chapters, and visual art. Readers are a secondary audience who discover, read, and follow that content; the platform treats the two as one community.

## Product Purpose

DreamingDragons is the official community platform of the DreamingDragons project. It lets creators publish and readers consume art and literature in one place, and defines success by content being read, followed, liked, commented on, and shared within the community.

## Positioning

- Hybrid art + literature in one place: unlike art-only (DeviantArt-style) or text-only (Wattpad-style) platforms, tales and visual art live together in the same community and feed.
- Fully self-hosted/independent: run by the owner (ArchangelGCA) and its community, not subject to big-platform rules and algorithms.

## Operating Context

- Creators upload books with chapters and visual covers, edit them with a TinyMCE editor, and organize/curate their work.
- Users follow one another, like content, leave comments, and organize art and tales into galleries.
- Notification system surfaces interactions; cross-tab and leader-tab coordination controls refresh load.
- Admin dashboard handles reports, users, content moderation, newsletter, and a panic-mode switch.
- RSS feeds expose latest content, all content, books, and chapters.
- Discord is the companion community space; social links point to Discord and GitHub.

## Capabilities and Constraints

- Auth and data via Supabase (server + browser clients, SSR cookie session validation).
- PocketBase (server >= 0.23, JS SDK 0.28.x) for image/file storage via the `_superusers` system auth collection; all superuser access goes through `src/lib/server/pocketbase.js`.
- Tailored image proxy pipeline for covers/avatars (srcset, lazyloading, sharp).
- Svelte 5 runes mode throughout; curated custom components (tooltips, toast, masonry) instead of generic UI libraries.
- Two user-selectable palettes over one structure: Dragon's Deep (default) and Royal Vault (legacy), switched via `data-theme` + CSS variables (see `src/lib/utils/theme.js`); the choice is stored on-device (cookie/localStorage).
- Terminology users expect: "tale" (book), "chapter", "Following", "Favourites", "galleries", "TOS", "privacy policy".

## Brand Commitments

- Name: DreamingDragons; owner/developer: ArchangelGCA.
- Official Discord community; social presence linked in the site footer.
- The visual theme is binding and must be preserved: OLED-dark abyss with a dragonfire-teal identity (true-black grounds, flat abyss surfaces, teal `#00a594`/`#20dde0` accents, trophy-gold `#ffc94d` highlights for loved content, calm hover/focus glow only, Bootstrap dark theme `data-bs-theme="dark"`).
- Logo: purple dragon favicon (`static/favicon.*`, `src/lib/images/favicon.webp`).

## Evidence on Hand

- Production version live at https://tales.archangelgca.eu.
- README.md records hosting recommendation, missing `.env`/schema, and a planned future move to https://dreamingdragons.net (not yet binding).
- Existing copy, UI strings, and structure in `src/` are the incumbent authority for naming and behavior.

## Product Principles

1. Creators come first: publishing and showcasing are the primary jobs; everything else supports them.
2. One community for art and literature: never split tales and visual art into separate isolated worlds.
3. Independence is a feature: self-hosted control over rules, algorithms, and the experience.
4. The identity is non-negotiable: preserve the OLED abyss + dragonfire-teal theme in every surface.
5. Keep the platform fast and light: targeted, lightweight custom components over heavy UI dependencies.