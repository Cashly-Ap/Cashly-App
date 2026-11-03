# Navigation refactor plan

## Goal

Remove module and feature coupling from the navbar lookup flow.

`core/layouts/services/navigation-lookup.service.ts` must become a small orchestrator.
It should not know about specific actions, modules, filters, data sources or record routes.

## Current state

Already delegated to module-owned registries:

- Delete
- Cancel
- PDF
- Confirm
- Convert
- Receivables
- Invoices
- Warehouses
- Pending payments
- Cash register

Remaining coupling:

- `lookupFilterDefaults` / `lookupFilterDefinitions`
- `loadNavigationLookup`
- `CategoryApiService` / `AccessManagementService` filter sources
- `LIST_NAVIGATION_DEFINITIONS`
- `RECORD_PATH_SEGMENTS`
- `if (label === 'Eliminar' | 'Cancelar' | 'Descargar PDF')`
- Lookup session state inside the service

## Target architecture

```
core/navigation/
├── contracts/
│   ├── lookup-definition.ts
│   ├── navigation-action-handler.ts
│   └── record-navigation.ts
├── services/
│   ├── navigation-lookup.service.ts
│   ├── lookup-session.service.ts
│   ├── action-dispatcher.service.ts
│   └── record-navigation.service.ts
├── providers/
│   └── provide-navigation.ts
└── tokens/
    └── ...
```

`NavigationLookupService` should only:

1. Resolve the lookup definition.
2. Check permissions.
3. Try direct actions.
4. Open the lookup session.
5. Delegate record selection to the action dispatcher.

## Phase A - Extract lookup session state

Create `LookupSessionService`.

Move out of `NavigationLookupService`:

- items
- loading
- total
- first
- rows
- filterValues
- filterSources
- filters
- search
- pagination
- session registration
- data loading

Acceptance criteria:

- `NavigationLookupService` no longer creates lookup signals.
- `NavigationLookupService` no longer builds filters or pagination.
- Behavior and tests remain unchanged.

## Phase B - Extract action dispatcher

Create `ActionDispatcherService`.

Move out of `NavigationLookupService`:

- `if (label === 'Eliminar')`
- `if (label === 'Cancelar')`
- `if (label === 'Descargar PDF')`
- `RECORD_PATH_SEGMENTS`
- record action dispatch chain

The dispatcher tries handlers in order:

1. direct actions
2. delete handlers
3. cancel handlers
4. PDF handlers
5. action dialog handlers
6. navigation action handlers
7. record navigation
8. fallback warning

Acceptance criteria:

- `NavigationLookupService` does not import action services.
- `NavigationLookupService` does not contain action labels.

## Phase C - Module-owned lookup definitions

Create one `LookupDefinition` per module.

Move:

- `loadNavigationLookup` switch cases
- filters
- filter option sources
- record routes

Target file:

```
features/<module>/navigation/<module>.lookup.ts
```

Acceptance criteria:

- `lookupFilterDefaults` and `lookupFilterDefinitions` are no longer used by core.
- `list-navigation-data-source.ts` is removed or reduced to a registry.
- `CategoryApiService` and `AccessManagementService` are not imported by core.

## Phase D - Module-owned navbar definitions

Move `LIST_NAVIGATION_DEFINITIONS` entries to each module:

```
features/<module>/navigation/<module>.list-navigation.ts
```

Create:

- `LOOKUP_DEFINITION_PROVIDERS`
- `LIST_NAVIGATION_PROVIDERS`

Acceptance criteria:

- Core only aggregates definitions.
- Adding a module does not require editing `list-navigation.config.ts`.

## Phase E - Clean app.config

Create:

```
core/navigation/providers/provide-navigation.ts
```

It aggregates:

- delete handlers
- cancel handlers
- PDF handlers
- action dialog handlers
- navigation action handlers
- direct navigation action handlers
- lookup definitions
- list navigation definitions

`app.config.ts` should only call `provideNavigation()`.

Acceptance criteria:

- `app.config.ts` does not list feature providers.
- `provideNavigation()` is the single registration point.

## Phase F - Clean main layout

Move report PDF services and dialog hosts out of `main-layout`.

Keep only:

- navbar
- user menu
- `<app-action-dialog-host />`
- `<app-delete-dialog />`
- `<app-cancel-dialog />`

Acceptance criteria:

- `main-layout.component.ts` does not import report services.
- `main-layout.component.ts` does not import feature dialog hosts.

## Rules

- No module-specific imports in core.
- Core only knows contracts, tokens and registries.
- Each module owns its lookup, actions, filters and routes.
- No fallback navigation to the list with `navAction` / `navSearch`.
- Run `npx tsc -p tsconfig.app.json --noEmit` after each phase.
- Keep existing tests green.
