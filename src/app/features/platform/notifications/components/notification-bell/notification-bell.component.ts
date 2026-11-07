import { TranslatePipe } from '@core/i18n/translate.pipe';
import {
  Component,
  effect,
  inject,
  signal,
  ViewChild,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import {
  NotificationApiService,
  AppNotification,
} from '@features/platform/notifications/services/api/notification-api.service';
import { NotificationWebSocketService } from '@features/platform/notifications/services/websocket/notification-websocket.service';
import { NotificationDestinationResolver } from '@features/platform/notifications/services/navigation/notification-destination.resolver';
import { NotificationPreferencesService } from '@features/platform/notifications/services/state/notification-preferences.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [TranslatePipe, CommonModule, ButtonModule, PopoverModule, TooltipModule],
  templateUrl: './notification-bell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationBellComponent implements OnDestroy {
  private readonly api = inject(NotificationApiService);
  private readonly wsService = inject(NotificationWebSocketService);
  private readonly destinationResolver = inject(NotificationDestinationResolver);
  private readonly preferences = inject(NotificationPreferencesService);
  private wsConnected = false;
  private notificationSubscription?: Subscription;
  private unreadCountSubscription?: Subscription;

  @ViewChild('panel') panel!: Popover;

  readonly unreadCount = signal(0);
  readonly notifications = signal<AppNotification[]>([]);
  readonly loading = signal(false);

  constructor() {
    effect(() => {
      const visible = this.preferences.bellVisible();
      if (!visible) {
        this.stopListening();
        this.unreadCountSubscription?.unsubscribe();
        this.unreadCountSubscription = undefined;
        this.disconnect();
        return;
      }
      this.connect();
      this.startListening();
      this.unreadCountSubscription?.unsubscribe();
      this.unreadCountSubscription = this.api
        .getUnreadCount()
        .subscribe((res) => this.unreadCount.set(res.count));
    });
  }

  ngOnDestroy(): void {
    this.stopListening();
    this.unreadCountSubscription?.unsubscribe();
    this.unreadCountSubscription = undefined;
    this.disconnect();
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
      INVOICE: 'platform.notifications.actions.viewInvoice',
      CUSTOMER: 'platform.notifications.actions.viewCustomer',
      QUOTE: 'platform.notifications.actions.viewQuote',
      ORDER: 'platform.notifications.actions.viewOrder',
      PRODUCT: 'platform.notifications.actions.viewProduct',
      PAYMENT: 'platform.notifications.actions.viewPayment',
      RECEIVABLE: 'platform.notifications.actions.viewPayment',
    };
    return labels[notification.referenceType ?? ''] ?? 'platform.notifications.goThere';
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

  private connect(): void {
    if (this.wsConnected) return;
    this.wsService.connect();
    this.wsConnected = true;
  }

  private disconnect(): void {
    if (!this.wsConnected) return;
    this.wsService.disconnect();
    this.wsConnected = false;
  }

  private startListening(): void {
    if (this.notificationSubscription) return;
    this.notificationSubscription = this.wsService.notification$.subscribe((notification) => {
      this.unreadCount.update((c) => c + 1);
      this.notifications.update((list) => [notification, ...list]);
    });
  }

  private stopListening(): void {
    this.notificationSubscription?.unsubscribe();
    this.notificationSubscription = undefined;
  }
}
