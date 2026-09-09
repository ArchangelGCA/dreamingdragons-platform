# Work-in-progress - DreamingDragons-Tales

**Using a VPS would be the best option for hosting the website.**

.env file isn't provided for now (not even .env.example), as well as the database schema. Please contact the repository owner for more information.

A production version of this project is hosted at: [https://tales.archangelgca.eu](https://tales.archangelgca.eu).

In the future we're planning to move our domain to https://dreamingdragons.net.

Make sure to join our Disord server for more information: [Discord](https://discord.gg/u6qFjfDDy2).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history (Bun 1.4.2 migration,
image-proxy retirement, dependency upgrades, security fixes).

## Developing (Bun 1.4.2)

This project uses [Bun](https://bun.sh) 1.4.2. Do not use npm/pnpm/yarn.

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

> Hybrid runtime (deliberate): Bun 1.4.2 locally for installs/dev/builds,
> stable Node.js 22 for Vercel Functions (`adapter-vercel`
> `runtime: 'nodejs22.x'`). `vercel.json` pins the install toolchain to
> `bunx bun@1.4.2 install` (Vercel's default Bun 1.3.x can't parse the 1.4
> lockfile) — no `bunVersion` flag, so Functions stay on Node.
> See CHANGELOG for details.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
