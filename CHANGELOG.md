# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.10.0] - 2026-09-09

### Changed

- **Vercel production runtime Node.js 22 → 24 (hybrid setup kept).**
  Bun 1.4.2 stays for local installs/dev/builds (`packageManager`,
  `bun.lock`, `bunfig.toml`, `engines.bun`), while Vercel Functions move to
  stable Node 24 (`engines.node: 24.x`, adapter `runtime: 'nodejs24.x'`).
  Node 24 LTS is GA on Vercel for builds + functions; `adapter-vercel`
  6.3.4 already validates `nodejs24.x`. `vercel.json` keeps only
  `"installCommand": "bunx bun@1.4.2 install"` — deliberately no
  `bunVersion`, so installs use Bun 1.4 (Vercel default 1.3.x can't parse
  the 1.4 lockfile) while Functions stay on Node. Redeploy after pulling
  so Vercel picks up Node 24 (dashboard setting already switched to 24).
- **Tooltips: finished migration to `svelte-tooltip-gca` (1.0.4, latest).**
  The last 6 legacy CSS `data-tooltip` usages in
  `src/routes/profile/[profile]/+page.svelte` (external-link warning,
  joined-date, follow/unfollow, Home / Favourites / Galleries tabs) are now
  `use:tooltip={{...tooltipConfig, content}}` — same purple theme
  (`rgba(92,0,166,0.9)`, white, 10px padding, 5px radius, `0.875rem`,
  `300px` max) so the design is preserved, plus Popover top-layer,
  mobile tap/long-press, focus + Escape and `prefers-reduced-motion`
  handling from the library. Removed the dead `[data-tooltip]` CSS from
  `src/lib/css/style.css`. `gcamentions.js` mention popups stay imperative
  (dynamic rich-text content can't use the Svelte action) but their inline
  style was aligned to `tooltipConfig` (0.9 alpha, 5px radius,
  `0 2px 8px rgba(0,0,0,0.3)`, 150ms fade).
- **Dependencies: verified latest — no upgrades needed (PocketBase untouched).**
  `bun outdated` and `ncu` both report only `pocketbase` 0.21.5 → 0.28.1,
  intentionally pinned per project constraint. Everything else
  (`svelte` 5.57.0, `@sveltejs/kit` 2.70.3, `adapter-vercel` 6.3.4,
  `vite` 8.2.2, `bootstrap` 5.3.8, `svelte-tooltip-gca` 1.0.4, etc.) is
  already at latest.

### Verified

- `bun install` → clean (120 installs, no changes).
- `bun --bun run build` → succeeds; emitted function runtime is `nodejs24.x`.
- `rg data-tooltip src` → zero matches (all tooltips via `svelte-tooltip-gca`).

## [0.9.1] - 2026-09-09

### Fixed

- **Vercel deploy used Bun 1.3.14 for installs, failing on our lockfile**
  (`Unknown lockfile version` at `bun.lock`, `lockfileVersion: 2`).
  Vercel's default Bun is the `1.x` track (currently 1.3.14), which cannot parse
  the Bun 1.4 lockfile format — nothing was missing on our side. Fixed with
  `vercel.json` → `"installCommand": "bunx bun@1.4.2 install"` (per Vercel's own
  KB on pinning Bun for builds; mechanism verified locally, resolves exactly
  `1.4.2`). Deliberately **not** `bunVersion`: per Vercel docs that flag moves
  *all* Functions to the Bun runtime, which would undo the hybrid — the install
  command pins only the install toolchain, Functions stay `nodejs22.x`.
  The previous deploy "worked" anyway because Vercel fell back to a fresh
  (unlocked) npm resolve — redeploy after this fix so installs honor `bun.lock`.

## [0.9.0] - 2026-09-09

### Fixed

- **Dev-mode 500 (`bun run dev` showed "Internal Error" in the browser).**
  Root cause: `PUBLIC_IMAGE_PROXY_URL` is unset (proxy decommissioned), but
  `src/routes/+layout.js` still imported it from `$env/static/public`.
  Static `$env` imports throw at link time when the var is missing — SSR
  tolerated it as `undefined` (plain `curl` returned 200) while the browser's
  native ESM failed, so SvelteKit replaced the hydrated page with the error
  screen. Fixed by reading the var via `$env/dynamic/public` (never throws)
  in `+layout.js`, `+layout.server.js` and `hooks.server.js`. Verified in a
  real browser: homepage renders with content, original image URLs and zero
  console errors. (Earlier `rss.js`/`gcamentions.js` static imports of the same
  var were already removed.)

### Changed

- **Vercel production runtime back to Node.js 22 (hybrid setup).**
  The full-Bun cutover (0.8.0) built and emitted `bun1.x` functions correctly,
  but the Bun Functions runtime is Public Beta (no source maps/bytecode cache,
  `node:http` metrics gaps) with native-module risk for `sharp` uploads — not
  worth it for production today. So: Bun 1.4.2 stays for local
  installs/dev/builds (`packageManager`, `bun.lock`, `bunfig.toml`,
  `engines.bun`), while Vercel Functions stay on stable Node 22
  (`engines.node: 22.x`, adapter `runtime: 'nodejs22.x'`, `vercel.json`
  removed). Revisit when the Bun runtime matures.

### Verified

- Real-browser check of `/` under `bun run dev`: 200, content + images render.
- `bun --bun run build` → succeeds; emitted function runtime is `nodejs22.x`.

## [0.8.0] - 2026-09-09

### Changed

- **Runtime: full cutover to Bun 1.4.2 — Node.js removed entirely.**
  `engines.node` replaced with `engines.bun: 1.4.2` (with
  `packageManager: bun@1.4.2` and `bun.lock`, Bun is now the only runtime).
- **Vercel now runs functions on the Bun runtime** (Public Beta, per
  <https://vercel.com/docs/functions/runtimes/bun>):
  - `svelte.config.js`: `adapter-vercel` pinned to `runtime: 'bun1.x'`
    (adapter-vercel 6.3.4 validates it; explicit runtime also bypasses the
    adapter's Node-version auto-detection, which rejects Bun's Node-compat string).
  - New `vercel.json`: `{ "bunVersion": "1.4.x" }` — the only config Vercel needs
    to run functions on Bun (`1.4.x` selects the Rust-rewrite line matching local 1.4.2).
- Verified the adapter emits `"runtime": "bun1.x"` in
  `.vercel/output/functions/*/.vc-config.json` with correct route mapping.
- `bunfig.toml` / `README.md` comments updated to reflect Bun-only.

### Notes

- No application code changes were needed: no `node:` imports, no `process.*`
  usage, no per-route runtimes in `src/`; all env access is via SvelteKit `$env`
  (runtime-agnostic), and `crypto`/`Buffer` are Bun-compatible.
- Known Bun-on-Vercel differences (per Vercel docs): no automatic source maps,
  no bytecode caching, no `node:http/https` request metrics (`fetch` metrics work).
  Post-deploy, verify an image upload once (`sharp` runs in the Bun function;
  failures degrade to a 400, not a crash).

### Verified

- `bun install --frozen-lockfile` → clean.
- `bun --bun run build` → succeeds; emitted function runtime is `bun1.x`.
- `bun outdated` → only `pocketbase` (intentionally pinned).

## [0.7.0] - 2026-09-09

### Changed

- **Runtime: migrated from Node.js to Bun 1.4.2.** Local dev, install and builds
  now use Bun (`packageManager: bun@1.4.2`, `bun.lock`, `bunfig.toml`).
  Removed `.npmrc` (`engine-strict=true` blocked Bun) and `package-lock.json`.
  `engines.node: 22.x` is kept so Vercel still runs the production runtime on
  Node 22 via `@sveltejs/adapter-vercel`.
- **Vercel adapter pinned to `runtime: 'nodejs22.x'`.** Required because Bun 1.4.x
  reports a Node 26 compat version which `adapter-vercel` auto-detection rejects.
  Explicit runtime bypasses detection while keeping production on Node 22.
- **Images: external proxy optimizer decommissioned.** Added central
  `src/lib/utils/images.js` (`resolveImageUrl`, `safeExternalUrl`, `escapeHtml`)
  and updated all covers, avatars, galleries, RSS, oEmbed and sitemaps to serve
  original images at best quality directly (Supabase / PocketBase CDN + browser
  cache) with `loading="lazy"` and `decoding="async"`. `image_proxy` props are
  kept for backwards compatibility but ignored. No `?width=&quality=` proxy
  params are emitted anymore. A custom sharp endpoint on Vercel was evaluated
  and rejected (serverless cold starts, no persistent cache, extra cost).
- **Dependencies upgraded (PocketBase pinned at 0.21.5 per project constraint):**
  `sharp` 0.35.3 → 0.35.4, `svelte-tooltip-gca` 1.0.3 → 1.0.4,
  `@supabase/ssr` 0.12.4 → 0.12.7, `@supabase/supabase-js` 2.112.3 → 2.116.0,
  `@sveltejs/kit` 2.70.2 → 2.70.3, `jose` 6.2.8 → 6.2.12,
  `resend` 6.19.0 → 6.26.0, `svelte` 5.56.9 → 5.57.0, `vite` 8.2.1 → 8.2.2.
- Toast messages now render as text instead of raw HTML.

### Fixed

- **Security hardening:**
  - Fixed `UserAvatar.svelte` crash / broken `null` + URL image construction when
    the proxy is unset (now uses `resolveImageUrl`).
  - Fixed stored-XSS vector in mention tooltips (`gcamentions.js`): tooltips are
    now built with DOM APIs (`textContent`) instead of `innerHTML` interpolation.
  - `oEmbed`: same-origin check on `?url=`, escaped title / author / image /
    href output, stripped tags from descriptions, clamped `maxwidth/maxheight`.
  - Profile `website`: server validates `http(s)` only; profile page renders via
    `safeExternalUrl` with `rel="noopener noreferrer"` (blocks `javascript:` URLs).
  - Uploads (`settings`, `misc.js`): server-side MIME + 8 MB size checks,
    `sharp` wrapped in try/catch with `limitInputPixels` / `failOn: 'warning'`,
    `crypto.randomUUID()` filenames, safe old-file deletion.
  - `gcatokens.js`: `validateToken` no longer throws on malformed hex (length
    check + try/catch).
  - `gcacommons.js`: session validator returns `{session: null}` on error
    instead of `null` (prevents destructuring 500s).
  - Unsubscribe endpoint: generic success messages to prevent email/contact
    enumeration.
  - Removed dead `admin/dashboard/banuser` GET endpoint (hardcoded test user,
    state-changing GET).
  - `imagemap.xml` and RSS no longer emit `https://images.archangelgca.eu/...`
    proxy URLs; they emit escaped original absolute URLs.
- Fixed `BookSearch.svelte` Svelte 5 `{@const}` placement build error.

### Verified

- `bun --version` → `1.4.2`.
- `bun install --frozen-lockfile` → clean (120 installs).
- `bun outdated` → only `pocketbase` (intentionally pinned).
- `bun audit` → no new direct-dependency vulnerabilities (remaining `cookie`
  low and historical `svelte` notices are transitive/upstream).
- `bun --bun run build` → succeeds (client + SSR + `@sveltejs/adapter-vercel`).

## [0.6.3] - Previous release

- See git history for changes prior to changelog adoption.
