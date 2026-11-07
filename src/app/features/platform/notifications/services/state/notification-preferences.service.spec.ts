import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { NotificationPreferencesService } from '@features/platform/notifications/services/state/notification-preferences.service';

const preferences = {
  enabled: true,
  modules: [
    { module: 'SALES_QUOTES', labelKey: 'navigation.labels.quotes', enabled: true },
    { module: 'SALES_ORDERS', labelKey: 'navigation.labels.orders', enabled: true },
  ],
};

describe('NotificationPreferencesService', () => {
  const user = signal<{ id: string } | null>({ id: 'alice' });
  let http: HttpTestingController;
  let service: NotificationPreferencesService;

  beforeEach(() => {
    user.set({ id: 'alice' });
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { currentUser: user } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(NotificationPreferencesService);
    TestBed.flushEffects();
  });

  afterEach(() => http.verify());

  const load = (body: unknown = preferences) =>
    http.expectOne('/api/notifications/preferences').flush(body);

  it('starts with notifications hidden until the preferences load', () => {
    expect(service.enabled()).toBe(true);
    expect(service.modules()).toEqual([]);
    expect(service.bellVisible()).toBe(false);
    expect(service.loading()).toBe(true);

    load();

    expect(service.loading()).toBe(false);
    expect(service.ready()).toBe(true);
    expect(service.bellVisible()).toBe(true);
  });

  it('renders the modules returned by the backend', () => {
    load();

    expect(service.modules()).toEqual(preferences.modules);
    expect(service.hasEnabledModules()).toBe(true);
  });

  it('saves a module change optimistically and keeps it after the response', () => {
    load();

    service.setModuleEnabled('SALES_QUOTES', false);

    expect(service.modules()[0].enabled).toBe(false);
    const request = http.expectOne('/api/notifications/preferences');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      enabled: true,
      modules: [
        { module: 'SALES_QUOTES', enabled: false },
        { module: 'SALES_ORDERS', enabled: true },
      ],
    });
    request.flush({
      ...preferences,
      modules: [{ ...preferences.modules[0], enabled: false }, preferences.modules[1]],
    });
    expect(service.saving()).toBe(false);
    expect(service.modules()[0].enabled).toBe(false);
  });

  it('rolls back the optimistic change when saving fails and retries it', () => {
    load();

    service.setModuleEnabled('SALES_QUOTES', false);
    http
      .expectOne('/api/notifications/preferences')
      .flush({}, { status: 500, statusText: 'Failed' });

    expect(service.modules()[0].enabled).toBe(true);
    expect(service.error()).toBe('platform.notifications.preferences.saveError');

    service.retry();
    const retry = http.expectOne('/api/notifications/preferences');
    expect(retry.request.body).toEqual({
      enabled: true,
      modules: [
        { module: 'SALES_QUOTES', enabled: false },
        { module: 'SALES_ORDERS', enabled: true },
      ],
    });
    retry.flush({
      ...preferences,
      modules: [{ ...preferences.modules[0], enabled: false }, preferences.modules[1]],
    });
    expect(service.error()).toBeNull();
    expect(service.modules()[0].enabled).toBe(false);
  });

  it('keeps module values when the master switch is turned off', () => {
    load();

    service.setEnabled(false);

    expect(service.enabled()).toBe(false);
    expect(service.modules()[0].enabled).toBe(true);
    expect(service.bellVisible()).toBe(false);
    const request = http.expectOne('/api/notifications/preferences');
    expect(request.request.body.enabled).toBe(false);
    request.flush({ ...preferences, enabled: false });
  });

  it('hides the bell when every module is disabled', () => {
    load({
      ...preferences,
      modules: preferences.modules.map((module) => ({ ...module, enabled: false })),
    });

    expect(service.hasEnabledModules()).toBe(false);
    expect(service.bellVisible()).toBe(false);
  });

  it('reloads preferences when the account changes and ignores the previous response', () => {
    const pending = http.expectOne('/api/notifications/preferences');
    user.set({ id: 'bob' });
    TestBed.flushEffects();

    expect(pending.cancelled).toBe(true);
    expect(service.modules()).toEqual([]);

    http
      .expectOne('/api/notifications/preferences')
      .flush({ enabled: false, modules: preferences.modules });
    expect(service.enabled()).toBe(false);
    expect(service.bellVisible()).toBe(false);
  });

  it('rejects malformed preferences and exposes a retry action', () => {
    load({ enabled: 'yes', modules: [{ module: 'SALES_QUOTES', enabled: true }] });

    expect(service.error()).toBe('platform.notifications.preferences.loadError');
    expect(service.ready()).toBe(false);

    service.retry();
    http.expectOne('/api/notifications/preferences').flush(preferences);
    expect(service.error()).toBeNull();
    expect(service.bellVisible()).toBe(true);
  });

  it('does not save preferences after logout', () => {
    const pending = http.expectOne('/api/notifications/preferences');
    user.set(null);
    TestBed.flushEffects();

    service.setEnabled(false);

    expect(pending.cancelled).toBe(true);
    http.expectNone('/api/notifications/preferences');
    expect(service.bellVisible()).toBe(false);
  });
});
