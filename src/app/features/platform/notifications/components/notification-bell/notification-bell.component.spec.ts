import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, Subject } from 'rxjs';
import { NotificationBellComponent } from '@features/platform/notifications/components/notification-bell/notification-bell.component';
import {
  AppNotification,
  NotificationApiService,
} from '@features/platform/notifications/services/api/notification-api.service';
import { NotificationWebSocketService } from '@features/platform/notifications/services/websocket/notification-websocket.service';
import { NotificationDestinationResolver } from '@features/platform/notifications/services/navigation/notification-destination.resolver';
import { NotificationPreferencesService } from '@features/platform/notifications/services/state/notification-preferences.service';

const notification: AppNotification = {
  id: 'n1',
  type: 'QUOTE_CREATED',
  title: 'Presupuesto',
  message: 'Creado',
  referenceType: 'QUOTE',
  referenceId: 'q1',
  isRead: false,
  createdAt: '2026-08-11T12:00:00',
  readAt: null,
};

describe('NotificationBellComponent', () => {
  let component: NotificationBellComponent;
  let fixture: ComponentFixture<NotificationBellComponent>;
  let api: {
    markAsRead: ReturnType<typeof vi.fn>;
    getUnreadCount: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    markAllAsRead: ReturnType<typeof vi.fn>;
  };
  let resolver: { navigate: ReturnType<typeof vi.fn> };
  let ws: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    notification$: Subject<AppNotification>;
  };
  const preferences = { bellVisible: signal(false) };

  beforeEach(async () => {
    preferences.bellVisible.set(false);
    api = {
      markAsRead: vi.fn(() => of(void 0)),
      getUnreadCount: vi.fn(() => of({ count: 0 })),
      list: vi.fn(() => of([])),
      markAllAsRead: vi.fn(() => of(void 0)),
    };
    resolver = { navigate: vi.fn(() => Promise.resolve()) };
    ws = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      notification$: new Subject<AppNotification>(),
    };
    await TestBed.configureTestingModule({
      imports: [NotificationBellComponent],
      providers: [
        { provide: NotificationApiService, useValue: api },
        { provide: NotificationWebSocketService, useValue: ws },
        { provide: NotificationDestinationResolver, useValue: resolver },
        { provide: NotificationPreferencesService, useValue: preferences },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(NotificationBellComponent);
    component = fixture.componentInstance;
    component.panel = { hide: vi.fn() } as never;
  });

  it('labels every reference type with a concrete view action', () => {
    const referenceTypes = [
      'INVOICE',
      'CUSTOMER',
      'QUOTE',
      'ORDER',
      'PRODUCT',
      'PURCHASE',
      'CATEGORY',
      'PRICE_TYPE',
      'WAREHOUSE',
      'RETURN',
      'CREDIT_NOTE',
      'DEBIT_NOTE',
      'CASH_REGISTER',
      'EXPENSE',
      'RECEIVABLE',
      'PAYMENT',
      'PAYMENT_METHOD',
      'SUPPLIER',
      'USER',
      'ROLE',
      'DEPARTMENT',
      'COMPANY',
    ];

    const labels = referenceTypes.map((referenceType) =>
      component.notificationActionLabel({ ...notification, referenceType }),
    );

    expect(labels).not.toContain('platform.notifications.goThere');
    expect(labels.every((label) => label.startsWith('platform.notifications.actions.view'))).toBe(
      true,
    );
    expect(component.notificationActionLabel({ ...notification, referenceType: 'CATEGORY' })).toBe(
      'platform.notifications.actions.viewCategory',
    );
    expect(component.notificationActionLabel({ ...notification, referenceType: 'WAREHOUSE' })).toBe(
      'platform.notifications.actions.viewWarehouse',
    );
    expect(component.notificationActionLabel({ ...notification, referenceType: 'EXPENSE' })).toBe(
      'platform.notifications.actions.viewExpense',
    );
    expect(component.notificationActionLabel({ ...notification, referenceType: null })).toBe(
      'platform.notifications.actions.view',
    );
  });

  it('should mark a notification as read without navigating', () => {
    component.unreadCount.set(1);
    component.notifications.set([notification]);

    component.markNotificationAsRead(notification);

    expect(api.markAsRead).toHaveBeenCalledWith('n1');
    expect(component.unreadCount()).toBe(0);
    expect(component.notifications()).toEqual([]);
    expect(resolver.navigate).not.toHaveBeenCalled();
  });

  it('should mark the notification as read and remove it when opening it', () => {
    component.unreadCount.set(1);
    component.notifications.set([notification]);

    component.openNotification(notification);

    expect(api.markAsRead).toHaveBeenCalledWith('n1');
    expect(component.unreadCount()).toBe(0);
    expect(component.notifications()).toEqual([]);
    expect(component.panel.hide).toHaveBeenCalled();
    expect(resolver.navigate).toHaveBeenCalledWith('QUOTE', 'q1');
  });

  it('should not handle clicks on the notification card body', () => {
    component.onNotificationCardClick();

    expect(api.markAsRead).not.toHaveBeenCalled();
    expect(resolver.navigate).not.toHaveBeenCalled();
    expect(component.panel.hide).not.toHaveBeenCalled();
  });

  it('should mark as read and navigate on the explicit notification action', () => {
    component.unreadCount.set(1);
    component.notifications.set([notification]);

    component.openNotification(notification);

    expect(api.markAsRead).toHaveBeenCalledWith('n1');
    expect(component.unreadCount()).toBe(0);
    expect(component.notifications()).toEqual([]);
    expect(resolver.navigate).toHaveBeenCalledWith('QUOTE', 'q1');
  });

  it('should not connect or request the unread count while hidden', () => {
    fixture.detectChanges();

    expect(ws.connect).not.toHaveBeenCalled();
    expect(api.getUnreadCount).not.toHaveBeenCalled();
  });

  it('should connect and request the unread count when visible', () => {
    preferences.bellVisible.set(true);
    fixture.detectChanges();

    expect(ws.connect).toHaveBeenCalledOnce();
    expect(api.getUnreadCount).toHaveBeenCalledOnce();
  });

  it('should disconnect when notifications become hidden', () => {
    preferences.bellVisible.set(true);
    fixture.detectChanges();

    preferences.bellVisible.set(false);
    fixture.detectChanges();

    expect(ws.disconnect).toHaveBeenCalledOnce();
  });

  it('should resume listening when notifications become visible again', () => {
    preferences.bellVisible.set(true);
    fixture.detectChanges();
    preferences.bellVisible.set(false);
    fixture.detectChanges();

    preferences.bellVisible.set(true);
    fixture.detectChanges();
    ws.notification$.next(notification);

    expect(ws.connect).toHaveBeenCalledTimes(2);
    expect(component.unreadCount()).toBe(1);
    expect(component.notifications()).toEqual([notification]);
  });
});
