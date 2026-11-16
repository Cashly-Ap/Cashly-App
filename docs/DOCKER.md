# Docker Guide

This guide covers the Docker images and Compose profiles used by the Cashly frontend.

## Overview

| File               | Purpose                                                         | Base image       |
| ------------------ | --------------------------------------------------------------- | ---------------- |
| `Dockerfile`       | Multi-stage production build served with `serve` on port `8080` | `node:22-alpine` |
| `Dockerfile.dev`   | Dev server with hot reload and backend readiness wait           | `node:22-alpine` |
| `Dockerfile.test`  | Vitest runner                                                   | `node:22-alpine` |
| `Dockerfile.local` | Lightweight local dev server                                    | `node:22-alpine` |

All images install Bun `1.3.3` and use `bun install --frozen-lockfile`.

## Production image (`Dockerfile`)

Two stages:

1. **builder** — installs dependencies, copies the source, runs `bun run build`. Output: `dist/cashly-app/browser`.
2. **runner** — installs `serve`, copies the build output to `dist`, exposes `8080`, and runs:

```bash
serve -s dist -l ${PORT:-8080} -n
```

Build and run:

```bash
docker build -t cashly-app:prod .

docker run --rm -p 8080:8080 \
  -e PORT=8080 \
  cashly-app:prod
```

The production build uses `src/environments/environment.prod.ts`. The API URL is compiled in; changing it requires rebuilding the image.

## Development image (`Dockerfile.dev`)

- Runs `ng serve --host 0.0.0.0 --poll 2000` on port `4200`.
- `wait-for-backend.sh` polls `${BACKEND_URL}/actuator/health` before starting.
- Intended for the `dev` Compose profile.

```bash
docker compose --profile dev up --build
```

Open `http://localhost:4200`.

## Test image (`Dockerfile.test`)

- Sets `NODE_ENV=test`.
- Adds a healthcheck (`bun --version`).
- Default command: `bun test:run`.

```bash
docker compose --profile test run --rm cashly-app-test
```

## Compose profiles

`docker-compose.yml` defines three services selected through `COMPOSE_PROFILES` (see `.env`):

| Profile | Service           | Port | Notes                                                        |
| ------- | ----------------- | ---- | ------------------------------------------------------------ |
| `dev`   | `cashly-app-dev`  | 4200 | Mounts the repository; waits for the backend health endpoint |
| `prod`  | `cashly-app-prod` | 4200 | Production image, no volume mounts                           |
| `test`  | `cashly-app-test` | —    | Runs the Vitest suite once                                   |

All services attach to the external network `cashly-api_cashly-network`, which must exist (normally created by the `cashly-api` Compose stack).

```bash
# Development
docker compose --profile dev up --build

# Production-like
docker compose --profile prod up --build

# Tests
docker compose --profile test up --build
```

## Backend connectivity

- Dev server proxies `/api` and `/ws` to `http://cashly-api-app:8080` through `proxy.conf.js`.
- The backend container must be reachable on `cashly-api_cashly-network`.
- If the backend runs on the host instead, change the proxy target to `http://host.docker.internal:8080` (Docker Desktop) or `http://localhost:8080` for a non-container dev server.

## Troubleshooting

| Symptom                              | Check                                                             |
| ------------------------------------ | ----------------------------------------------------------------- |
| `cashly-api-app` does not resolve    | Start the backend stack first; verify the external network name.  |
| Dev server starts but API calls fail | Check the `proxy.conf.js` target and that the backend is healthy. |
| Production container returns 404     | Confirm the build output exists at `dist/cashly-app/browser`.     |
| Port already in use                  | Change the host side of the Compose port mapping.                 |

---

[← Environment](ENVIRONMENT.md) | [Next: Deployment →](DEPLOYMENT.md)
