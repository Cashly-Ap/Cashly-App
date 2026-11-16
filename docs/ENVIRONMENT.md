# Environment Configuration

This document describes how the Cashly frontend is configured for local development, Docker, tests, and production.

## Overview

Cashly is a static Angular SPA. It does not read backend credentials, database settings, or object-storage secrets. Runtime configuration is limited to:

- The API base URL compiled into the app.
- The development-server proxy used for `/api` and `/ws`.
- A small set of Docker/runtime variables (`PORT`, `BACKEND_URL`, `NODE_ENV`).

## Application environments

Configuration lives in `src/environments/` and is selected at build time through Angular file replacements.

### Development — `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: '/api',
};
```

Requests go to the same origin and are forwarded by the Angular dev server.

### Production — `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://cashly-api-production.up.railway.app/api',
};
```

`angular.json` replaces `environment.ts` with `environment.prod.ts` for the production configuration. To target a different backend, change `environment.prod.ts` and rebuild — there is no runtime environment injection.

## Development proxy

`angular.json` uses `proxy.conf.js` for `ng serve`:

```javascript
const PROXY_CONFIG = {
  '/api': {
    target: 'http://cashly-api-app:8080',
    secure: false,
    changeOrigin: true,
  },
  '/ws': {
    target: 'ws://cashly-api-app:8080',
    ws: true,
    secure: false,
    changeOrigin: true,
  },
};
```

- Inside Docker Compose, `cashly-api-app` is resolvable on the external `cashly-api_cashly-network` network.
- For a backend running directly on the host, use `proxy.conf.json` (target `http://localhost:8080`) or point `target` in `proxy.conf.js` to `http://localhost:8080`.

## Docker Compose variables

`.env` / `.env.example` only select the Compose profile:

```bash
COMPOSE_PROFILES=dev   # dev | prod | test
```

The development service additionally receives:

| Variable         | Default                      | Purpose                                  |
| ---------------- | ---------------------------- | ---------------------------------------- |
| `NODE_ENV`       | `development`                | Angular/Node mode                        |
| `BACKEND_URL`    | `http://cashly-api-app:8080` | Health-check base used by the entrypoint |
| `MAX_RETRIES`    | `60`                         | Backend readiness attempts               |
| `RETRY_INTERVAL` | `5`                          | Seconds between readiness attempts       |

## Runtime variables

### `PORT`

- **Used by**: production `Dockerfile`.
- **Default**: `8080`.
- **Purpose**: Port used by the static file server (`serve`).

### `BACKEND_URL`

- **Used by**: `wait-for-backend.sh` in the development image.
- **Purpose**: Polls `${BACKEND_URL}/actuator/health` until the backend reports `UP`. The frontend starts anyway after the retry budget is exhausted.

### `CI`

- **Used by**: Playwright and test tooling.
- **Purpose**: Switches reporters, retries, and worker count for CI runs.

## Tests

- Vitest reads `vitest.config.mts`; no environment variables are required.
- Playwright starts the dev server on `http://127.0.0.1:4300` with `CI=true` (see `playwright.config.ts`).
- API calls in unit tests are mocked; no live backend is needed.

## What is not configurable here

There is no frontend configuration for databases, S3 buckets, JWT signing keys, or SMTP. Those belong to the backend service (`cashly-api`) and must never be added to this repository.

---

[← Back to Architecture](ARCHITECTURE.md) | [Next: Docker →](DOCKER.md)
