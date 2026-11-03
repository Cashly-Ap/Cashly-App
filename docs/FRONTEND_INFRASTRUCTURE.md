# Frontend Infrastructure (core and shared)

This guide describes the cross-cutting code that features build on. Feature-specific behavior lives in [modules](modules/README.md).

---

## Core (`src/app/core`)

`core` contains technical infrastructure without business ownership.

| Area            | Responsibility                                                                   |
| --------------- | -------------------------------------------------------------------------------- |
| `forms/`        | `BaseFormComponent`, form containers, cards, headers, inputs, dynamic lists      |
| `i18n/`         | Dictionaries, language service, translate/format pipes, translated titles/toasts |
| `layouts/`      | `MainLayoutComponent`, menu configuration, action dialog hosts                   |
| `navigation/`   | Navigation history, lookup registry, provider composition                        |
| `pdf-viewer/`   | Shared PDF viewer dialog and service                                             |
| `pending-tabs/` | Unsaved-changes tracking, guard, and dropdown                                    |
| `preferences/`  | User preferences and per-area chart/card appearance                              |
| `shortcuts/`    | Keyboard shortcut service, directives, navigator, and help dialog                |
| `theme/`        | Theme service and the PrimeNG `CashlyPreset`                                     |

### Forms

Feature form pages extend `BaseFormComponent` and compose the core form building blocks:

- `FormContainerComponent`, `FormHeaderComponent`, `FormActionsComponent`
- `TabContentComponent`, `SectionCardComponent`, `FieldGroupComponent`, `FormCardComponent`
- `TextInputComponent`, `NumberInputComponent`, `SelectInputComponent`, `CheckboxInputComponent`, `FileInputComponent`
- `ListSectionComponent`, `ListItemComponent`
- `FormMode` and message-action enums

```typescript
@Component({
  selector: 'app-customer-form-page',
  standalone: true,
  imports: [FormContainerComponent, FormHeaderComponent, FormActionsComponent],
  templateUrl: './customers-form-page.component.html',
})
export class CustomersFormPageComponent extends BaseFormComponent {
  // form controls, load/save orchestration
}
```

Form validation feedback and pending-changes handling are shared; feature pages keep their own business rules.

### Layout and dialogs

`MainLayoutComponent` is the persistent authenticated shell. It owns:

- Sidebar/menu and area navigation
- Notification bell
- Pending tabs
- Global dialog hosts for cancel, delete, action, report, PDF, invoice, receivables, cash-register, warehouse, and pending-payment flows

Feature pages must not wrap themselves in the layout and must not declare global dialog markup. They contribute handlers through the shared tokens described below.

### Pending tabs

`PendingTabsService` tracks labeled, unsaved tabs and exposes `pendingChangesGuard`.

```typescript
{
  path: ':id/edit',
  canDeactivate: [pendingChangesGuard],
  loadComponent: () => /* form page */,
}
```

Use it for forms that can lose unsaved changes. The dropdown in the layout lists dirty tabs and lets the user return to them.

### PDF viewer

`PdfViewerService` and `PdfViewerDialogComponent` display PDF blobs without leaving the app. Report and document actions use it via `PdfBlobViewerService` and the shared PDF action tokens.

### Preferences and theme

`UserPreferencesService` stores language, theme mode (`system`, `light`, `dark`), color mode (`minimal`, `informative`), shortcut enablement, and shortcut hints. Preferences are cached and synchronized with `GET/PUT /api/auth/preferences` when authenticated.

`ThemeService` toggles the `.my-app-dark` class; `module-appearance.ts` provides area colors and chart palettes. `CashlyPreset` configures PrimeNG.

### Shortcuts

`KeyboardShortcutService` respects `shortcutsEnabled`, ignores editable fields, and drives `ModuleNavigatorComponent`, `ShortcutHelpComponent`, and the `shortcut` directive. Shortcut definitions live in `shortcut-reference.ts`.

---

## Shared (`src/app/shared`)

`shared` contains reusable presentation, models, and services that are not tied to a single feature.

### Components

| Group                | Contents                                                                                                                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/list`    | `ListContainerComponent`, `ListActionButtonsComponent`, filters, navigation picker                                                                                                                                                  |
| `components/details` | `DetailActionsMenuComponent`, `DetailsCardHeaderComponent`, `DetailsInfoGridComponent`, `DetailsInfoFieldComponent`                                                                                                                 |
| `components/ui`      | Page header, panel/table cards, stat/metric cards, badges, empty state, spinner, paginator, search/filter fields, picker trigger, dialog header, skeletons, report PDF modal, image viewer, user avatar, back/cancel/submit buttons |
| `components/*`       | `cancel-dialog`, `delete-dialog`, `document-confirmation-dialog`, `document-stock-review`, `pdf-viewer-modal`                                                                                                                       |
| `ui/`                | Feature-level shared dialogs: invoice picker, note form                                                                                                                                                                             |

List and details pages should reuse these components instead of duplicating toolbar, table-card, field-grid, or action-menu markup.

### Services and tokens

Shared services coordinate actions that originate in lists but are rendered in the layout:

| Service                         | Purpose                                            |
| ------------------------------- | -------------------------------------------------- |
| `NavigationActionService`       | Executes registered row/toolbar navigation actions |
| `DirectNavigationActionService` | Direct navigation action execution                 |
| `ActionDialogService`           | Opens a registered component in a global dialog    |
| `CancelDialogService`           | Opens the shared cancel dialog with a reason       |
| `DeleteDialogService`           | Opens the shared delete dialog                     |
| `ReportActionService`           | Opens registered report dialogs                    |
| `PdfActionService`              | Opens registered PDF actions                       |
| `PdfBlobViewerService`          | Shows a PDF blob in the shared viewer              |
| `LookupDefinitionRegistry`      | Resolves list lookup definitions by route          |

Features register handlers through injection tokens in `src/app/shared/services/*.token.ts`; the providers are composed in `src/app/core/navigation/providers/`. Unknown actions return `false` and fail closed.

### Models, pipes, and utilities

- `models/`: `PagedResponse`, `DocumentListAction`, list-action presets, status variants, document confirmation models.
- `pipes/`: date formatting helpers.
- `utils/`: date normalization, document stock calculations, file download, navigation lookup, UUID helpers.

---

## Composition rules

1. Business behavior stays in the feature; `core` and `shared` stay generic.
2. Reuse list/details/form building blocks before creating new UI.
3. Register global dialogs and actions through tokens instead of importing feature components into the layout.
4. Keep messages in feature `messages/` and translations in `i18n/` files.
5. Do not add business areas to `core` or `shared`.

---

## Related documentation

- [Architecture](ARCHITECTURE.md)
- [i18n guide](I18N.md)
- [Module index](modules/README.md)
- [Testing](TESTING.md)
