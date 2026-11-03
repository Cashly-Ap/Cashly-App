# Contributing

Guidelines for working on the Cashly frontend.

---

## Setup

```bash
git clone git@gitlab.com:personal-proyect-gabriel/cashly/cashly-app.git
cd cashly-app
bun install
bun start
```

The dev server proxies `/api` and `/ws` to the backend. See [GETTING_STARTED.md](GETTING_STARTED.md) and [ENVIRONMENT.md](ENVIRONMENT.md).

---

## Before opening a merge request

```bash
bun run format:check
bun run test:run
bun run build
bun run e2e        # when routes, layout, or critical flows change
```

Fix formatting with `bun run format`.

---

## Code conventions

### Angular

- Angular 21, standalone components, no NgModules.
- `ChangeDetectionStrategy.OnPush` on components.
- Signals for local/derived state; RxJS for async flows.
- `inject()` for dependencies; no constructor parameter injection in new code.
- Modern control flow (`@if`, `@for`, `@defer`); no `*ngIf`/`*ngFor`.
- External templates (`templateUrl`) and Tailwind CSS; avoid inline templates and component styles.
- Lazy-load feature routes.
- Use the `@app`, `@core`, `@features`, `@shared`, and `@env` path aliases.

### Feature placement

- Put code under `src/app/features/<area>/<feature>/`.
- Keep business rules in `services/application`, HTTP in `services/api`, DTO mapping in `services/mappers`.
- Keep feature messages in `messages/` and translations in `i18n/`.
- Add permission constants in `permissions/` and declare routes with the owning `BusinessModule`.
- Reuse `shared/components/list`, `shared/components/details`, and `core/forms` before creating new UI.
- Do not put feature business logic in `core` or `shared`.

### Styling

- PrimeNG for components and Tailwind for layout/spacing.
- Use the Cashly design system: neutral base with semantic colors only for success, error, warning, and info.
- Do not hardcode user-facing text.

### Internationalization

Every user-facing string must exist in Spanish and English. See [I18N.md](I18N.md).

### Authorization

- Declare routes with `data.module` and use `modulePermissionGuard`.
- Guard buttons with the `appPermission` directive and row actions with explicit permission codes.
- Add cross-owner grants through `data.requiredPermissions`.
- See [authorization.md](modules/authorization.md).

---

## Tests

- Unit tests live beside the source file (`*.spec.ts`) using Vitest.
- Cover models, validators, mappers, API services, and application state.
- Use `HttpTestingController` for API tests; no live backend.
- Add Playwright coverage for new critical routes or workflows.
- See [TESTING.md](TESTING.md).

---

## Commits

Use conventional commit messages in English:

```text
feat(scope): add customer balance export
fix(inventory): neutralize composite stock details
refactor(shared): reuse the search field
docs: document the company module
chore(deps): remove the unused SSR setup
```

Guidelines:

- One logical change per commit.
- Keep the subject imperative and under ~72 characters.
- Explain the why in the body when it is not obvious.
- Do not commit `dist/`, `coverage/`, `node_modules/`, or local output.

---

## Merge requests

Include:

- What changed and why.
- Affected modules and routes.
- Screenshots for visible UI changes.
- Test and build results.
- Permission or i18n impacts.

Keep changes focused; split unrelated refactors into separate merge requests.

---

## Documentation

Update the affected module docs when changing routes, models, endpoints, validation, permissions, or business rules. Add new modules to [modules/README.md](modules/README.md) and use [modules/TEMPLATE.md](modules/TEMPLATE.md).

---

## Related documentation

- [Architecture](ARCHITECTURE.md)
- [Frontend infrastructure](FRONTEND_INFRASTRUCTURE.md)
- [Testing](TESTING.md)
- [Deployment](DEPLOYMENT.md)
