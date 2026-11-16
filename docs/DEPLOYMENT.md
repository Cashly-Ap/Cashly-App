# Deployment Guide

This guide covers how the Cashly frontend is built and deployed.

## Overview

| Concern        | Setup                                                        |
| -------------- | ------------------------------------------------------------ |
| Repository     | GitLab                                                       |
| CI/CD          | GitLab CI (`.gitlab-ci.yml`)                                 |
| Hosting        | Railway (service `cashly-app`)                               |
| Artifact       | Static Angular build served by `serve` inside a Docker image |
| Production URL | `https://cashly-app-production.up.railway.app`               |
| Build tool     | Bun `1.3.3` + Angular CLI                                    |

Railway deploys from the repository using `railway.json` and the root `Dockerfile`.

## Pipeline

`.gitlab-ci.yml` defines three stages:

```text
build → package → deploy
```

| Job              | Stage   | Trigger                                 | What it does                                                               |
| ---------------- | ------- | --------------------------------------- | -------------------------------------------------------------------------- |
| `build:angular`  | build   | `main`, tags, merge requests, `develop` | `bun install --frozen-lockfile` then `ng build --configuration production` |
| `package:docker` | package | `main`, tags                            | Builds and pushes `Dockerfile` to the GitLab registry                      |
| `deploy:railway` | deploy  | `main`, tags (manual)                   | Runs `scripts/railway-deploy.sh`                                           |

### Required CI/CD variables

| Variable               | Purpose                                 |
| ---------------------- | --------------------------------------- |
| `CI_REGISTRY_USER`     | GitLab registry user                    |
| `CI_REGISTRY_PASSWORD` | GitLab registry token                   |
| `RAILWAY_API_TOKEN`    | Railway token used by the deploy script |
| `RAILWAY_PROJECT_ID`   | Railway project that owns the service   |

`RAILWAY_SERVICE` is defined in the pipeline as `cashly-app`.

## Deploy script

`scripts/railway-deploy.sh` removes `dist/`, `.git/`, and `node_modules/` from the build context and runs:

```bash
railway up \
  --service "$RAILWAY_SERVICE" \
  --project "$RAILWAY_PROJECT_ID" \
  --environment production \
  --ci
```

The script exits with Railway's exit code, so pipeline failures surface correctly.

## Manual deployment

```bash
railway login
railway link            # select the Cashly project
railway up --service cashly-app --environment production
```

Or trigger the manual `deploy:railway` job from the GitLab pipeline of `main`.

## Build verification before deploying

```bash
bun install --frozen-lockfile
bun run test:run
bun run build
bun run format:check
```

The production build output is `dist/cashly-app/browser`.

## Runtime configuration

- `Dockerfile` serves the build on `0.0.0.0:8080` and respects `PORT`.
- The API URL is compiled from `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://cashly-api-production.up.railway.app/api',
};
```

Changing the backend URL requires a new image and a redeploy. See [ENVIRONMENT.md](ENVIRONMENT.md) for details.

## Rollback

Railway keeps previous deployments. Roll back from the Railway dashboard (**Deployments → Redeploy** an earlier build) or with the CLI:

```bash
railway deployments
railway redeploy --service cashly-app
```

## Health and logs

- Container: `serve` serves the SPA; unknown routes fall back to `index.html`.
- Logs: Railway service logs in the dashboard, or `railway logs --service cashly-app`.
- The production container listens on `8080`; make sure the Railway service targets that port.

---

[← Docker](DOCKER.md) | [Back to Architecture](ARCHITECTURE.md)
