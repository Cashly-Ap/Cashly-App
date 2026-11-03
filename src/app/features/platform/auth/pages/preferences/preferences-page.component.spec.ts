import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserPreferencesService } from '@core/preferences/user-preferences.service';
import { PreferencesPageComponent } from '@features/platform/auth/pages/preferences/preferences-page.component';

describe('personal settings controls', () => {
  const preferences = {
    language: signal('es'),
    setLanguage: vi.fn(),
    themeMode: signal('system'),
    colorMode: signal('minimal'),
    shortcutsEnabled: signal(false),
    showShortcutHints: signal(true),
    loading: signal(false),
    saving: signal(false),
    ready: signal(true),
    error: signal<string | null>(null),
    setThemeMode: vi.fn(),
    setColorMode: vi.fn(),
    setShortcutsEnabled: vi.fn(),
    setShowShortcutHints: vi.fn(),
    retry: vi.fn(),
  };
  beforeEach(() => {
    vi.clearAllMocks();
    preferences.loading.set(false);
    preferences.error.set(null);
    TestBed.configureTestingModule({
      imports: [PreferencesPageComponent],
      providers: [{ provide: UserPreferencesService, useValue: preferences }],
    });
  });
  it('changes only the selected personal preference and documents actual shortcuts', () => {
    const fixture = TestBed.createComponent(PreferencesPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    root.querySelector<HTMLInputElement>('input[value=dark]')!.click();
    root.querySelector<HTMLInputElement>('input[value=informative]')!.click();
    root.querySelector<HTMLInputElement>('input[type=checkbox]')!.click();
    expect(preferences.setThemeMode).toHaveBeenCalledWith('dark');
    expect(preferences.setColorMode).toHaveBeenCalledWith('informative');
    expect(preferences.setShortcutsEnabled).toHaveBeenCalledWith(true);
    root
      .querySelector<HTMLInputElement>('input[aria-label="Mostrar atajos en cada pantalla"]')!
      .click();
    expect(preferences.setShowShortcutHints).toHaveBeenCalledWith(false);
    expect(root.querySelectorAll('kbd')).toHaveLength(6);
  });
  it('prevents preference updates while account settings are loading', () => {
    preferences.loading.set(true);
    const fixture = TestBed.createComponent(PreferencesPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('input[value=dark]')?.matches(':disabled')).toBe(true);
    expect(root.querySelector('input[type=checkbox]')?.matches(':disabled')).toBe(true);
    expect(root.textContent).toContain('Cargando tu configuración');
  });
  it('exposes a retry action after a failed save', () => {
    preferences.error.set('No se pudo guardar');
    const fixture = TestBed.createComponent(PreferencesPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[role=alert]')?.textContent).toContain('No se pudo guardar');
    root.querySelector<HTMLButtonElement>('button[aria-label="Reintentar configuración"]')!.click();
    expect(preferences.retry).toHaveBeenCalledOnce();
  });
});
