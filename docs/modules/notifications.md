# Notifications Module

## Overview

The Notifications module provides the notification bell rendered in the main layout. It keeps the unread count, opens a popover panel, receives real-time notifications over WebSocket/STOMP, and navigates to the referenced entity.

**Module Type**: `Display-only` (shell component, no route)

---

## Module Structure

```
src/app/features/platform/notifications/
├── components/
│   ├── notification-bell/    # Bell, unread badge, and popover panel
│   └── notification-preferences-card/ # Notification preference controls
├── i18n/                     # Translations
└── services/
    ├── api/                  # Notification HTTP service
    ├── navigation/           # Destination resolver
    └── websocket/            # STOMP WebSocket service
```

---

## Integration

- `NotificationBellComponent` is rendered by `MainLayoutComponent`; there is no `/notifications` page or route.
- The bell connects to the STOMP topic `/topic/notifications/user/{userId}` on startup.
- Opening the panel loads the unread list lazily on first use.
- Clicking a notification resolves the destination from `referenceType`/`referenceId` and routes to the owning module.

---

## Features

- Unread count badge
- Popover panel with the latest unread notifications
- Real-time updates through WebSocket/STOMP
- Mark one notification as read
- Mark all as read
- Relative timestamps (`Ahora`, `30s`, `5m`, `2h`, `3d`)
- Navigation to payment, quote, and order references
- Notification preference filters by main module and submodule

---

## Data Models

```typescript
export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
  isRead: boolean;
  readAt: string | null;
}

export interface UnreadCount {
  count: number;
}
```

---

## API Endpoints

Base URL: `/api/notifications`

Notification preference responses use this exact structure:

```typescript
export interface NotificationModulePreference {
  module: string;
  labelKey: string;
  enabled: boolean;
}

export interface NotificationPreferences {
  enabled: boolean;
  modules: NotificationModulePreference[];
}
```

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/notifications/preferences` | Load preferences and eligible writable modules |
| PUT | `/api/notifications/preferences` | Save the complete preference state |

| Method | Endpoint                          | Description                            |
| ------ | --------------------------------- | -------------------------------------- |
| GET    | `/api/notifications?unread=true`  | List notifications (optionally unread) |
| GET    | `/api/notifications/unread-count` | Unread count                           |
| PUT    | `/api/notifications/:id/read`     | Mark one as read                       |
| PUT    | `/api/notifications/read-all`     | Mark all as read                       |

The list endpoint accepts an `unread` query parameter. The notification preferences configuration exposes a popover filter for the main module and submodule. The bell popover remains focused on reading and navigating notifications.

---

## Business Rules

1. Notifications are read-only from the UI except for read state.
2. The WebSocket connection is established when the bell initializes and is torn down with the layout.
3. Clicking a notification marks it as read and navigates to the owning module.
4. Unknown reference types fall back to a generic destination label.
5. The bell is visible to authenticated users inside the main layout only.

---

## Related Modules

- [Auth](./auth.md) - Authenticated user and session
- [Architecture](../ARCHITECTURE.md) - Main layout and shell
