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
import { LanguageService } from '@core/i18n/language.service';

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
  private readonly language = inject(LanguageService);
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

  private static readonly ACTION_LABELS: Readonly<Record<string, string>> = {
    INVOICE: 'platform.notifications.actions.viewInvoice',
    CUSTOMER: 'platform.notifications.actions.viewCustomer',
    QUOTE: 'platform.notifications.actions.viewQuote',
    ORDER: 'platform.notifications.actions.viewOrder',
    PRODUCT: 'platform.notifications.actions.viewProduct',
    PURCHASE: 'platform.notifications.actions.viewPurchase',
    CATEGORY: 'platform.notifications.actions.viewCategory',
    PRICE_TYPE: 'platform.notifications.actions.viewPriceType',
    WAREHOUSE: 'platform.notifications.actions.viewWarehouse',
    RETURN: 'platform.notifications.actions.viewReturn',
    CREDIT_NOTE: 'platform.notifications.actions.viewCreditNote',
    DEBIT_NOTE: 'platform.notifications.actions.viewDebitNote',
    CASH_REGISTER: 'platform.notifications.actions.viewCashRegister',
    RECEIVABLE: 'platform.notifications.actions.viewReceivable',
    PAYMENT: 'platform.notifications.actions.viewPayment',
    PAYMENT_METHOD: 'platform.notifications.actions.viewPaymentMethod',
    SUPPLIER: 'platform.notifications.actions.viewSupplier',
    USER: 'platform.notifications.actions.viewUser',
    ROLE: 'platform.notifications.actions.viewRole',
    DEPARTMENT: 'platform.notifications.actions.viewDepartment',
    COMPANY: 'platform.notifications.actions.viewCompany',
  };

  notificationActionLabel(notification: AppNotification): string {
    return (
      NotificationBellComponent.ACTION_LABELS[notification.referenceType ?? ''] ??
      'platform.notifications.actions.view'
    );
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

    const isEnglish = this.language.language() === 'en';
    if (seconds < 10) return isEnglish ? 'Now' : 'Ahora';
    if (seconds < 60) return isEnglish ? `${seconds}s` : `hace ${seconds} s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return isEnglish ? `${minutes}m` : `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return isEnglish ? `${hours}h` : `hace ${hours} h`;
    const days = Math.floor(hours / 24);
    return isEnglish ? `${days}d` : `hace ${days} días`;
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
