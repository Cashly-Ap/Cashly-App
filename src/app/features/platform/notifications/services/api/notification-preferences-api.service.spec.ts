import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NotificationPreferencesApiService } from '@features/platform/notifications/services/api/notification-preferences-api.service';

const preferences = {
  enabled: true,
  modules: [{ module: 'SALES_QUOTES', labelKey: 'navigation.labels.quotes', enabled: true }],
};

describe('NotificationPreferencesApiService', () => {
  let service: NotificationPreferencesApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(NotificationPreferencesApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the authenticated user notification preferences', () => {
    service.get().subscribe((value) => expect(value).toEqual(preferences));

    const request = http.expectOne('/api/notifications/preferences');
    expect(request.request.method).toBe('GET');
    request.flush(preferences);
  });

  it('saves the notification preferences', () => {
    const body = {
      enabled: false,
      modules: [{ module: 'SALES_QUOTES', enabled: true }],
    };
    service
      .update(body)
      .subscribe((value) => expect(value).toEqual({ ...preferences, enabled: false }));

    const request = http.expectOne('/api/notifications/preferences');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(body);
    request.flush({ ...preferences, enabled: false });
  });
});
