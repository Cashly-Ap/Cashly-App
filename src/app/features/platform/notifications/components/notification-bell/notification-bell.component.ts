import { Component, inject, signal, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import {
  NotificationApiService,
  AppNotification,
} from '@features/platform/notifications/services/api/notification-api.service';
import { NotificationWebSocketService } from '@features/platform/notifications/services/websocket/notification-websocket.service';
import { NotificationDestinationResolver } from '@features/platform/notifications/services/navigation/notification-destination.resolver';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, ButtonModule, PopoverModule, TooltipModule],
  templateUrl: './notification-bell.component.html',
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  private readonly api = inject(NotificationApiService);
  private readonly wsService = inject(NotificationWebSocketService);
  private readonly destinationResolver = inject(NotificationDestinationResolver);
  private readonly destroy$ = new Subject<void>();

  @ViewChild('panel') panel!: Popover;

  readonly unreadCount = signal(0);
  readonly notifications = signal<AppNotification[]>([]);
  readonly loading = signal(false);

  ngOnInit(): void {
    this.wsService.connect();

    this.wsService.notification$.pipe(takeUntil(this.destroy$)).subscribe((notification) => {
      this.unreadCount.update((c) => c + 1);
      this.notifications.update((list) => [notification, ...list]);
    });

    this.api.getUnreadCount().subscribe((res) => {
      this.unreadCount.set(res.count);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  togglePanel(event: Event): void {
    this.panel.toggle(event);
    if (this.notifications().length === 0) {
      this.loadNotifications();
    }
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.api.list(true).subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openNotification(notification: AppNotification): void {
    this.panel.hide();
    void this.destinationResolver.navigate(notification.referenceType, notification.referenceId);
  }

  markNotificationAsRead(notification: AppNotification): void {
    this.notifications.update((list) => list.filter((n) => n.id !== notification.id));
    this.unreadCount.update((c) => Math.max(0, c - 1));
    this.api.markAsRead(notification.id).subscribe({ error: () => undefined });
  }

  notificationActionLabel(notification: AppNotification): string {
    const labels: Record<string, string> = {
      PAYMENT: 'Ver pago',
      QUOTE: 'Ver presupuesto',
      ORDER: 'Ver pedido',
    };
    return labels[notification.referenceType ?? ''] ?? 'Ir allí';
  }

  onNotificationCardClick(): void {}

  markAllAsRead(): void {
    this.api.markAllAsRead().subscribe(() => {
      this.unreadCount.set(0);
      this.notifications.set([]);
    });
  }

  clearAll(): void {
    this.api.markAllAsRead().subscribe(() => {
      this.unreadCount.set(0);
      this.notifications.set([]);
    });
  }

  timeAgo(date: string): string {
    const now = Date.now();
    const then = new Date(date + 'Z').getTime();
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 10) return 'Ahora';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }
}
