import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { NotificationBellComponent } from './notification-bell.component';
import { AppNotification, NotificationApiService } from '../../services/api/notification-api.service';
import { NotificationWebSocketService } from '../../services/websocket/notification-websocket.service';
import { NotificationDestinationResolver } from '../../services/navigation/notification-destination.resolver';

const notification: AppNotification = { id: 'n1', type: 'QUOTE_CREATED', title: 'Presupuesto', message: 'Creado', referenceType: 'QUOTE', referenceId: 'q1', isRead: false, createdAt: '2026-08-11T12:00:00', readAt: null };

describe('NotificationBellComponent', () => {
  let component: NotificationBellComponent;
  let api: { markAsRead: ReturnType<typeof vi.fn>; getUnreadCount: ReturnType<typeof vi.fn>; list: ReturnType<typeof vi.fn>; markAllAsRead: ReturnType<typeof vi.fn> };
  let resolver: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = { markAsRead: vi.fn(() => of(void 0)), getUnreadCount: vi.fn(() => of({ count: 0 })), list: vi.fn(() => of([])), markAllAsRead: vi.fn(() => of(void 0)) };
    resolver = { navigate: vi.fn(() => Promise.resolve()) };
    await TestBed.configureTestingModule({
      imports: [NotificationBellComponent],
      providers: [
        { provide: NotificationApiService, useValue: api },
        { provide: NotificationWebSocketService, useValue: { connect: vi.fn(), notification$: new Subject<AppNotification>() } },
        { provide: NotificationDestinationResolver, useValue: resolver },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(NotificationBellComponent);
    component = fixture.componentInstance;
    component.panel = { hide: vi.fn() } as never;
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

  it('should navigate without marking the notification as read', () => {
    component.notifications.set([notification]);

    component.openNotification(notification);

    expect(api.markAsRead).not.toHaveBeenCalled();
    expect(component.notifications()).toEqual([notification]);
    expect(component.panel.hide).toHaveBeenCalled();
    expect(resolver.navigate).toHaveBeenCalledWith('QUOTE', 'q1');
  });

  it('should not handle clicks on the notification card body', () => {
    component.onNotificationCardClick();

    expect(api.markAsRead).not.toHaveBeenCalled();
    expect(resolver.navigate).not.toHaveBeenCalled();
    expect(component.panel.hide).not.toHaveBeenCalled();
  });

  it('should handle clicks on the explicit notification action', () => {
    component.openNotification(notification);

    expect(api.markAsRead).not.toHaveBeenCalled();
    expect(resolver.navigate).toHaveBeenCalledWith('QUOTE', 'q1');
  });
});
