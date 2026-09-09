# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.13.0] - 2026-09-09

### Added

- **Admin dashboard overhaul: stats home, search + pagination, slim queries.**
  - Home is now a health-at-a-glance overview: live counts (creators, tales,
    chapters, open reports) via `count/head` queries that transfer zero rows,
    plus compact Panic / Migrations / Newsletter cards. Minimal text, 1-col →
    2-col → 4-col responsive grid, hue-273 theme (off-palette pinks removed).
  - Users: server-side search (`?q=`, username `ilike`), status filter
    (`all/active/blocked/warned`), 20/page pagination with counts. Emails are
    fetched per visible user (`getUserById`, max 20 parallel) instead of
    listing up to a million auth users; warnings load in one `in()` query
    instead of a per-profile join.
  - Content: title search + 12/page pagination; list select is slim
    (`chapters.text` excluded — it could be megabytes per book). New
    `get_chapter_text` action lazy-loads one chapter body on expand with
    loading/error states.
  - Reports: slim select, Tale/Chapter filter pills, fixed duplicate collapse
    IDs in the closed section (both sections reused `openBookReports`), closed
    items now receive `image_proxy`, icon empty states.
  - Newsletter: bounded auth paging (200/page, 2,000 cap with a "capped" note)
    instead of a single 1M `listUsers` call; profile join in 200-id chunks;
    fixed `audience.push` on a `$derived` (now a writable derived +
    reassignment, so adds render); email validation client + server; labelled
    progress bar; already-subscribed emails are filtered out of Fetch results.
  - New shared pieces: `src/lib/utils/admin.js` (`formatAdminDate`,
    `postAdminAction`, `clampPage`/`pageRange`/`totalPagesFor`,
    `isPlausibleEmail`), `AdminStat.svelte`, `AdminPagination.svelte`.
  - Layout: sticky desktop sidebar + collapsible mobile top bar, 48px touch
    targets, `startsWith` active state (nested routes stay highlighted), no
    more fixed `100vh` double-scroll content well.
  - Migrations: Font Awesome icons replace emoji headers (`🔁`/`⚠️`), dropped
    the off-palette local `.btn-purple` override in favour of the global
    vault button.

### Fixed

- Dashboard panic toggle read `panic.is_active` off the `{ panic: {...} }`
  wrapper (always falsy → always took the enable path); now normalises both
  shapes and the button correctly shows Enable/Disable.
- `AdminUser` empty tooltip (`use:tooltip` with no content) now has a
  "Delete warning" label; `border-magenta` drift replaced with
  `border-purple`.

### Verified

- `svelte-autofixer` on all touched admin components → zero new issues
  (remaining notes are pre-existing/systemic: plain `href`/`goto` without
  `resolve()`, admin-controlled `{@html}`, silenced
  `state_referenced_locally`).
- Impeccable `detect` over changed admin targets → advisories only, reviewed
  (status-signal shades of documented Bootstrap danger/warning/success,
  hue-273 tonal steps, icon sizing); `rgba(0,0,0,0.25)` spots replaced with
  `bg-black bg-opacity-*` utilities.
- `bun outdated` → clean, zero outdated packages.
- `bun --bun run build` → succeeds (client + SSR + `@sveltejs/adapter-vercel`).

## [0.12.1] - 2026-09-09

### Fixed

- **Pockethost migration no longer aborts on database-rejected rows.**
  Production showed a row failing with `You are not allowed to update your
  avatar icon` — a message raised inside the database (Postgres trigger /
  `RAISE`, not the app's admin check: the app had already verified admin, and
  service-role bypasses RLS but *not* triggers), which stopped the whole run.
  - Each blocked row is now automatically **retried once as your admin
    account** (the verified admin JWT): permission triggers reading
    `auth.uid()` see NULL under service-role but may accept the real admin
    identity. Passes the request-scoped user client into `migrateBatch` as a
    fallback; audit backup still uses service-role.
  - Rows failing both attempts are **skipped and collected, never fatal**:
    the server accepts an id-allowlisted `skip_ids` exclusion
    (`parseSkipIds`), the client carries forward per-target skip lists so
    batches drain past blocked rows instead of re-fetching them, and the run
    continues through every target (request-level target errors and the batch
    safety guard now skip the target instead of aborting the run).
  - Final summary distinguishes **complete / already-done / finished with N
    blocked rows / incomplete**, with a per-row failures table, a trigger/RLS
    hint (where to look: Supabase Dashboard → Database → Triggers), and the
    failures included in the downloadable run JSON — re-run retries just the
    blocked rows, already-migrated rows stay skipped.
  - New pure, unit-tested helpers: `parseSkipIds` (injection-safe id parsing),
    `isDbPolicyError` (trigger/RLS message heuristic).

### Verified

- New unit checks → 19/19 pass (`parseSkipIds`, `isDbPolicyError`,
  `rewriteValue` regression).
- `svelte-autofixer` on the migrations page → zero issues.
- `bun --bun run build` → succeeds.

## [0.12.0] - 2026-09-09

### Added

- **Pockethost host migration: `rosesintheflames.pockethost.io` → `dreamingdragons-images.pockethost.io`.**
  New reversible admin tool at Admin Dashboard → Migrations (plus a card on the
  main admin dashboard linking to it). Code search confirmed no hardcoded old
  host in `src/` (URLs come from PocketBase `getURL()` + env), so the migration
  rewrites stored Supabase values: `profiles.avatar_url`, `profiles.cover_url`,
  `book.cover_url` (direct image URLs) plus embedded-URL sweep of
  `book.description`, `chapters.text`, `comments.content`. Pure substring
  replace (`rosesintheflames` → `dreamingdragons-images`), exactly reversible.
  - Dry-run scan per table/column (`pockethost_scan`, `ilike` counts) before
    anything is written.
  - Type-to-confirm warning modal (`MIGRATE` / `ROLLBACK`, no native
    `confirm()`), explicit consequences + audit-table note.
  - Real-time progress: per-target status table, overall progress bar, live
    timestamped log, final summary with duration, and downloadable run JSON.
  - Vercel-safe batching: the client drives 50-row `pockethost_batch` calls
    (drain-from-front, no offsets), each well under serverless timeouts.
  - Reversible two ways: symmetric forward/reverse string replace plus
    best-effort audit rows in new `pockethost_host_migration_backup` table
    (see `supabase/migrations/20260909000000_pockethost_host_migration_backup.sql`;
    missing table warns but never blocks, rollback still works).
  - Idempotent already-done guard, always database-checked: every run starts
    with a live re-scan and stops with "already done — nothing rewritten" when
    zero cells match; trigger buttons disable once their direction scans to
    zero (opposite direction re-enables after a run); accidental confirm
    re-checks the DB instead of writing.
  - New server-only helper `src/lib/server/pockethost-migration.js`
    (allowlisted targets, `rewriteValue`, `scanAll`, `migrateBatch`).
  - Admin-only (`isAdmin`), service-role client for reads/writes.

### Changed

- **Dependencies: `resend` 6.26.0 → 6.27.0.** `bun outdated` is clean again
  (everything else already latest: `svelte` 5.57.0, `@sveltejs/kit` 2.70.3,
  `adapter-vercel` 6.3.4, `vite` 8.2.2, `bootstrap` 5.3.8, `pocketbase` 0.28.1).

### Verified

- `bun install` → clean; `bun outdated` → empty, zero outdated packages.
- `rewriteValue` unit check → 6/6 pass (forward, reverse, multi-occurrence,
  non-matching/external/null/empty → null; allowlist rejects unknown columns).
- `svelte-autofixer` on the migrations page → zero issues.
- `bun --bun run build` → succeeds (client + SSR + `@sveltejs/adapter-vercel`).

## [0.11.0] - 2026-09-09

### Changed

- **PocketBase upgraded: JS SDK 0.21.5 → 0.28.1 (server must be >= 0.23).**
  The old `pb.admins.authWithPassword(...)` service was soft-deprecated in
  SDK 0.22 (admins became the `_superusers` system auth collection on
  server 0.23) — all 8 call sites now auth via
  `pb.collection('_superusers').authWithPassword(...)`.
- **New central helper `src/lib/server/pocketbase.js`** (server-only, so
  secrets can't leak into the client bundle): `createSuperuserClient()`,
  `withSuperuserClient()`, `buildFileUrl()` (uses `pb.files.getURL()`
  instead of manual `PUBLIC_POCKETBASE_URL + '/api/files/' + ...` concat),
  `extractRecordIdFromFileUrl()` (robust `/api/files/{coll}/{id}/{file}`
  parsing — replaces fragile `substring`/`split('/')` index math) and
  `deleteFileRecordBestEffort()` (never throws, so book deletes / avatar
  resets / uploads no longer fail when the old file is already gone).
  Migrated: `src/lib/utils/misc.js` (`uploadImage`), `settings/+page.server.js`,
  `content/[book]/+page.server.js` (`delete_book`),
  `admin/dashboard/content/+page.server.js`,
  `admin/dashboard/users/+page.server.js` (`reset_avatar`, `reset_cover`),
  `admin/dashboard/migrations/+page.server.js` (both migrations).
  Auth store is now always cleared in `finally` blocks.
- **Dependencies: everything else already latest — `bun outdated` is clean.**
  `PRODUCT.md` pin note ("DO NOT update PocketBase") removed.

### Verified

- `bun install` → clean (`pocketbase@0.28.1`, lockfile saved).
- `bun outdated` → empty, zero outdated packages.
- `bun --bun run build` → succeeds (client + SSR + `@sveltejs/adapter-vercel`).
- SDK surface check: `collection('_superusers').authWithPassword`,
  `files.getURL`, `authStore.clear` all present in 0.28.1; `getURL` output
  matches the old manual URL shape.
- `extractRecordIdFromFileUrl` unit check → 9/9 pass (valid ids, Supabase /
  external URLs, empty/null, malicious ids rejected).
- Built SSR output contains the `_superusers` + `getURL` path; zero
  `admins.authWithPassword` matches in `src` or build output.

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
