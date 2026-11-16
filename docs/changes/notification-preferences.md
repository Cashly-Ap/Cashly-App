# Notification preferences

## API contract

Base path: `/api/notifications/preferences`.

| Method | Path                             | Purpose                                                |
| ------ | -------------------------------- | ------------------------------------------------------ |
| GET    | `/api/notifications/preferences` | Load the authenticated user's notification preferences |
| PUT    | `/api/notifications/preferences` | Replace the user's notification preferences            |

`GET` and `PUT` share the same response shape:

```json
{
  "enabled": true,
  "modules": [
    {
      "module": "SALES_QUOTES",
      "labelKey": "navigation.labels.quotes",
      "enabled": true
    }
  ]
}
```

`PUT` accepts:

```json
{
  "enabled": false,
  "modules": [{ "module": "SALES_QUOTES", "enabled": true }]
}
```

The backend owns the list of eligible modules. It only includes modules where the
authenticated user can write. The frontend renders exactly what it receives and
translates `labelKey` through the i18n catalog.

## Behavior

- `enabled` is the master switch.
- Each eligible module has its own switch.
- Disabling the master hides the bell but keeps each module value.
- The bell is rendered only when `enabled` is true and at least one module is enabled.
- The WebSocket connects only while the bell is visible.
- Preferences live in the backend, never in localStorage.
- The UI updates optimistically and rolls back if the PUT fails.

## Frontend map

- `models/notification-preferences.model.ts`
- `services/api/notification-preferences-api.service.ts`
- `services/state/notification-preferences.service.ts`
- `components/notification-preferences-card/*`
- `core/layouts/main-layout.component.html` renders the bell conditionally.
- `notification-bell.component.ts` connects the WebSocket only when visible.
- `notification-destination.resolver.ts` resolves every reference type with
  collection, permission and dashboard fallbacks.
