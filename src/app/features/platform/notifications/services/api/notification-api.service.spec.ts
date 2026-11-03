import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NotificationApiService } from '@features/platform/notifications/services/api/notification-api.service';

describe('NotificationApiService', () => {
  let service: NotificationApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(NotificationApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads all notifications and filters unread notifications', () => {
    service.list().subscribe();
    http.expectOne('/api/notifications').flush([]);

    service.list(true).subscribe();
    http.expectOne('/api/notifications?unread=true').flush([]);
  });

  it('loads the unread count', () => {
    service.getUnreadCount().subscribe((count) => expect(count.count).toBe(2));
    http.expectOne('/api/notifications/unread-count').flush({ count: 2 });
  });

  it('marks one notification or all notifications as read', () => {
    service.markAsRead('notification-1').subscribe();
    const markOne = http.expectOne('/api/notifications/notification-1/read');
    expect(markOne.request.method).toBe('PUT');
    expect(markOne.request.body).toEqual({});
    markOne.flush(null);

    service.markAllAsRead().subscribe();
    const markAll = http.expectOne('/api/notifications/read-all');
    expect(markAll.request.method).toBe('PUT');
    markAll.flush(null);
  });
});
