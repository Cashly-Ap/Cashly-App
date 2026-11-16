import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { UserPreferencesService } from '@core/preferences/user-preferences.service';
import { KeyboardShortcutService } from '@core/shortcuts/keyboard-shortcut.service';
import { ShortcutHelpComponent } from '@core/shortcuts/shortcut-help.component';

describe('contextual shortcut help', () => {
  const preferences = {
    ready: signal(true),
    shortcutsEnabled: signal(true),
    showShortcutHints: signal(true),
  };
  const shortcuts = {
    availableShortcuts: signal([
      { action: 'new', label: 'Nuevo registro', keys: 'N', code: 'KeyN' },
    ]),
    contextLabel: signal('Atajos de esta pantalla'),
    activeDialog: signal<HTMLElement | null>(null),
  };
  beforeEach(() => {
    preferences.ready.set(true);
    preferences.shortcutsEnabled.set(true);
    preferences.showShortcutHints.set(true);
    shortcuts.activeDialog.set(null);
    shortcuts.contextLabel.set('Atajos de esta pantalla');
    shortcuts.availableShortcuts.set([
      { action: 'new', label: 'Nuevo registro', keys: 'N', code: 'KeyN' },
    ]);
    TestBed.configureTestingModule({
      imports: [ShortcutHelpComponent],
      providers: [
        { provide: UserPreferencesService, useValue: preferences },
        { provide: KeyboardShortcutService, useValue: shortcuts },
      ],
    });
  });
  function render() {
    const fixture = TestBed.createComponent(ShortcutHelpComponent);
    fixture.detectChanges();
    return fixture;
  }
  it('shows only current available action hints', () => {
    const root = render().nativeElement as HTMLElement;
    expect(root.textContent).toContain('Nuevo registro');
    expect(root.querySelector('kbd')?.textContent?.trim()).toBe('N');
    expect(root.textContent).not.toContain('Abrir filtros');
  });
  it('reacts immediately when the display preference is disabled', () => {
    const fixture = render();
    preferences.showShortcutHints.set(false);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Atajos de esta pantalla"]'),
    ).toBeNull();
  });
  it('hides hints while shortcuts are disabled or account preferences are unavailable', () => {
    preferences.shortcutsEnabled.set(false);
    expect(render().nativeElement.querySelector('kbd')).toBeNull();
  });
  it('moves contextual help into the active dialog and returns it on close', () => {
    const fixture = render();
    const originalParent = fixture.nativeElement.parentNode;
    const modal = document.createElement('section');
    document.body.append(modal);
    shortcuts.contextLabel.set('Atajos de este diálogo');
    shortcuts.activeDialog.set(modal);
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(fixture.nativeElement.parentNode).toBe(modal);
    expect(modal.querySelector('kbd')?.textContent?.trim()).toBe('N');
    shortcuts.activeDialog.set(null);
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(fixture.nativeElement.parentNode).toBe(originalParent);
    modal.remove();
  });
  it('keeps enabled help visible even when no actions are currently executable', () => {
    shortcuts.availableShortcuts.set([]);
    const root = render().nativeElement as HTMLElement;
    expect(root.querySelector('[aria-label="Atajos de esta pantalla"]')).not.toBeNull();
    expect(root.textContent).toContain('Quitar foco del campo');
  });

});
