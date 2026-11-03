# Getting Started

This guide helps you run the Cashly frontend on your machine.

## Prerequisites

- **Node.js** 22 or higher
- **Bun** 1.3.3 or higher (the package manager used by the project)
- **Docker** and Docker Compose (optional, for the container workflow)
- **Git**

```bash
node --version   # v22+
bun --version    # v1.3+
docker --version
```

## Installation

### Option 1: Local development

```bash
git clone git@gitlab.com:personal-proyect-gabriel/cashly/cashly-app.git
cd cashly-app

bun install
bun start
```

Open `http://localhost:4200`.

The dev server proxies `/api` and `/ws` through `proxy.conf.js`. Point it at your running backend (`cashly-api`) before using authenticated screens. See [ENVIRONMENT.md](ENVIRONMENT.md).

### Option 2: Docker development

The Compose development service waits for the backend health endpoint before starting:

```bash
docker compose --profile dev up --build
```

Open `http://localhost:4200`. The backend must be reachable as `cashly-api-app:8080` on the external `cashly-api_cashly-network` network.

## Project structure

```
cashly-app/
├── src/
│   ├── app/
│   │   ├── core/                # Layout, forms, PDF viewer, pending tabs, error handling
│   │   ├── shared/              # Reusable components, directives, models, pipes, utilities
│   │   ├── features/            # Features grouped by business area
│   │   │   ├── analytics/       # dashboard, reporting composition
│   │   │   ├── catalog/         # products, categories, price-types
│   │   │   ├── finance/         # billing and treasury features
│   │   │   ├── inventory/       # warehouses
│   │   │   ├── partners/        # customers, suppliers
│   │   │   ├── platform/        # auth, company, notifications
│   │   │   ├── procurement/     # purchases
│   │   │   └── sales/           # quotes, orders
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   └── app.ts
│   ├── environments/            # environment.ts / environment.prod.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── docs/
├── e2e/                         # Playwright suites
├── public/
├── scripts/                     # railway-deploy.sh
├── angular.json
├── proxy.conf.js                # /api and /ws proxy
├── vitest.config.mts
├── playwright.config.ts
├── Dockerfile / Dockerfile.dev / Dockerfile.test
└── docker-compose.yml
```

## Available scripts

```bash
bun start              # Development server
bun run build          # Production build (dist/cashly-app/browser)
bun run test:run       # Vitest once
bun run test:watch     # Vitest in watch mode
bun run test:coverage  # Coverage report
bun run e2e            # Playwright
bun run e2e:ui         # Playwright UI mode
bun run format         # Prettier write
bun run format:check   # Prettier check
```

## IDE setup

Recommended VS Code extensions: Angular Language Service, Prettier, Docker, GitLens.

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Troubleshooting

### Port already in use

```bash
lsof -i :4200
kill -9 <PID>
# or
bun x ng serve --port 4300
```

### Dependency issues

```bash
rm -rf node_modules dist
bun install --frozen-lockfile
```

### Docker

```bash
docker compose down
docker compose --profile dev up --build
```

If API calls fail, verify the backend container is running and that the external `cashly-api_cashly-network` network exists.

## Next steps

- [Architecture](ARCHITECTURE.md)
- [Modules](modules/README.md)
- [Environment configuration](ENVIRONMENT.md)
- [Docker](DOCKER.md)
- [Testing](TESTING.md)
- [Deployment](DEPLOYMENT.md)
