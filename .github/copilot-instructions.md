# io-link — Workspace Instructions

## What This Is

A lightweight **Node.js/Express** service (PagoPA) that hosts Universal Link / App Link association files for the IO mobile app and generates deep-link URLs + QR codes for in-app features (`firma`, `idpay`). It also handles store-redirect with campaign tracking.

## Build & Test

Package manager: **Yarn 4** (enforce — do not use `npm` or `pnpm`). Node ≥ 22.

```bash
# From repo root (Turborepo delegates to app)
yarn build          # compile TypeScript → dist/
yarn test           # run all Vitest tests
yarn typecheck      # type-check without emit
yarn lint           # ESLint with cache
yarn code-review    # typecheck + lint + test:coverage (pre-PR gate)

# From apps/io-link/ directly
yarn test           # vitest --run
yarn coverage       # vitest --run --coverage
yarn start:dev      # nodemon + ts-node (reads .env via dotenv)
```

Run `yarn code-review` before every PR — CI runs the same checks.

## Architecture

```
src/
  index.ts       # Entry point: parse env config → create app → listen
  app.ts         # Express app factory createApp(config, logger) — all routes registered here
  applink.ts     # Pure domain logic: buildLink, appleAppSiteAssociation, assetLinks
  redirect.ts    # Store redirect: getUrlFromUserAgent(ua)(url, campaign)
  campaign.ts    # Parses UTM / Apple store campaign params from query string
  config.ts      # Zod schema + parseConfigFromEnvironment() — fails fast on invalid env
  logger.ts      # createLogger wrapping @pagopa/logger (JSON in prod, simple in dev)
  utils.ts       # stripUndefined<T> helper
  __test__/      # Vitest + Supertest integration tests (co-located under src/)
```

**Routing conventions**: the `feat` query param uses a Zod **discriminated union** (`"firma" | "idpay"`). New features must add a new union member and a corresponding exhaustive `switch` case — TypeScript enforces coverage.

## Conventions

### Imperative TypeScript (ADR #1)
See [apps/io-link/docs/adr/0001-use-imperative-programming.md](../apps/io-link/docs/adr/0001-use-imperative-programming.md).

- **No `fp-ts`, no `io-ts`, no monads** (`Either`, `Option`, `pipe`, `flow`). This is a deliberate team decision.
- Use **`zod`** for all runtime validation (config, query params, request bodies).
- Propagate errors via `throw` / `try-catch`. Use `async/await` throughout.
- `safeParse` + explicit `undefined` checks replace `Either` patterns.

### TypeScript
- `type` over `interface` (ESLint enforces).
- `Array<T>` over `T[]` (ESLint enforces).
- `strict: true` — no implicit `any`, no non-null assertions without justification.

### Testing
- Tests live in `src/__test__/`. File naming: `<module>.spec.ts`.
- Use **Supertest** against the `createApp(...)` factory — no real port binding.
- Inject test-specific `config` and a silent logger (`{ debug: vi.fn(), info: vi.fn(), ... }`).
- Use `/* c8 ignore start/end */` sparingly for unreachable error-branch exclusions only.

### Express App
- All routes are registered in `createApp` — no global module-level side effects.
- Security: Helmet is applied globally. CORS is restricted to `/qrcode.png` only.
- `crossOriginResourcePolicy: { policy: "cross-origin" }` is intentional (QR codes embedded cross-origin).

## Infrastructure

Terraform in `infra/` targets **Azure** (bootstrapper) and **GitHub** (repository config). State: Azure Blob Storage with `use_azuread_auth = true`. Do not edit infra without understanding the module versions pinned in each `main.tf`.
