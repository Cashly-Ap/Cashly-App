# Notifications Module

## Overview

The Notifications module manages **in-app notifications** for different user roles in the invoicing system. Notifications are triggered automatically by system events and provide real-time awareness of important business activities. This is a display-only module with read/delete operations.

**Module Type**: `Display-only (Notifications)`

---

## Module Structure

```
src/app/features/notifications/
├── components/
│   ├── notification-bell/
│   │   ├── notification-bell.component.ts
│   │   ├── notification-bell.component.html
│   │   └── notification-bell.component.spec.ts
│   ├── notification-list-panel/
│   │   ├── notification-list-panel.component.ts
│   │   ├── notification-list-panel.component.html
│   │   └── notification-list-panel.component.spec.ts
│   ├── notification-item/
│   │   ├── notification-item.component.ts
│   │   ├── notification-item.component.html
│   │   └── notification-item.component.spec.ts
│   └── index.ts
├── models/
│   ├── interfaces/
│   │   ├── notification-list.interface.ts
│   │   ├── notification-detail.interface.ts
│   │   ├── unread-count.interface.ts
│   │   └── index.ts
│   ├── enums/
│   │   ├── notification-type.enum.ts
│   │   ├── reference-type.enum.ts
│   │   └── index.ts
│   └── index.ts
├── pages/
│   ├── notifications-page/
│   │   ├── notifications-page.component.ts
│   │   ├── notifications-page.component.html
│   │   └── notifications-page.component.spec.ts
│   └── index.ts
├── services/
│   ├── api/
│   │   ├── notifications-api.service.ts
│   │   ├── notifications-api.service.spec.ts
│   │   └── index.ts
│   ├── application/
│   │   ├── notifications-application.service.ts
│   │   ├── notifications-application.service.spec.ts
│   │   └── index.ts
│   └── index.ts
├── messages/
│   ├── notifications.messages.ts
│   └── index.ts
├── router/
│   ├── notifications.routes.ts
│   └── index.ts
└── index.ts
```

---

## Features

- View all notifications for authenticated user
- Unread notifications count badge
- Mark single notification as read
- Mark all notifications as read
- Delete notifications
- Filter by read/unread status
- Filter by notification type
- Navigate to related entity from notification
- Automatic polling for new notifications

---

## Pages

### Notifications Page

**Route**: `/notifications`

**Component**: `NotificationsPageComponent`

**Purpose**: Displays all notifications for the authenticated user with filtering options.

**Features**:

- PrimeNG DataTable with notifications
- Filter by read/unread status
- Filter by notification type
- Mark as read on click
- Mark all as read button
- Delete notification action
- Navigate to related entity
- Empty state for no notifications

---

## Components

### Notification Bell (Header Component)

**Location**: Usually in the main layout header

**Purpose**: Shows unread count badge and opens notification panel.

**Features**:

- Bell icon with unread count badge
- Click to open notifications panel
- Polls for unread count periodically
- Highlights when new notifications arrive

### Notification List Panel

**Purpose**: Overlay panel showing recent notifications.

**Features**:

- Shows last 10 notifications
- Quick actions (mark as read, delete)
- "View all" link to full page
- "Mark all as read" action
- Click to navigate to related entity

### Notification Item

**Purpose**: Individual notification display.

**Features**:

- Icon based on notification type
- Title and message display
- Time ago format (e.g., "2 hours ago")
- Read/unread visual indicator
- Click to mark as read and navigate

---

## Data Models

### Interfaces

#### NotificationList

**Usage**: Notifications table and panel (GET /api/notifications)

**Purpose**: Notification data for list display.

```typescript
export interface NotificationList {
  id: string; // UUID identifier
  type: NotificationType; // Notification type
  title: string; // Short title
  message: string; // Notification message
  referenceId: string | null; // Related entity UUID
  referenceType: ReferenceType | null; // Related entity type
  read: boolean; // Read status
  createdAt: string; // ISO timestamp
}
```

**API Mapping**: Maps directly from `NotificationListResponse`

---

#### NotificationDetail

**Usage**: Notification detail view (GET /api/notifications/:id)

**Purpose**: Complete notification information including read timestamp.

```typescript
export interface NotificationDetail {
  id: string; // UUID identifier
  type: NotificationType; // Notification type
  title: string; // Short title
  message: string; // Notification message
  referenceId: string | null; // Related entity UUID
  referenceType: ReferenceType | null; // Related entity type
  read: boolean; // Read status
  readAt: string | null; // ISO timestamp when read
  createdAt: string; // ISO timestamp
}
```

**API Mapping**: Maps from `NotificationDetailResponse`

---

#### UnreadCount

**Usage**: Notification bell badge (GET /api/notifications/unread-count)

**Purpose**: Count of unread notifications for badge display.

```typescript
export interface UnreadCount {
  unreadCount: number; // Count of unread notifications
}
```

**API Mapping**: Maps from `UnreadCountResponse`

---

#### MarkAllAsReadResult

**Usage**: Response from mark all as read operation

**Purpose**: Result of marking all notifications as read.

```typescript
export interface MarkAllAsReadResult {
  markedAsRead: number; // Count of notifications marked
  timestamp: string; // ISO timestamp of operation
}
```

---

### Enums

#### NotificationType

```typescript
export enum NotificationType {
  ORDER_CREATED = 'ORDER_CREATED', // MERCHANT created a new order
  INVOICE_CREATED = 'INVOICE_CREATED', // Order converted to invoice
  INVOICE_READY_FOR_DELIVERY = 'INVOICE_READY_FOR_DELIVERY', // Invoice ready for dispatcher
  INVOICE_DELIVERED = 'INVOICE_DELIVERED', // Invoice delivered to customer
  PAYMENT_PENDING_APPROVAL = 'PAYMENT_PENDING_APPROVAL', // MERCHANT payment needs validation
  INVOICE_OVERDUE = 'INVOICE_OVERDUE', // Invoice past due date
  CREDIT_LIMIT_EXCEEDED = 'CREDIT_LIMIT_EXCEEDED', // Customer over credit limit
}

export interface NotificationTypeOption {
  label: string;
  value: NotificationType;
  icon: string;
  severity: 'info' | 'success' | 'warn' | 'danger';
}

export const NOTIFICATION_TYPES: readonly NotificationTypeOption[] = [
  {
    label: 'Nuevo Pedido',
    value: NotificationType.ORDER_CREATED,
    icon: 'pi pi-shopping-cart',
    severity: 'info',
  },
  {
    label: 'Factura Creada',
    value: NotificationType.INVOICE_CREATED,
    icon: 'pi pi-file',
    severity: 'info',
  },
  {
    label: 'Lista para Entrega',
    value: NotificationType.INVOICE_READY_FOR_DELIVERY,
    icon: 'pi pi-truck',
    severity: 'info',
  },
  {
    label: 'Factura Entregada',
    value: NotificationType.INVOICE_DELIVERED,
    icon: 'pi pi-check-circle',
    severity: 'success',
  },
  {
    label: 'Pago Pendiente',
    value: NotificationType.PAYMENT_PENDING_APPROVAL,
    icon: 'pi pi-clock',
    severity: 'warn',
  },
  {
    label: 'Factura Vencida',
    value: NotificationType.INVOICE_OVERDUE,
    icon: 'pi pi-exclamation-triangle',
    severity: 'danger',
  },
  {
    label: 'Limite de Credito',
    value: NotificationType.CREDIT_LIMIT_EXCEEDED,
    icon: 'pi pi-ban',
    severity: 'danger',
  },
] as const;

export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, NotificationTypeOption> =
  NOTIFICATION_TYPES.reduce(
    (acc, type) => ({ ...acc, [type.value]: type }),
    {} as Record<NotificationType, NotificationTypeOption>,
  );

export function getNotificationTypeConfig(type: NotificationType): NotificationTypeOption {
  return (
    NOTIFICATION_TYPE_CONFIG[type] || {
      label: type,
      value: type,
      icon: 'pi pi-bell',
      severity: 'info',
    }
  );
}
```

---

#### ReferenceType

```typescript
export enum ReferenceType {
  ORDER = 'ORDER',
  INVOICE = 'INVOICE',
  PAYMENT = 'PAYMENT',
  CUSTOMER = 'CUSTOMER',
}

export const REFERENCE_TYPE_ROUTES: Record<ReferenceType, string> = {
  [ReferenceType.ORDER]: '/orders',
  [ReferenceType.INVOICE]: '/invoices',
  [ReferenceType.PAYMENT]: '/receivables/pending-payments',
  [ReferenceType.CUSTOMER]: '/customers',
};

export function getReferenceRoute(type: ReferenceType, id: string): string {
  const basePath = REFERENCE_TYPE_ROUTES[type];
  return `${basePath}/${id}`;
}
```

---

## API Endpoints

### Backend Base URL

All endpoints use: `/api/notifications`

### Interface Mapping Summary

| HTTP Method | Endpoint                        | Request Interface | Response Interface       | Frontend Usage      |
| ----------- | ------------------------------- | ----------------- | ------------------------ | ------------------- |
| GET         | /api/notifications              | -                 | `Page<NotificationList>` | Notifications list  |
| GET         | /api/notifications/unread-count | -                 | `UnreadCount`            | Badge count         |
| GET         | /api/notifications/:id          | -                 | `NotificationDetail`     | Detail view         |
| PUT         | /api/notifications/:id/read     | -                 | `NotificationDetail`     | Mark as read        |
| PUT         | /api/notifications/read-all     | -                 | `MarkAllAsReadResult`    | Mark all read       |
| DELETE      | /api/notifications/:id          | -                 | void (204)               | Delete notification |

---

### GET /api/notifications

**Purpose**: Get user notifications

**Roles**: All authenticated users

**Query Parameters**:

- `read` (boolean): Filter by read status (null = all)
- `type` (string): Filter by notification type
- `page` (number): Page number (default: 0)
- `size` (number): Page size (default: 20)
- `sort` (string): Sort field (default: createdAt,desc)

**Frontend Interface**: `Page<NotificationList>`

**Example Response**:

```json
{
  "content": [
    {
      "id": "notification-001-uuid",
      "type": "ORDER_CREATED",
      "title": "Nuevo Pedido",
      "message": "Juan Perez (MERCHANT) ha creado el pedido ORD-2025-00015 para ABC Company",
      "referenceId": "order-001-uuid",
      "referenceType": "ORDER",
      "read": false,
      "createdAt": "2025-01-15T10:30:00"
    },
    {
      "id": "notification-002-uuid",
      "type": "PAYMENT_PENDING_APPROVAL",
      "title": "Pago Pendiente de Validacion",
      "message": "Juan Perez (MERCHANT) registro un pago de $500.00 para INV-2025-00001",
      "referenceId": "pending-payment-001-uuid",
      "referenceType": "PAYMENT",
      "read": false,
      "createdAt": "2025-01-15T09:00:00"
    }
  ],
  "totalElements": 15,
  "totalPages": 1,
  "size": 20,
  "number": 0
}
```

---

### GET /api/notifications/unread-count

**Purpose**: Get unread notifications count

**Roles**: All authenticated users

**Frontend Interface**: `UnreadCount`

**Example Response**:

```json
{
  "unreadCount": 5
}
```

---

### GET /api/notifications/:id

**Purpose**: Get notification detail

**Roles**: All authenticated users (owner only)

**Frontend Interface**: `NotificationDetail`

**Example Response**:

```json
{
  "id": "notification-001-uuid",
  "type": "ORDER_CREATED",
  "title": "Nuevo Pedido",
  "message": "Juan Perez (MERCHANT) ha creado el pedido ORD-2025-00015 para ABC Company",
  "referenceId": "order-001-uuid",
  "referenceType": "ORDER",
  "read": true,
  "readAt": "2025-01-15T11:00:00",
  "createdAt": "2025-01-15T10:30:00"
}
```

**Errors**:

- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Accessing another user's notification
- `404 Not Found`: Notification not found

---

### PUT /api/notifications/:id/read

**Purpose**: Mark notification as read

**Roles**: All authenticated users (owner only)

**Frontend Interface**: `NotificationDetail`

**Example Response**:

```json
{
  "id": "notification-001-uuid",
  "type": "ORDER_CREATED",
  "title": "Nuevo Pedido",
  "message": "Juan Perez (MERCHANT) ha creado el pedido ORD-2025-00015 para ABC Company",
  "referenceId": "order-001-uuid",
  "referenceType": "ORDER",
  "read": true,
  "readAt": "2025-01-15T11:00:00",
  "createdAt": "2025-01-15T10:30:00"
}
```

---

### PUT /api/notifications/read-all

**Purpose**: Mark all unread notifications as read

**Roles**: All authenticated users

**Frontend Interface**: `MarkAllAsReadResult`

**Example Response**:

```json
{
  "markedAsRead": 5,
  "timestamp": "2025-01-15T11:00:00"
}
```

---

### DELETE /api/notifications/:id

**Purpose**: Delete notification

**Roles**: All authenticated users (owner only)

**Response**: 204 No Content

**Errors**:

- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Accessing another user's notification
- `404 Not Found`: Notification not found

---

## Notification Types and Recipients

### Notification Routing by Role

| Notification Type            | Trigger                          | Recipients  |
| ---------------------------- | -------------------------------- | ----------- |
| `ORDER_CREATED`              | MERCHANT creates an order        | ADMIN, USER |
| `INVOICE_CREATED`            | Order converted to invoice       | ADMIN, USER |
| `INVOICE_READY_FOR_DELIVERY` | Invoice created (PENDING status) | DISPATCHER  |
| `INVOICE_DELIVERED`          | Dispatcher marks delivered       | ADMIN, USER |
| `PAYMENT_PENDING_APPROVAL`   | MERCHANT registers payment       | ADMIN, USER |
| `INVOICE_OVERDUE`            | Scheduled job (daily)            | ADMIN, USER |
| `CREDIT_LIMIT_EXCEEDED`      | During order/invoice creation    | ADMIN, USER |

### Message Templates (Spanish)

| Type                         | Title                        | Message Template                                                                                                             |
| ---------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `ORDER_CREATED`              | Nuevo Pedido                 | `{merchantName} (MERCHANT) ha creado el pedido {orderNumber} para {customerName}`                                            |
| `INVOICE_CREATED`            | Factura Creada               | `Se ha creado la factura {invoiceNumber} para {customerName} (Total: ${subtotal})`                                           |
| `INVOICE_READY_FOR_DELIVERY` | Factura Lista para Entrega   | `Factura {invoiceNumber} lista para entregar a {customerName} - {customerAddress}`                                           |
| `INVOICE_DELIVERED`          | Factura Entregada            | `La factura {invoiceNumber} ha sido entregada a {customerName} por {dispatcherName}`                                         |
| `PAYMENT_PENDING_APPROVAL`   | Pago Pendiente de Validacion | `{merchantName} (MERCHANT) registro un pago de ${amount} para factura {invoiceNumber} ({paymentMethod})`                     |
| `INVOICE_OVERDUE`            | Factura Vencida              | `La factura {invoiceNumber} de {customerName} esta vencida hace {daysOverdue} dias (Saldo: ${balance})`                      |
| `CREDIT_LIMIT_EXCEEDED`      | Limite de Credito Excedido   | `Cliente {customerName} excede su limite de credito (${excessAmount}). Deuda actual: ${currentDebt}, Limite: ${creditLimit}` |

---

## Business Rules

### Notification Creation

1. Notifications are created automatically by event listeners (backend)
2. Each notification targets specific user roles
3. One notification record per recipient (not broadcast)
4. Notifications are created with `read = false`
5. Cannot manually create notifications

### Notification Access

1. Users can only access their own notifications
2. Notifications are returned in reverse chronological order (newest first)
3. Unread count is calculated per user

### Notification Lifecycle

1. Created -> Unread
2. User marks as read -> Read (readAt timestamp set)
3. User deletes -> Removed from database
4. After 90 days -> Archived (scheduled job)

### Role-Based Routing

1. **ADMIN**: Receives all notification types except INVOICE_READY_FOR_DELIVERY
2. **USER**: Same as ADMIN
3. **MERCHANT**: Does NOT receive notifications (they are the source of events)
4. **DISPATCHER**: Only receives INVOICE_READY_FOR_DELIVERY

---

## Service Architecture

### API Service (Infrastructure Layer)

**File**: `services/api/notifications-api.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class NotificationsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/notifications';

  getNotifications(params: SearchParams): Observable<Page<NotificationList>> {
    return this.http.get<Page<NotificationList>>(this.baseUrl, { params });
  }

  getUnreadCount(): Observable<UnreadCount> {
    return this.http.get<UnreadCount>(`${this.baseUrl}/unread-count`);
  }

  getNotificationDetail(id: string): Observable<NotificationDetail> {
    return this.http.get<NotificationDetail>(`${this.baseUrl}/${id}`);
  }

  markAsRead(id: string): Observable<NotificationDetail> {
    return this.http.put<NotificationDetail>(`${this.baseUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<MarkAllAsReadResult> {
    return this.http.put<MarkAllAsReadResult>(`${this.baseUrl}/read-all`, {});
  }

  deleteNotification(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

---

### Application Service (Application Layer)

**File**: `services/application/notifications-application.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class NotificationsApplicationService implements OnDestroy {
  private readonly api = inject(NotificationsApiService);
  private readonly router = inject(Router);
  private pollingSubscription: Subscription | null = null;

  // State signals
  readonly notifications = signal<NotificationList[]>([]);
  readonly unreadCount = signal<number>(0);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // Polling configuration
  private readonly POLLING_INTERVAL = 60000; // 60 seconds

  loadNotifications(params: SearchParams): Observable<Page<NotificationList>> {
    this.loading.set(true);
    return this.api.getNotifications(params).pipe(
      tap((page) => this.notifications.set(page.content)),
      finalize(() => this.loading.set(false)),
    );
  }

  loadUnreadCount(): Observable<UnreadCount> {
    return this.api
      .getUnreadCount()
      .pipe(tap((result) => this.unreadCount.set(result.unreadCount)));
  }

  markAsRead(id: string): Observable<NotificationDetail> {
    return this.api.markAsRead(id).pipe(
      tap(() => {
        // Update local state
        const current = this.notifications();
        const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
        this.notifications.set(updated);

        // Decrement unread count
        const count = this.unreadCount();
        if (count > 0) {
          this.unreadCount.set(count - 1);
        }
      }),
    );
  }

  markAllAsRead(): Observable<MarkAllAsReadResult> {
    return this.api.markAllAsRead().pipe(
      tap((result) => {
        // Update all notifications as read
        const current = this.notifications();
        const updated = current.map((n) => ({ ...n, read: true }));
        this.notifications.set(updated);

        // Reset unread count
        this.unreadCount.set(0);
      }),
    );
  }

  deleteNotification(id: string): Observable<void> {
    return this.api.deleteNotification(id).pipe(
      tap(() => {
        // Remove from local state
        const current = this.notifications();
        const notification = current.find((n) => n.id === id);
        const updated = current.filter((n) => n.id !== id);
        this.notifications.set(updated);

        // Update unread count if needed
        if (notification && !notification.read) {
          const count = this.unreadCount();
          if (count > 0) {
            this.unreadCount.set(count - 1);
          }
        }
      }),
    );
  }

  navigateToReference(notification: NotificationList): void {
    if (notification.referenceId && notification.referenceType) {
      // Mark as read first
      if (!notification.read) {
        this.markAsRead(notification.id).subscribe();
      }

      // Navigate to related entity
      const route = getReferenceRoute(
        notification.referenceType as ReferenceType,
        notification.referenceId,
      );
      this.router.navigate([route]);
    }
  }

  // Polling methods
  startPolling(): void {
    if (this.pollingSubscription) {
      return; // Already polling
    }

    this.pollingSubscription = interval(this.POLLING_INTERVAL)
      .pipe(switchMap(() => this.loadUnreadCount()))
      .subscribe();
  }

  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
```

---

## Routes Configuration

```typescript
// router/notifications.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '@core/guards';

export const NOTIFICATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/notifications-page/notifications-page.component').then(
        (m) => m.NotificationsPageComponent,
      ),
    title: 'Notificaciones',
    canActivate: [authGuard],
  },
];
```

---

## Messages

```typescript
// messages/notifications.messages.ts

export const NOTIFICATIONS_SUCCESS_MESSAGES = {
  MARKED_AS_READ: 'Notificacion marcada como leida',
  ALL_MARKED_AS_READ: 'Todas las notificaciones marcadas como leidas',
  DELETED: 'Notificacion eliminada',
};

export const NOTIFICATIONS_ERROR_MESSAGES = {
  LOAD_ERROR: 'Error al cargar las notificaciones',
  MARK_READ_ERROR: 'Error al marcar la notificacion como leida',
  DELETE_ERROR: 'Error al eliminar la notificacion',
  NOT_FOUND: 'Notificacion no encontrada',
};
```

---

## Component Examples

### Notification Bell Component

```typescript
@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, BadgeModule, ButtonModule, OverlayPanelModule],
  template: `
    <p-button
      [icon]="'pi pi-bell'"
      [badge]="unreadCount() > 0 ? unreadCount().toString() : ''"
      badgeSeverity="danger"
      [text]="true"
      (onClick)="panel.toggle($event)"
    />

    <p-overlayPanel #panel [style]="{ width: '400px' }">
      <app-notification-list-panel
        [notifications]="recentNotifications()"
        (markAllAsRead)="onMarkAllAsRead()"
        (viewAll)="onViewAll()"
        (notificationClick)="onNotificationClick($event)"
      />
    </p-overlayPanel>
  `,
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  private readonly service = inject(NotificationsApplicationService);
  private readonly router = inject(Router);

  readonly unreadCount = this.service.unreadCount;
  readonly recentNotifications = computed(() => this.service.notifications().slice(0, 10));

  ngOnInit(): void {
    // Initial load
    this.service.loadUnreadCount().subscribe();
    this.service.loadNotifications({ page: 0, size: 10 }).subscribe();

    // Start polling
    this.service.startPolling();
  }

  ngOnDestroy(): void {
    this.service.stopPolling();
  }

  onMarkAllAsRead(): void {
    this.service.markAllAsRead().subscribe();
  }

  onViewAll(): void {
    this.router.navigate(['/notifications']);
  }

  onNotificationClick(notification: NotificationList): void {
    this.service.navigateToReference(notification);
  }
}
```

---

### Notification Item Component

```typescript
@Component({
  selector: 'app-notification-item',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="notification-item" [class.unread]="!notification().read" (click)="onClick()">
      <div class="notification-icon">
        <i [class]="getIcon()"></i>
      </div>
      <div class="notification-content">
        <div class="notification-title">{{ notification().title }}</div>
        <div class="notification-message">{{ notification().message }}</div>
        <div class="notification-time">{{ getTimeAgo() }}</div>
      </div>
      <div class="notification-actions">
        <p-button icon="pi pi-trash" [text]="true" severity="danger" (onClick)="onDelete($event)" />
      </div>
    </div>
  `,
})
export class NotificationItemComponent {
  notification = input.required<NotificationList>();

  click = output<NotificationList>();
  delete = output<NotificationList>();

  onClick(): void {
    this.click.emit(this.notification());
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit(this.notification());
  }

  getIcon(): string {
    const config = getNotificationTypeConfig(this.notification().type);
    return config.icon;
  }

  getTimeAgo(): string {
    const date = new Date(this.notification().createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} dia${diffDays > 1 ? 's' : ''}`;

    return date.toLocaleDateString('es-VE');
  }
}
```

---

## Testing Requirements

### Unit Tests

- [ ] API service HTTP calls mocked
- [ ] Application service state management tested
- [ ] Polling start/stop tested
- [ ] Navigation to reference tested
- [ ] Unread count updates tested

### Component Tests

- [ ] Notification bell renders correctly
- [ ] Badge shows correct unread count
- [ ] Panel opens on click
- [ ] Notification item displays correctly
- [ ] Time ago format is correct
- [ ] Delete action works

### Integration Tests

- [ ] Full notification workflow tested
- [ ] Mark as read updates state correctly
- [ ] Mark all as read works
- [ ] Delete removes notification
- [ ] Navigation to reference works
- [ ] Polling updates count

---

## Related Modules

- [Orders](./orders.md) - Triggers ORDER_CREATED notifications
- [Invoices](./invoices.md) - Triggers INVOICE_CREATED, INVOICE_DELIVERED notifications
- [Receivables](./receivables.md) - Triggers PAYMENT_PENDING_APPROVAL notifications
- [Customers](./customers.md) - Provides credit limit data for CREDIT_LIMIT_EXCEEDED
- [Auth](./auth.md) - Provides user and role information for routing

---

## Notes

### Important Considerations

1. **Backend-Generated**: Notifications are NEVER created from the frontend. They are generated by backend event listeners.

2. **Role-Based Routing**: Different roles receive different notification types. MERCHANT does not receive notifications (they trigger events, not receive them).

3. **Polling Strategy**: The frontend polls for unread count every 60 seconds. This is simpler than WebSockets but has a delay.

4. **Reference Navigation**: Notifications include `referenceId` and `referenceType` to allow navigation to the related entity.

5. **Retention Policy**: Notifications older than 90 days are archived by a scheduled backend job.

6. **No Real-Time Push**: This is polling-based, not real-time. Consider WebSockets for instant notifications in the future.

### Common Patterns

- Use signals for state management
- Start polling when component initializes
- Stop polling when component destroys
- Update local state optimistically after actions
- Show toast messages for errors
- Provide visual indicator for unread notifications

### Frontend Integration Points

1. **Layout Header**: Add NotificationBell component to main layout
2. **App Initialization**: Start polling on app init (optional)
3. **Auth State**: Stop polling on logout, start on login
4. **Navigation**: Mark as read when navigating to reference

---

**Last Updated**: 2026-01-16

**Module Status**: [ ] Planned | [ ] In Development | [ ] Implemented
