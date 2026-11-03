import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { UserPreferencesService } from '@core/preferences/user-preferences.service';

const defaults = {
  language: 'es',
  themeMode: 'system',
  colorMode: 'minimal',
  shortcutsEnabled: false,
  showShortcutHints: true,
};

describe('account preferences', () => {
  const user = signal<{ id: string } | null>({ id: 'alice' });
  let http: HttpTestingController;
  let service: UserPreferencesService;
  beforeEach(() => {
    localStorage.clear();
    user.set({ id: 'alice' });
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { currentUser: user } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(UserPreferencesService);
    TestBed.flushEffects();
  });
  afterEach(() => http.verify());
  const load = () => http.expectOne('/api/auth/preferences').flush(defaults);

  it('defaults to Spanish and persists English as an account preference', () => {
    expect(service.language()).toBe('es');
    load();
    service.setLanguage('en');
    const request = http.expectOne('/api/auth/preferences');
    expect(request.request.body.language).toBe('en');
    request.flush(request.request.body);
    expect(service.language()).toBe('en');
  });
  it('syncs language saved by the profile without a second update request', () => {
    load();
    service.syncLanguage('en');
    expect(service.language()).toBe('en');
    http.expectNone('/api/auth/preferences');
    service.setColorMode('informative');
    const request = http.expectOne('/api/auth/preferences');
    expect(request.request.body.language).toBe('en');
    request.flush(request.request.body);
  });
  it('loads account preferences over browser defaults', () => {
    http.expectOne('/api/auth/preferences').flush({ ...defaults, themeMode: 'dark' });
    expect(service.themeMode()).toBe('dark');
    expect(service.loading()).toBe(false);
  });
  it('serializes changes while keeping the last requested appearance visible', () => {
    load();
    service.setThemeMode('dark');
    service.setColorMode('informative');
    const first = http.expectOne('/api/auth/preferences');
    expect(first.request.method).toBe('PUT');
    expect(first.request.body.colorMode).toBe('minimal');
    expect(service.colorMode()).toBe('informative');
    first.flush({ ...defaults, themeMode: 'dark' });
    const second = http.expectOne('/api/auth/preferences');
    expect(second.request.body).toEqual({
      ...defaults,
      themeMode: 'dark',
      colorMode: 'informative',
    });
    second.flush(second.request.body);
    expect(service.saving()).toBe(false);
  });
  it('restores saved preferences after a failed save and supports retry', () => {
    load();
    service.setColorMode('informative');
    http.expectOne('/api/auth/preferences').flush({}, { status: 500, statusText: 'Failed' });
    expect(service.colorMode()).toBe('minimal');
    expect(service.error()).toBeTruthy();
    service.retry();
    const retry = http.expectOne('/api/auth/preferences');
    expect(retry.request.body.colorMode).toBe('informative');
    retry.flush(retry.request.body);
    expect(service.colorMode()).toBe('informative');
    expect(service.error()).toBeNull();
  });
  it('resets preferences between accounts and ignores canceled requests', () => {
    load();
    service.setThemeMode('dark');
    const pending = http.expectOne('/api/auth/preferences');
    user.set({ id: 'bob' });
    TestBed.flushEffects();
    expect(pending.cancelled).toBe(true);
    expect(service.themeMode()).toBe('system');
    http.expectOne('/api/auth/preferences').flush({ ...defaults, shortcutsEnabled: true });
    expect(service.shortcutsEnabled()).toBe(true);
  });
  it('rejects malformed server values without enabling shortcuts', () => {
    http
      .expectOne('/api/auth/preferences')
      .flush({ themeMode: 'invalid', colorMode: 'blue', shortcutsEnabled: 'yes' });
    expect(service.themeMode()).toBe('system');
    expect(service.shortcutsEnabled()).toBe(false);
    expect(service.error()).toBeTruthy();
  });
  it('does not save or leak account preferences after logout', () => {
    load();
    user.set(null);
    TestBed.flushEffects();
    expect(service.shortcutsEnabled()).toBe(false);
    service.setThemeMode('dark');
    http.expectNone('/api/auth/preferences');
    expect(service.themeMode()).toBe('dark');
  });
  it('does not reload when the same account updates its profile', () => {
    load();
    service.setColorMode('informative');
    const pending = http.expectOne('/api/auth/preferences');
    user.set({ id: 'alice' });
    TestBed.flushEffects();
    expect(pending.cancelled).toBe(false);
    http.expectNone('/api/auth/preferences');
    pending.flush(pending.request.body);
    expect(service.colorMode()).toBe('informative');
  });
  it('does not submit old preferences during an account-switch effect gap', () => {
    load();
    user.set({ id: 'bob' });
    service.setThemeMode('dark');
    http.expectNone('/api/auth/preferences');
    TestBed.flushEffects();
    http.expectOne('/api/auth/preferences').flush(defaults);
    expect(service.themeMode()).toBe('system');
  });
  it('can retry a failed initial load before enabling changes', () => {
    http.expectOne('/api/auth/preferences').flush({}, { status: 503, statusText: 'Unavailable' });
    expect(service.ready()).toBe(false);
    service.setThemeMode('dark');
    http.expectNone('/api/auth/preferences');
    service.retry();
    http.expectOne('/api/auth/preferences').flush(defaults);
    expect(service.ready()).toBe(true);
  });

  it('ignores corrupt and unsupported per-user caches', () => {
    load();
    localStorage.setItem('cashly:preferences:v2:bob', '{invalid');
    user.set({ id: 'bob' });
    TestBed.flushEffects();
    expect(service.themeMode()).toBe('system');
    http.expectOne('/api/auth/preferences').flush(defaults);
    localStorage.setItem(
      'cashly:preferences:v2:carol',
      JSON.stringify({ ...defaults, shortcutsEnabled: 'true' }),
    );
    user.set({ id: 'carol' });
    TestBed.flushEffects();
    expect(service.shortcutsEnabled()).toBe(false);
    http.expectOne('/api/auth/preferences').flush(defaults);
  });
  it('keeps account saving usable when browser cache storage is unavailable', () => {
    load();
    const denied = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    service.setColorMode('informative');
    const request = http.expectOne('/api/auth/preferences');
    request.flush(request.request.body);
    expect(service.colorMode()).toBe('informative');
    expect(service.error()).toBeNull();
    denied.mockRestore();
  });
  it('retains legacy theme for signed-out appearance without importing another account settings', () => {
    load();
    localStorage.setItem('theme', 'dark');
    user.set(null);
    TestBed.flushEffects();
    expect(service.themeMode()).toBe('dark');
    expect(service.colorMode()).toBe('minimal');
    expect(service.shortcutsEnabled()).toBe(false);
  });
  it('does not send queued old-account changes when a response arrives before identity binding', () => {
    load();
    service.setThemeMode('dark');
    service.setColorMode('informative');
    const first = http.expectOne('/api/auth/preferences');
    user.set({ id: 'bob' });
    first.flush({ ...defaults, themeMode: 'dark' });
    http.expectNone('/api/auth/preferences');
    TestBed.flushEffects();
    http.expectOne('/api/auth/preferences').flush(defaults);
    expect(service.themeMode()).toBe('system');
    expect(service.colorMode()).toBe('minimal');
  });

  it('saves per-screen hint visibility alongside other account preferences', () => {
    load();
    service.setShowShortcutHints(false);
    const request = http.expectOne('/api/auth/preferences');
    expect(request.request.body.showShortcutHints).toBe(false);
    expect(request.request.body.themeMode).toBe('system');
    request.flush(request.request.body);
    expect(service.showShortcutHints()).toBe(false);
  });
});
