import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { UserPreferencesService } from '@core/preferences/user-preferences.service';
import { KeyboardShortcutService } from '@core/shortcuts/keyboard-shortcut.service';

describe('KeyboardShortcutService', () => {
  let service: KeyboardShortcutService;
  const enabled = signal(false);
  const ready = signal(true);
  const press = (
    code: string,
    target: Element = document.body,
    overrides: KeyboardEventInit = {},
  ) => {
    const event = new KeyboardEvent('keydown', {
      code,
      altKey: false,
      shiftKey: false,
      bubbles: true,
      cancelable: true,
      ...overrides,
    });
    target.dispatchEvent(event);
    return event;
  };
  const button = (
    action: 'new' | 'submit' | 'cancel' = 'new',
    parent: HTMLElement = document.body,
  ) => {
    const element = document.createElement('button');
    parent.append(element);
    const execute = vi.fn();
    const cleanup = service.register(element, action, execute);
    return { element, execute, cleanup };
  };
  beforeEach(() => {
    enabled.set(false);
    ready.set(true);
    TestBed.configureTestingModule({
      providers: [
        { provide: UserPreferencesService, useValue: { shortcutsEnabled: enabled, ready } },
      ],
    });
    service = TestBed.inject(KeyboardShortcutService);
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    document.body.replaceChildren();
  });
  it('is off by default and executes once when enabled', () => {
    const action = button();
    press('KeyN');
    expect(action.execute).not.toHaveBeenCalled();
    enabled.set(true);
    expect(press('KeyN').defaultPrevented).toBe(true);
    expect(action.execute).toHaveBeenCalledTimes(1);
  });
  it('ignores typing, composition, repeats, native modifier combinations and cancelled events', () => {
    enabled.set(true);
    const action = button();
    const input = document.createElement('input');
    document.body.append(input);
    press('KeyN', input);
    press('KeyN', document.body, { repeat: true });
    press('KeyN', document.body, { isComposing: true });
    press('KeyN', document.body, { ctrlKey: true });
    press('KeyN', document.body, { metaKey: true });
    expect(action.execute).not.toHaveBeenCalled();
  });
  it('rejects disabled, hidden, inert, detached and permission-hidden buttons', () => {
    enabled.set(true);
    const action = button();
    action.element.disabled = true;
    press('KeyN');
    action.element.disabled = false;
    action.element.hidden = true;
    press('KeyN');
    action.element.hidden = false;
    action.element.setAttribute('inert', '');
    press('KeyN');
    action.element.removeAttribute('inert');
    action.element.style.display = 'none';
    press('KeyN');
    action.element.style.display = '';
    action.element.setAttribute('aria-hidden', 'true');
    press('KeyN');
    action.element.removeAttribute('aria-hidden');
    action.element.remove();
    press('KeyN');
    expect(action.execute).not.toHaveBeenCalled();
  });
  it('unregisters destroyed controls', () => {
    enabled.set(true);
    const action = button();
    action.cleanup();
    press('KeyN');
    expect(action.execute).not.toHaveBeenCalled();
  });
  it('prioritizes modal actions and blocks page navigation', () => {
    enabled.set(true);
    const background = button('submit');
    const navigate = vi.fn();
    service.registerNavigation(navigate);
    const modal = document.createElement('section');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.append(modal);
    const foreground = button('submit', modal);
    press('KeyG');
    press('KeyM');
    expect(foreground.execute).toHaveBeenCalledTimes(1);
    expect(background.execute).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
  it('never accepts alert dialogs', () => {
    enabled.set(true);
    const modal = document.createElement('section');
    modal.setAttribute('role', 'alertdialog');
    document.body.append(modal);
    const action = button('submit', modal);
    press('KeyG');
    expect(action.execute).not.toHaveBeenCalled();
  });
  it('opens authorized navigation and unregisters its owner', () => {
    enabled.set(true);
    const navigate = vi.fn();
    const cleanup = service.registerNavigation(navigate);
    press('KeyM');
    expect(navigate).toHaveBeenCalledTimes(1);
    cleanup();
    press('KeyM');
    expect(navigate).toHaveBeenCalledTimes(1);
  });
  it('uses physical codes independently from generated keyboard characters', () => {
    enabled.set(true);
    const action = button();
    press('KeyN', document.body, { key: '˜' });
    expect(action.execute).toHaveBeenCalledTimes(1);
  });
  it('ignores an event already handled by another control', () => {
    enabled.set(true);
    const action = button();
    const event = new KeyboardEvent('keydown', {
      code: 'KeyN',
      altKey: false,
      shiftKey: false,
      bubbles: true,
      cancelable: true,
    });
    event.preventDefault();
    document.body.dispatchEvent(event);
    expect(action.execute).not.toHaveBeenCalled();
  });
  it('respects permission hiding on the PrimeNG component host', () => {
    enabled.set(true);
    const host = document.createElement('p-button');
    host.style.display = 'none';
    document.body.append(host);
    const action = button('new', host);
    press('KeyN');
    expect(action.execute).not.toHaveBeenCalled();
  });

  it('waits for account preferences before enabling a cached shortcut', () => {
    enabled.set(true);
    ready.set(false);
    const action = button();
    press('KeyN');
    expect(action.execute).not.toHaveBeenCalled();
  });
  it('never submits when typing a single-letter shortcut inside a form', () => {
    enabled.set(true);
    const form = document.createElement('form');
    document.body.append(form);
    const field = document.createElement('input');
    form.append(field);
    const related = button('submit', form);
    press('KeyG', field);
    expect(related.execute).not.toHaveBeenCalled();
  });
  it('does not cancel an unrelated form while typing outside a form', () => {
    enabled.set(true);
    const action = button('cancel');
    const field = document.createElement('textarea');
    document.body.append(field);
    press('Escape', field);
    expect(action.execute).not.toHaveBeenCalled();
  });
  it('leaves modal Escape to its native handler without cancelling the background form', () => {
    enabled.set(true);
    const background = button('cancel');
    const modal = document.createElement('section');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.append(modal);
    const field = document.createElement('input');
    modal.append(field);
    const dialogAction = button('cancel', modal);
    const nativeClose = vi.fn();
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' || (event as KeyboardEvent).code === 'Escape') {
        nativeClose();
        modal.remove();
      }
    });
    field.focus();
    press('Escape', field);
    expect(nativeClose).not.toHaveBeenCalled();
    press('Escape', modal);
    expect(nativeClose).toHaveBeenCalledTimes(1);
    expect(dialogAction.execute).not.toHaveBeenCalled();
    expect(background.execute).not.toHaveBeenCalled();
  });
  it('first Escape leaves a field without cancelling, second Escape can cancel', () => {
    enabled.set(true);
    const form = document.createElement('form');
    document.body.append(form);
    const field = document.createElement('input');
    form.append(field);
    field.focus();
    const action = button('cancel', form);
    press('Escape', field);
    expect(document.activeElement).not.toBe(field);
    expect(action.execute).not.toHaveBeenCalled();
    press('Escape');
    expect(action.execute).toHaveBeenCalledOnce();
  });
  it('scrolls with J/K and repeats but leaves typed letters and browser combinations alone', () => {
    enabled.set(true);
    const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => undefined);
    press('KeyJ');
    press('KeyK', document.body, { repeat: true });
    expect(scroll.mock.calls.map((call) => call[0])).toEqual([
      { top: 96, behavior: 'auto' },
      { top: -96, behavior: 'auto' },
    ]);
    const field = document.createElement('input');
    document.body.append(field);
    field.focus();
    press('KeyJ', field);
    press('KeyK', field);
    press('KeyJ', document.body, { ctrlKey: true });
    expect(scroll).toHaveBeenCalledTimes(2);
    scroll.mockRestore();
  });
  it('preserves an open selection popup instead of submitting its background form', () => {
    enabled.set(true);
    const action = button('submit');
    const list = document.createElement('div');
    list.setAttribute('role', 'listbox');
    document.body.append(list);
    press('KeyG');
    expect(action.execute).not.toHaveBeenCalled();
  });
  it('does not treat an unrendered PrimeNG alert-dialog host as an active modal', () => {
    enabled.set(true);
    const placeholder = document.createElement('p-dialog');
    placeholder.setAttribute('role', 'alertdialog');
    document.body.append(placeholder);
    const action = button();
    press('KeyN');
    expect(action.execute).toHaveBeenCalledTimes(1);
  });

  it('preserves browser and OS modifier combinations', () => {
    enabled.set(true);
    const action = button();
    press('KeyN', document.body, { altKey: true });
    press('KeyN', document.body, { ctrlKey: true });
    press('KeyN', document.body, { metaKey: true });
    expect(action.execute).not.toHaveBeenCalled();
  });
  it('reactively advertises enabled visible actions and removes disabled or hidden actions', async () => {
    enabled.set(true);
    const action = button();
    TestBed.flushEffects();
    await Promise.resolve();
    expect(service.availableShortcuts().map((item) => item.keys)).toEqual(['N']);
    action.element.disabled = true;
    await Promise.resolve();
    await Promise.resolve();
    expect(service.availableShortcuts()).toEqual([]);
    action.element.disabled = false;
    action.element.hidden = true;
    await Promise.resolve();
    await Promise.resolve();
    expect(service.availableShortcuts()).toEqual([]);
    action.element.hidden = false;
    await Promise.resolve();
    await Promise.resolve();
    expect(service.availableShortcuts().map((item) => item.keys)).toEqual(['N']);
    action.cleanup();
    await Promise.resolve();
    expect(service.availableShortcuts()).toEqual([]);
  });
  it('advertises only foreground dialog actions when the dialog opens and restores page actions on close', async () => {
    enabled.set(true);
    button();
    service.registerNavigation(vi.fn());
    TestBed.flushEffects();
    await Promise.resolve();
    const modal = document.createElement('section');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.append(modal);
    button('submit', modal);
    await Promise.resolve();
    await Promise.resolve();
    expect(service.availableShortcuts().map((item) => item.keys)).toEqual(['G']);
    expect(service.contextLabel()).toBe('Atajos de este diálogo');
    expect(service.activeDialog()).toBe(modal);
    modal.remove();
    await Promise.resolve();
    await Promise.resolve();
    expect(service.availableShortcuts().map((item) => item.keys)).toEqual(['N', 'M']);
    expect(service.activeDialog()).toBeNull();
  });
  it('keeps help state empty while shortcuts are off or preferences are loading', async () => {
    button();
    TestBed.flushEffects();
    await Promise.resolve();
    expect(service.availableShortcuts()).toEqual([]);
    enabled.set(true);
    ready.set(false);
    TestBed.flushEffects();
    await Promise.resolve();
    expect(service.availableShortcuts()).toEqual([]);
  });
  it('keeps page help and actions when a non-modal filter popup uses dialog ARIA', async () => {
    enabled.set(true); button(); service.registerNavigation(vi.fn());
    TestBed.flushEffects(); await Promise.resolve();
    const popup = document.createElement('div');
    popup.className = 'p-popover'; popup.setAttribute('role', 'dialog'); popup.setAttribute('aria-modal', 'true');
    document.body.append(popup); await Promise.resolve(); await Promise.resolve();
    expect(service.activeDialog()).toBeNull();
    expect(service.availableShortcuts().map(item => item.keys)).toEqual(['N', 'M']);
    popup.remove();
  });

});
