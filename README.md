# joanroucoux.fr

Joan Roucoux: Angular application generated from [angular-starter-web](https://github.com/JoanRoucoux/angular-starter-web) v1.6.0.

## Getting started

```bash
pnpm install    # installs dependencies
pnpm start      # dev server on http://localhost:4200
```

## Scripts

| Script                   | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `pnpm start`             | Dev server                                        |
| `pnpm run build`         | Production build into `dist/`                     |
| `pnpm test`              | Unit tests (Vitest)                               |
| `pnpm run test:coverage` | Unit tests with coverage report and thresholds    |
| `pnpm run e2e`           | End-to-end tests (Playwright)                     |
| `pnpm run lint`          | Lint (ESLint, includes Sheriff module boundaries) |
| `pnpm run format`        | Format the whole project (Prettier)               |

## Next steps

- Build your pages in `src/app/features/site/`: one folder per screen, named after its route segment (`list/`, `detail/`, ...), holding the page and everything that serves only it, and expose route paths through the `SITE_PATHS` object of `contract/site-paths.ts` (pure data, the only part other modules may import): see "Adding a page to a feature" in [AGENTS.md](AGENTS.md) for the exact naming recipe.

See [AGENTS.md](AGENTS.md) for the architecture, conventions and testing guidelines.
