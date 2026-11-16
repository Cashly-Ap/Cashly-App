import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserPreferencesService } from '@core/preferences/user-preferences.service';
import { PreferencesPageComponent } from '@features/platform/auth/pages/preferences/preferences-page.component';
import { NotificationPreferencesService } from '@features/platform/notifications/services/state/notification-preferences.service';
import { MessageService } from 'primeng/api';

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
  apply: vi.fn(),
  retry: vi.fn(),
};
const messages = { add: vi.fn() };
const notificationPreferences = {
  loading: signal(false),
  saving: signal(false),
  error: signal<string | null>(null),
  ready: signal(true),
  enabled: signal(true),
  modules: signal([
    { module: 'USERS', labelKey: 'users', enabled: true },
    { module: 'ROLES', labelKey: 'roles', enabled: false },
  ]),
  setEnabled: vi.fn(),
  setModuleEnabled: vi.fn(),
  retry: vi.fn(),
};

function findButton(root: HTMLElement, label: string): HTMLButtonElement {
  const button = Array.from(root.querySelectorAll('button')).find((element) =>
    element.textContent?.trim().includes(label),
  );
  expect(button, `button "${label}"`).toBeDefined();
  return button as HTMLButtonElement;
}

describe('personal settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    preferences.loading.set(false);
    preferences.saving.set(false);
    preferences.ready.set(true);
    preferences.error.set(null);
    preferences.themeMode.set('system');
    preferences.colorMode.set('minimal');
    preferences.shortcutsEnabled.set(false);
    preferences.showShortcutHints.set(true);
    TestBed.configureTestingModule({
      imports: [PreferencesPageComponent],
      providers: [
        { provide: UserPreferencesService, useValue: preferences },
        { provide: NotificationPreferencesService, useValue: notificationPreferences },
        { provide: MessageService, useValue: messages },
      ],
    });
  });

  it('shows the saved preferences as a read-only summary before editing', () => {
    const fixture = TestBed.createComponent(PreferencesPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('input')).toBeNull();
    expect(root.textContent).toContain('Español');
    expect(root.textContent).toContain('Del sistema');
    expect(root.textContent).toContain('Minimalista');
    expect(root.textContent).toContain('1 / 2');
    expect(root.querySelectorAll('kbd').length).toBeGreaterThan(0);

    findButton(root, 'Editar').click();
    fixture.detectChanges();

    expect(root.querySelectorAll('[role=tab]')).toHaveLength(2);
    expect(root.querySelectorAll('app-select-input')).toHaveLength(4);
    expect(root.querySelector('p-toggleswitch')).not.toBeNull();
  });

  it('sends the changed preferences to the server only after saving', () => {
    const fixture = TestBed.createComponent(PreferencesPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const component = fixture.componentInstance;

    findButton(root, 'Editar').click();
    fixture.detectChanges();

    component.form.controls.themeMode.setValue('dark');
    component.form.controls.colorMode.setValue('informative');
    component.form.controls.shortcutsEnabled.setValue(true);
    component.form.controls.showShortcutHints.setValue(false);

    expect(preferences.apply).not.toHaveBeenCalled();
    expect(preferences.setThemeMode).not.toHaveBeenCalled();
    expect(preferences.setColorMode).not.toHaveBeenCalled();

    component.form.markAsDirty();
    root.querySelector('form')!.dispatchEvent(new Event('submit'));

    expect(preferences.apply).toHaveBeenCalledWith({
      language: 'es',
      themeMode: 'dark',
      colorMode: 'informative',
      shortcutsEnabled: true,
      showShortcutHints: false,
    });
  });

  it('shows a success message and closes the form once the save completes', () => {
    const fixture = TestBed.createComponent(PreferencesPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const component = fixture.componentInstance;

    findButton(root, 'Editar').click();
    fixture.detectChanges();
    component.form.controls.themeMode.setValue('dark');
    component.form.markAsDirty();
    root.querySelector('form')!.dispatchEvent(new Event('submit'));

    preferences.saving.set(true);
    fixture.detectChanges();
    preferences.saving.set(false);
    fixture.detectChanges();

    expect(messages.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        detail: 'Preferencias actualizadas correctamente',
      }),
    );
    expect(root.querySelector('app-select-input')).toBeNull();
  });

  it('keeps the form untouched until the user saves', () => {
    const fixture = TestBed.createComponent(PreferencesPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    findButton(root, 'Editar').click();
    fixture.detectChanges();

    expect(findButton(root, 'Guardar cambios').disabled).toBe(true);
    expect(root.querySelectorAll('app-select-input')).toHaveLength(4);
  });

  it('returns to the read-only summary from the form', () => {
    const fixture = TestBed.createComponent(PreferencesPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    findButton(root, 'Editar').click();
    fixture.detectChanges();
    findButton(root, 'Volver a la configuración').click();
    fixture.detectChanges();

    expect(root.querySelector('input')).toBeNull();
    expect(root.textContent).toContain('Del sistema');
  });

  it('prevents entering the form while account settings are loading', () => {
    preferences.loading.set(true);
    const fixture = TestBed.createComponent(PreferencesPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(findButton(root, 'Editar').disabled).toBe(true);
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
