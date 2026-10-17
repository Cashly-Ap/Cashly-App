# ERP area navigation

## Intent and scope

Expose the existing ERP business areas in both application navigation and browser URLs. Source ownership, menu placement and browser destinations should agree. Backend HTTP endpoints and business permission identifiers retain their existing contracts.

## Canonical destinations

| Menu area | Browser routes |
| --- | --- |
| Ventas | `/sales/quotes`, `/sales/orders` |
| Compras | `/procurement/purchases` |
| Catálogo | `/catalog/products`, `/catalog/categories`, `/catalog/price-types` |
| Inventario | `/inventory/warehouses` |
| Finanzas / Facturación | `/finance/billing/invoices`, `/finance/billing/returns`, `/finance/billing/credit-notes`, `/finance/billing/debit-notes` |
| Finanzas / Tesorería | `/finance/treasury/cash-register`, `/finance/treasury/receivables`, `/finance/treasury/payment-methods` |
| Contactos | `/partners/customers`, `/partners/suppliers` |
| Análisis | `/analytics/dashboard`, `/analytics/reports/inventory` |
| Plataforma | `/platform/users`, `/platform/auth/login`, `/platform/auth/configuration`, `/platform/auth/change-password`, `/platform/auth/change-username` |

Reports that open dialogs stay with their owning area. The inventory analysis page remains composed by analytics. Returns stay under invoice billing.

## Behavior requirements

- Given an authorized user, when they follow a desktop or mobile menu destination, then its canonical URL opens the corresponding feature.
- Given an old bookmarked feature URL, when navigation starts, then its canonical destination preserves child segments, query parameters and fragment.
- Given a user without a destination's existing business permission, when they use either an old or canonical URL, then the existing authorization policy denies access.
- Given a signed-in user, when they visit the application root, then navigation selects a permitted destination without a redirect loop.
- Given a signed-out user, when they open a protected destination, then authentication is required.
- Given a report dialog entry, when its menu is filtered, then both its owner permission and the existing report permission apply.
- Given a document, notification, pending tab or back link, when it opens another feature, then it uses the canonical browser destination.

## Implementation and validation plan

1. Group lazy feature routes under their ERP areas; retain legacy URL aliases.
2. Reorganize the shared desktop/mobile menu and preserve permission filtering.
3. Update navigation commands, templates, authentication redirects and notification destinations without changing API URLs.
4. Update unit and browser tests, including legacy deep links and permissions.
5. Run the frontend unit suite, production build and mocked browser suite in Docker.

The previous source-reorganization verification remains historical evidence for that change. Navigation verification belongs to this subsequent change.

## Design details

`app.routes.ts` composes lazy routes beneath each area. Legacy aliases run before the canonical route tree and return a `UrlTree`, retaining child identifiers, matrix parameters, repeated query parameters and fragments.

`platform/auth/routing/authorized-destination.ts` selects an accessible page for application and area entry points. Account configuration is the fallback when no business module is available. Moving an invoice screen beneath finance does not rename its existing sales permission.

After login, and on application root entry, the dashboard is the preferred destination when its permission is available. Users without dashboard access retain an authorized fallback, and explicit area entry points still prefer their own area.

Dashboard landing follow-up verification: all 36 affected unit tests and all four browser authentication scenarios passed; the production build passed.

`core/layouts/config/menu.config.ts` supplies both desktop and mobile navigation. Report entries retain the existing report permission in addition to their owner's permission. Consolidated inventory analysis checks both inventory and report permissions on direct navigation as well.

## Visual inspection

The desktop capture at 1280 pixels shows all eight area labels within the header. The mobile drawer at 390 pixels keeps the area list scrollable above account actions. Browser scenarios exercise every page destination in both menus, report dialogs, legacy bookmarks and restricted users against mocked API responses.

Screenshots are generated under `output/playwright/area-navigation/`. Raw test and build logs are retained inside the development container under `/tmp/cashly-area-routes-evidence/`.

## Verification results

- Frontend unit suite: 2,567 tests across 261 files passed, with no skipped tests or unhandled errors in the final run.
- TypeScript application compilation passed.
- Production build passed. The existing `@stomp/stompjs` CommonJS optimization warning remains.
- Development server rebuilt successfully with the canonical navigation.
- Browser coverage: the full 125-scenario run passed 124 scenarios and exposed one mobile test clicking during submenu animation. The test helper now waits for animations, scrolls the target into view and clicks its label. The complete affected navigation suite then passed all 76 scenarios, including all 21 desktop and 21 mobile destinations, report dialogs, aliases, area roots and permission cases. Production code did not change for this test synchronization fix.
