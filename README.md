# joanroucoux.fr

Joan Roucoux: Angular application generated from [angular-starter-web](https://github.com/JoanRoucoux/angular-starter-web) v1.6.0.

## Getting started

```bash
pnpm install    # installs dependencies
pnpm start      # dev server on http://localhost:4200
```

## Scripts

| Script                     | Description                                           |
| -------------------------- | ----------------------------------------------------- |
| `pnpm start`               | Dev server                                            |
| `pnpm run build`           | Production build into `dist/`                         |
| `pnpm test`                | Unit tests (Vitest)                                   |
| `pnpm run test:coverage`   | Unit tests with coverage report and thresholds        |
| `pnpm run e2e`             | End-to-end tests (Playwright)                         |
| `pnpm run lint`            | Lint (ESLint, includes Sheriff module boundaries)     |
| `pnpm run format`          | Format the whole project (Prettier)                   |
| `pnpm run check:prerender` | Check the prerendered HTML in `dist/` (after `build`) |

## Next steps

- Deploy: pushing to `main` runs `.github/workflows/deploy.yml` (image on GHCR, files in `deploy/` copied to the VPS, Caddy snippet installed in the shared proxy). Visit statistics are read on demand from the masked Caddy access log:

  ```bash
  ssh vps 'docker run --rm --network none --mount type=volume,src=proxy_caddy-data,dst=/data,volume-subpath=logs,readonly --entrypoint sh allinurl/goaccess:1.11@sha256:4772d048ad67c9480104a1e12c035e7cecdae1212f8ed503da5465d27773d6a7 -c "{ cat /data/joanroucoux.fr*.log; zcat /data/joanroucoux.fr*.log.gz 2>/dev/null; } | goaccess - --log-format=CADDY --no-progress -o html"' > report.html
  ```

- Pages live in `src/app/features/site/`: the home page at its root and the legal notice in `legal/`. Route paths come from `SITE_PATHS` in `contract/site-paths.ts`; copy lives in `src/i18n/site/<lang>.json`, and every key exists in both languages. See "Adding a page to a feature" in [AGENTS.md](AGENTS.md).
- Fonts: Geist (400, 500, 900) and Geist Mono (500) woff2 files in `public/fonts/`, from the `vercel/geist-font` release `v1.7.2` (OFL licence alongside).
- Icons: square crop of `background.webp` (7680x4320), run once from the folder holding the source image, no script:

```bash
pnpm dlx sharp-cli@5.3.0 -i background.webp -o public/favicon-32.png extract 192 4032 1536 1536 -- resize 32 32
pnpm dlx sharp-cli@5.3.0 -i background.webp -o public/apple-touch-icon.png extract 192 4032 1536 1536 -- resize 180 180 --palette --compressionLevel 9
```

See [AGENTS.md](AGENTS.md) for the architecture, conventions and testing guidelines.
