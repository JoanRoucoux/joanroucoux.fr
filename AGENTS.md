# AGENTS.md

Guidance for AI coding agents working in this repository. See the [README](README.md) for the full project overview.

## Project

Angular 22 application (standalone components, zoneless, signals). The app ships no global chrome (header, sidebar, navigation) and renders only its body: it can be embedded in a host shell, or run standalone. No integration mechanism is assumed.

Package manager: **pnpm** (version pinned in the `packageManager` field of package.json). Node 24 (`.nvmrc`).

## Commands

| Command                    | Purpose                                                    |
| -------------------------- | ---------------------------------------------------------- |
| `pnpm install`             | Install deps                                               |
| `pnpm start`               | Dev server                                                 |
| `pnpm run test:coverage`   | Unit tests with coverage                                   |
| `pnpm run e2e`             | Playwright end-to-end tests                                |
| `pnpm run lint`            | ESLint (includes Sheriff module-boundary rules)            |
| `pnpm run format:check`    | Prettier check                                             |
| `pnpm run check:prerender` | Checks the prerendered HTML in `dist/` (run after `build`) |

Before considering a change done, run the same pipeline as CI: `format:check`, `lint`, `test:coverage`, `build`, `check:prerender`, `e2e`.

## Architecture

- `src/app/core/`: global infrastructure (i18n, logger, 404, `seo/page-head.ts`).
- Prerendering: `outputMode: "static"` in `angular.json` with `src/main-server.ts`, `app-config-server.ts` and `app-routes-server.ts` (every page `RenderMode.Prerender`, `**` `RenderMode.Client`). There is no server, no `server.ts`, no express. `scripts/check-prerender.mjs` reads the output and fails on a missing page, a wrong `lang` or title, a `noindex` gap, a leftover `[[`, a Google Fonts URL, an inline event handler or an executable inline script.
- `src/app/features/<feature>/`: one folder per business feature, containing one folder per screen plus `<feature>-routes.ts`. A screen folder is named after its route segment (`list/`, `detail/`, `create/`) and holds everything that serves only that screen: the page, its store if it has one, its dialogs. A feature with a single screen keeps the page at its root (`features/site/site-page.ts`). No `pages/` or `services/` folders: grouping is by domain, not by technical type.
- **`<feature>-routes.ts` is the feature's routing entry point**: every feature has one, whatever its number of screens, and it owns the feature's guards and `provideTranslocoScope`. Its paths come from the feature's contract (`contract/<feature>-paths.ts`), never from string literals. `app-routes.ts` imports a feature's routes file and its contract, nothing else: it never reaches for a page directly. A feature is then relocatable (to another app, to another MFE) by moving its folder and changing those imports.
- `src/app/shared/`: reusable presentation/test helpers, imports neither `core` nor `features`.
- Module boundaries are enforced at lint time by Sheriff ([sheriff.config.ts](sheriff.config.ts)): `features` -> `core`/`shared`; `core` -> `shared`; features import each other only through `contract/`; `core` may import contracts; contracts import nothing from the app. Modules are barrel-less: no `index.ts`, import files directly; private files go in an `internal/` subdirectory.
- Import aliases: `@core/*`, `@features/*`, `@shared/*`, `@environments/*`.

## Feature contract

`src/app/features/<feature>/contract/` is a Sheriff module tagged `contract:<feature>`: the only part of a feature that the rest of the app may import. It is named `contract` because `public/` is the static assets folder and "api" suggests a backend.

- A contract holds pure data only: route segments, absolute paths, functions that build link commands, query param keys and values, and their types. Never a component, service, store, `inject()` or any `@angular/*` import.
- Why: importing another feature's contract must pull only constants into the importer's chunk (lazy loading), and a shared injectable would be state shared between features, which belongs in `core` or the backend.
- One file per concern, barrel-less, no `index.ts`. Every feature has `contract/<feature>-paths.ts` with at least its segment (one `<FEATURE>_PATHS` object per feature: `segment`, a `<child>Segment` per child route, then absolute links or link builders): `app-routes.ts` mounts the feature on it and cannot take it from `<feature>-routes.ts`, since a static import would make a lazy chunk eager.
- Something enters a contract only when a second module needs it. Route parameter names (`:id`) stay private: a path builder (`FEATURE_PATHS.detail(id)`) hides them.
- No route path is written as a string outside the feature that owns it: templates and navigation read the contract through a `protected readonly` field of the component. Specs and e2e keep literal URLs on purpose, since they assert the user-facing URL.

## Adding a page to a feature

1. Create `<feature>/<screen>/` where `<screen>` is the route segment, with `<entity>-<screen>-page.ts` (+ `.html`, `.spec.ts`), class `<Entity><Screen>Page`, selector `app-<entity>-<screen>-page`. **The folder carries the short name, the files carry the full one**: `orders/list/order-list-page.ts`, never `orders/order-list-page/order-list-page.ts`.
2. Name the screen after what it is, not after the CRUD operation, and stick to `list`, `detail`, `create`, `edit`, `form`. One screen handling both creation and update is `form/<entity>-form-page.ts`, with the mode derived from the presence of the route parameter.
3. If the page keeps state beyond a few local signals, move it to a store: see "Where code goes in a feature" and "State and data access" below.
4. Wire the page into `<feature>-routes.ts`, with `data: { lang, page }` (`pageRoute()` in `site-routes.ts`); `PageHead` derives the title and metadata from `page`.
5. Add its translations under the feature's i18n scope (`src/i18n/<feature>/<lang>.json`), keyed by screen (`<feature>.<screen>.*`): for example `site.hero.*`.

## Where code goes in a feature

**The folder level is the provider level.** Everything in a feature has a lifetime, and that lifetime decides both who provides it and where its file sits. There are four levels, not two:

| Lives as long as                | Provided by                                | Sits in                        |
| ------------------------------- | ------------------------------------------ | ------------------------------ |
| one screen                      | that screen's page component               | `<feature>/<screen>/`          |
| one dialog                      | the dialog component                       | `<feature>/<screen>/<dialog>/` |
| the journey through the feature | the wrapper route of `<feature>-routes.ts` | `<feature>/` root              |
| the app                         | `providedIn: 'root'`                       | `core/`                        |

- **A feature with more than one screen has a wrapper route** (`path: ''` with `children`), which `site-routes.ts` already uses to carry `provideTranslocoScope`. It is where feature-wide guards and feature-wide state hang. When a feature has a single screen, the feature level and the screen level are the same route and it carries both (`site-routes.ts`). Without that level, anything outliving a single screen falls back to root, and root-provided screen state is a lifetime bug rather than a style issue: it survives navigation and only resets on a page reload.
- **A dialog is a screen that is not routed**: its own folder, its own component, its own store provided by the dialog component itself, so opening creates it and closing destroys it. It hands back a typed result through its dialog ref, and the screen that opened it decides what follows: reload a list, navigate. Never pass the opening component's `Injector` into the dialog to reach that screen's store: it welds the two together, and the screen's store swells back.
- **A guard sits at the level it protects.** Feature-wide: `<feature>/<feature>-access-guard.ts` on the wrapper route; one screen: that screen's folder. A feature's guard never lives in `app-routes.ts`, or the app knows the feature's access rules and the feature stops being relocatable. Prefer `canMatch`, which lets a refusal fall through instead of cancelling the navigation, and return a `RedirectCommand` so the user lands somewhere. Inside a lazily loaded routes file `canMatch` cannot save the chunk download, since it runs once the chunk is there: moving it onto the `loadChildren` route would, at the price of importing the guard eagerly into `app-routes.ts`.
- **One folder per component, named after its role and kept short** (`list/header/order-list-header.ts`, `list/delete-dialog/order-delete-dialog.ts`). A screen folder is really the folder of its page, which is why `list/` holds `order-list-page.ts` directly; a sub-component with its own template and spec is the same kind of object and gets the same treatment. The redundancy to avoid is repeating the full name in the folder (`list/order-list-header/order-list-header.ts`), never the folder itself: the rule is short folder, fully qualified file, at every depth.
- **Whatever is not a component sits next to the component it serves**, at the shallowest level that covers its readers: a store beside its page or its dialog, a column definition inside `table/` when only the table reads it and at the screen root when the page reads it too. Same nearest-common-ancestor rule as between screens, one level down.
- **A presentational child that starts wanting a store** usually means the state belongs to the screen's store and should come back down as an input.
- **Shared code moves up to the nearest common ancestor**: the feature root for two screens of one feature, `shared/` beyond. Two sibling screens never import each other (Sheriff cannot catch this: they belong to the same module).
- **Never create `shared/`, `common/` or `utils/` inside a feature.** The feature root already means "belongs to the whole feature", so such a folder separates nothing: it is `pages/`/`services/` again, grouping by technical type inside a domain. Split a crowded feature root by domain instead. The app-level `shared/` may group by technical type, precisely because it has no domain to group under.
- **Share the rule, not the shape.** Factor something out only when a change to one screen must change the other.

## State and data access

- **A page does not own non-trivial state.** State lives in a `<screen>-store.ts` colocated with the screen, and the page interacts with nothing but that store. The store is a **private** dependency (`#store`) and the page re-exposes what its template consumes (`protected readonly items = this.#store.items`), so templates never carry a `store.` prefix: where the data comes from is not the view's business. This is a layering rule, not a size threshold: no judgment call about when a page has grown enough. A screen with only local view state can keep it in the component; a screen with no state (`site-page.ts`) has no store at all.
- **A store serves exactly one thing that opens and closes**: one screen, or one dialog. State that only means something while a dialog is open belongs to that dialog's store, never to the screen's. This is what keeps a screen store from swelling as the screen gains features, and it is again a rule rather than a line count.
- **Specs mirror the wiring**: a spec provides the store the way the page component does, and the scope the way the route does.
- **The store owns the route parameters it depends on**, read from `ActivatedRoute`: it is scoped to that screen, so it is the natural owner of "what am I looking at". A page therefore has no route input to forward.
- **A screen's store is provided by that screen's component (`providers` on `@Component`), never by its route.** Route-level `providers` read as the screen's lifetime and are not: the router builds one environment injector per `Route` object, caches it on that object and reuses it on every activation. Angular 22 tears those injectors down only for an application that opts into `withExperimentalAutoCleanupInjectors()`, which this one does not, so a route-provided store outlives its screen exactly like a root-provided one. Its state then initializes once per page load and never again. A component-level provider is created and destroyed with the component, which is what "one screen" means. It is also the only way for a store to read the matched route's parameters, since `ActivatedRoute` is a node-injector token supplied by `RouterOutlet`: a route-provided store injecting it gets the _root_ route's `ActivatedRoute` and silently reads a missing parameter. `provideTranslocoScope` and guards stay on the route, whose lifetime is the journey through the feature rather than one screen.
- **Navigation stays in the page.** A store returns a result (a `save()` returns the created entity or `undefined`); the page decides where to go next. A store that injects `Router` knows too much.
- **Reads are signals, writes return a result.** The template reads signals; commands are `async` methods returning their outcome, awaited by the handler that triggered them.

## Conventions

- Everything in the repo is written in **English** (code, docs, commit messages).
- No comments, in code and configuration alike. A trap no test can catch goes in Gotchas below.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org), enforced by commitlint. lint-staged formats and lints staged files on commit. A pull request title follows the same rules, since the squash merge turns it into the commit on main.
- OnPush is Angular 22's default change detection: do **not** add `ChangeDetectionStrategy.OnPush` to components.
- `inject()` + `#` private fields; signals for state; no NgRx.
- Never suffix a class with `-service`: name it after the role it plays (`-store` for state).
- `verbatimModuleSyntax` is enabled: type-only imports must use `import type { X }` or `import { type X }`.
- `console` is forbidden (ESLint) outside `core/logger` and `main.ts`: inject `Logger`.
- File names separate words with dashes, never dots: `title-strategy.ts`, `site-routes.ts` and `app-config.ts`, not `title.strategy.ts`, `site.routes.ts` or `app.config.ts` (this departs from what `ng new` generates). Classes are named after their role (`site-page.ts`, `order-list-store.ts`, `not-found-page.ts`), never after their Angular type.
- Dependabot runs monthly with a 7-day cooldown (`.github/dependabot.yml`) and every update is reviewed and merged by hand. The README names major versions only, since the exact ones live in the manifests Dependabot bumps.

## i18n (Transloco)

- The language comes from the route, never from the browser or a cookie: `/` and `/mentions-legales` are French, `/en` and `/en/legal` are English. French is the default (`DEFAULT_LANG` in `core/i18n/site-lang.ts`). No browser-language detection, no persisted choice, no cookie.
- Each page route carries `data: { lang }` and `resolve: { lang: langResolver }`: the resolver loads that language, then activates it. The `**` and `404` routes render the 404 in French (`data.page` is `not-found`); `404` exists so that it is prerendered into `404/index.html`. The language switch is a plain link to the counterpart URL (`counterpartUrl`).
- Translations are bundled, not fetched: `TranslocoBundledLoader` maps each path to a dynamic `import()` of `src/i18n/<path>.json`, so there is no `HttpClient` and prerendering works. A new file needs a line in that map.
- The global `src/i18n/<lang>.json` files only hold keys needed synchronously before any scope loads: `meta.*` (titles and description read by `PageHead`) and the 404 page. The default language is loaded by an app initializer: keep them minimal.
- Each feature has a lazy scope in `src/i18n/<feature>/<lang>.json`, declared with `provideTranslocoScope('<feature>')` in the feature's routes. Keys are prefixed with the scope (`site.hero.title`).
- A page route resolves `preloadScope('<feature>')` on a child of the route that resolves `langResolver`: parents resolve first, so the scope is loaded for the new language.
- Every key must exist in both `fr` and `en`.

## Testing

- Component tests use Angular Testing Library (`render`, `screen`, `userEvent`): query by role or label, not by CSS selectors. Stores use plain `TestBed` (a store is tested without rendering its page). jest-dom matchers are set up in `src/test-setup.ts`.
- jsdom implements no `<dialog>` behavior: [src/test-setup.ts](src/test-setup.ts) shims `showModal`/`close` so specs can drive the markup, and the semantics that matter, initial focus on the safe action, Esc, focus returned to the trigger, are asserted in the Playwright suite instead.
- `coverageInclude` in [angular.json](angular.json) makes every source file count, including those no spec imports: without it v8 reports only what a test loaded, so a file with no spec is invisible rather than uncovered. `coverageExclude` holds the pure wiring (bootstrap, `*-routes.ts`, `*-provider.ts`, environments); anything with behavior gets a spec.
- Coverage is at 100% and must stay there; the CI thresholds (85/80/70/85) are intentionally lower so downstream users of the starter are not blocked: do not raise them.
- `data-testid` attributes in templates are used by the Playwright e2e page objects: keep them even where unit tests query by role.

## Gotchas

- TypeScript stays on 6.x (Dependabot ignores `>=7`): TypeScript 7 breaks `typescript-eslint` (via `ts-api-utils`). Do not bump until typescript-eslint supports TS 7.
- `pnpm-workspace.yaml` sets `saveExact: true`: `pnpm add` records exact versions, keep it that way.
- `pnpm-workspace.yaml` `allowBuilds` is required for native postinstall scripts (esbuild, lmdb, ...): do not remove it.
- GitHub Actions in `.github/workflows/ci.yml` are pinned by commit SHA (Dependabot keeps them updated): when adding one, pin it the same way.
- nginx sets every header at server level only. An `add_header` inside a `location` silently drops all server-level headers (CSP included) for that location; per-path `Cache-Control` goes through `map $uri $cache_control`. Hashed filenames are cached a year, everything else revalidates. That one header has no `always`: with it, a 404 for a stale hashed name would be cached a year too. Fonts are not hashed, so they get 30 days without `immutable`.
- nginx serves a route only through `try_files $uri $uri/index.html =404`: there is no `index.html` fallback, so every client routed URL must be prerendered (`app-routes-server.ts`) or it answers 404 with the prerendered `404/index.html` (`error_page`). Falling back to `/index.html` would hand the home DOM to the client routed 404 and break hydration. The `$uri/index.html` form is what keeps `/en` from being redirected to `/en/`; only a trailing slash redirects (`rewrite ^/([^/\x5c].*)/$ /$1 permanent`, which refuses a leading slash or backslash so `/%5Cevil.com/` cannot become an open redirect to a backslash host; relative thanks to `absolute_redirect off`). A path whose last segment contains a dot is a file lookup like any other.
- CSP `script-src 'self'` is why `inlineCritical` is off in `angular.json`: Beasties' inline loader script would be blocked and the stylesheet would stay on `media="print"`. A new inline script needs a hash in the CSP or must become a file. Trusted Types are enforced (`trusted-types angular`): a new DOM sink must go through Angular's sanitization or a named policy added to the CSP. `frame-ancestors 'none'` forbids embedding the app in an iframe.
- The HEALTHCHECK targets `127.0.0.1`, not `localhost`: nginx listens on IPv4 only and `localhost` resolves to `::1` in the alpine image. The `docker` job of `ci.yml` waits for the container to be healthy.
- The required status check `ci` is the gate job at the end of `ci.yml`, not a build job: a new CI job must be added to its `needs`, or its failure will not block a merge. It runs `if: always()`, never `!cancelled()`: a skipped required check counts as passing and a cancelled run must turn the gate red.
- Dependabot never bumps the Node major in the Dockerfile: it follows `.nvmrc` and the CI `node-version`, changed together by hand.
- The app initializer in `transloco-provider.ts` waits for the default language to load: without it the first paint shows missing-translation warnings.
- jsdom 30 ships `HTMLDialogElement` without `showModal` and `close`, and implements neither the Esc handling of `<dialog>` nor the `cancel` event it fires: specs dispatch it by hand and the e2e suite covers the real behavior.
- `LanguageStore` keeps the `lang` attribute on `<html>` in sync so assistive technologies announce the right language: `App` injects it so that a page which never reads it (the legal notice) still gets the right `lang`, in the prerendered HTML too.
- `PageHead` is the only owner of `<title>`, description, canonical, hreflang, Open Graph and robots: routes carry no `title`. `langResolver` calls it with `data.page` once the language is active. The home pages are the only indexable ones.
- Angular 22 enables incremental hydration by default, and it turns on event replay, which writes an inline `<script>` that the CSP blocks. `app-config.ts` therefore uses `provideClientHydration(withNoIncrementalHydration())`: do not drop it. `check-prerender.mjs` fails on any inline script.
- The build also writes `index.csr.html` (the client rendered shell for `**`) next to the prerendered pages.
- `transloco-testing.ts` provides Transloco in unit tests: translations resolve to their key, and scoped keys use the camel-cased scope name.
- The bundle budget of `angular.json` (500 kB warning, 1 MB error) is loose on purpose: tighten it to the measured size once the UI library is in.
- `e2e-prod/` runs against the built container on `localhost:8080` through `playwright-prod.config.ts` (the `docker` job); `pnpm run e2e` never touches it.
- `deploy/site.caddy` is copied by `deploy.yml` to `/srv/proxy/sites/joanroucoux.fr.caddy` (the `deploy` user owns that directory) after the app deploy succeeded, then Caddy is reloaded through `proxy-caddy-1`. It hardcodes `joanroucoux.fr`, unlike Cairn's snippet which reads a variable from `/srv/proxy/.env`. A `log` in any snippet switches on access logging for the whole shared server, so unmapped hosts would be logged unmasked to Caddy's stderr unless the proxy's global block has `log default { exclude http.log.access }` (infra's Caddyfile; CI's throwaway Caddyfile mirrors it). The site's access log masks `remote_ip` and `client_ip` and deletes the `Cookie`, `Authorization`, `X-Forwarded-For`, `Forwarded`, `X-Real-Ip`, `True-Client-Ip` and `Cf-Connecting-Ip` request headers, since a client controls the forwarded ones and they carry full addresses: keep all of that if you touch the `log` block. Retention is bounded three ways (`roll_interval 24h`, `roll_keep 90`, `roll_keep_for 2136h`) so nothing outlives 90 days; rolled files are gzipped, which is why the README report command reads `*.log` and `*.log.gz`.
- Server prerequisites done once by hand: `/srv/joanroucoux.fr/` owned by `deploy` holding `.env` (`SITE_TAG` is written by `deploy.sh`), the `DEPLOY_SSH_KEY` secret in the `production` environment, and `joanroucoux.fr` plus `www` DNS pointing at the VPS.
