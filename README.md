# Parsun App

Parsun App is the private Angular single-page application for internal business operations. It provides the back-office interface for managing customers, catalog data, inventory, sales, billing, payments, purchasing, cash registers, reports, and user access. The repository exists to implement the operational UI and consume the contracts exposed by `parsun-api`.

## Scope and modules

| Area | Responsibility |
| --- | --- |
| Authentication and users | Login, session handling, user administration, roles, and permissions. |
| Dashboard | Operational summaries, indicators, and low-stock visibility. |
| Customers and merchants | Customer records, contacts, merchants, and commercial history. |
| Catalog | Categories, products, price types, and differential pricing. |
| Inventory | Warehouses, stock movements, transfers, and availability. |
| Sales | Quotes, orders, invoices, returns, credit notes, and debit notes. |
| Payments and collections | Payment methods, receivables, payables, collections, and payment validation. |
| Purchasing | Suppliers and purchase workflows. |
| Cash register | Cash-register sessions, movements, opening, closing, and history. |
| Reports and notifications | Operational reports and user notifications. |

The module index and implementation references are in [docs/modules/README.md](docs/modules/README.md).

## Frontend architecture

- Angular standalone components with lazy-loaded feature routes.
- Feature boundaries under `src/app/features`.
- Shared presentation components, utilities, and design primitives under `src/app/shared`.
- Cross-cutting services, guards, interceptors, and configuration under `src/app/core`.
- Signals for local and derived UI state, with RxJS for asynchronous API flows.
- `ChangeDetectionStrategy.OnPush`, external templates, and Angular's modern control-flow syntax.
- PrimeNG components and Tailwind CSS utilities for the visual layer.

## Runtime stack

| Concern | Technology |
| --- | --- |
| Framework | Angular 21 with standalone components |
| Language | TypeScript 5.9 in strict mode |
| UI | PrimeNG 21, PrimeIcons, Tailwind CSS 4 |
| State and async flows | Angular Signals and RxJS |
| Charts | Chart.js and ng2-charts |
| Package manager | Bun 1.3.3 |
| Testing | Vitest with jsdom |
| Runtime | Docker Compose or Angular CLI |

## Local runtime

Prerequisites: Bun and, for the container workflow, Docker with Compose.

```bash
bun install
bun start
```

The development server is available at `http://localhost:4200`.

The equivalent Docker profile is:

```bash
docker compose --profile dev up --build
```

Configuration and backend connectivity are described in [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md), [docs/DOCKER.md](docs/DOCKER.md), and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Verification

```bash
bun run test:run
bun run build
bun run format:check
bun run e2e
```

See [docs/TESTING.md](docs/TESTING.md) for the repository test strategy and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for implementation conventions.
