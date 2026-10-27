# Work-in-progress - DreamingDragons-Tales

**Using a VPS would be the best option for hosting the website.**

.env file isn't provided for now (not even .env.example), as well as the database schema. Please contact the repository owner for more information.

A production version of this project is hosted at: [https://tales.archangelgca.eu](https://tales.archangelgca.eu).

In the future we're planning to move our domain to https://dreamingdragons.net.

Make sure to join our Disord server for more information: [Discord](https://discord.gg/u6qFjfDDy2).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history (SvelteKit 3 + Bun 1.4.4
migration, image-proxy retirement, dependency upgrades, security fixes).

## Developing (Bun 1.4.4)

This project uses [Bun](https://bun.sh) 1.4.4 and SvelteKit 3. Do not use
npm/pnpm/yarn.

```bash
bun install
bun --bun run dev

# or start the server and open the app in a new browser tab
bun --bun run dev -- --open
```

## Building

To create a production version of your app:

```bash
bun --bun run build
```

You can preview the production build with `bun --bun run preview`.

## Formatting

Bun 1.4 ships a built-in formatter. Formatting is opt-in per file — the
migration to SvelteKit 3 deliberately kept the diff reviewable instead of
reformatting the whole tree:

```bash
bun fmt path/to/file.js   # format
bun fmt --check           # check everything
```

`[fmt]` settings in `bunfig.toml` plus `.editorconfig` mirror the existing
source conventions (4-space code, 2-space JSON/YAML, single quotes, 120
columns).

> Hybrid runtime (deliberate): Bun 1.4.4 locally for installs/dev/builds,
> stable Node.js 24 for Vercel Functions (`adapter-vercel`
> `runtime: 'nodejs24.x'`). `vercel.json` pins the install toolchain to
> `bunx bun@1.4.4 install` (Vercel's default Bun can't parse the current
> lockfile) — no `bunVersion` flag, so Functions stay on Node.
> See CHANGELOG for details.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
