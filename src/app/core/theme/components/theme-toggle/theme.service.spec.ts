import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID, signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserPreferencesService, ThemeMode } from '@core/preferences/user-preferences.service';
import { ThemeService } from '@core/theme/components/theme-toggle/theme.service';

describe('ThemeService', () => {
  const themeMode = signal<ThemeMode>('system');
  let listener: ((event: MediaQueryListEvent) => void) | undefined;
  let removeEventListener: ReturnType<typeof vi.fn>;
  const setThemeMode = vi.fn((mode: ThemeMode) => themeMode.set(mode));

  beforeEach(() => {
    themeMode.set('system');
    setThemeMode.mockClear();
    document.documentElement.classList.remove('my-app-dark');
    removeEventListener = vi.fn();
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn((_name, callback) => { listener = callback; }),
      removeEventListener,
    })));
    TestBed.configureTestingModule({ providers: [
      ThemeService,
      { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: UserPreferencesService, useValue: { themeMode, setThemeMode } },
    ] });
  });

  function create(): ThemeService {
    const service = TestBed.inject(ThemeService);
    TestBed.tick();
    return service;
  }

  it('follows system changes while mode remains system', () => {
    const service = create();
    expect(service.isDarkMode()).toBe(false);
    listener?.({ matches: true } as MediaQueryListEvent);
    TestBed.tick();
    expect(service.isDarkMode()).toBe(true);
    expect(document.documentElement.classList.contains('my-app-dark')).toBe(true);
    expect(themeMode()).toBe('system');
    expect(setThemeMode).not.toHaveBeenCalled();
  });

  it('keeps explicit modes independent of system changes and can return to system', () => {
    const service = create();
    service.setMode('light');
    listener?.({ matches: true } as MediaQueryListEvent);
    expect(service.isDarkMode()).toBe(false);
    service.setMode('dark');
    listener?.({ matches: false } as MediaQueryListEvent);
    expect(service.isDarkMode()).toBe(true);
    service.setMode('system');
    expect(service.isDarkMode()).toBe(false);
  });

  it('toggles to the opposite explicit preference', () => {
    const service = create();
    service.toggleTheme();
    expect(setThemeMode).toHaveBeenLastCalledWith('dark');
    service.toggleTheme();
    expect(setThemeMode).toHaveBeenLastCalledWith('light');
  });

  it('cleans up the system theme listener', () => {
    create();
    TestBed.resetTestingModule();
    expect(removeEventListener).toHaveBeenCalledWith('change', listener);
  });

  it('does not access media queries on the server', () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    expect(create().isDarkMode()).toBe(false);
    expect(window.matchMedia).not.toHaveBeenCalled();
  });
});
