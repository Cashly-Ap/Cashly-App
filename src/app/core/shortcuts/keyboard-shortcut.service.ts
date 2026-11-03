import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject, signal, effect } from '@angular/core';
import { UserPreferencesService } from '@core/preferences/user-preferences.service';
import { KEYBOARD_ACTION_SHORTCUTS, ShortcutAction, ShortcutBinding } from '@core/shortcuts/shortcut-reference';

interface ShortcutRegistration {
  element: HTMLElement;
  action: ShortcutAction;
  execute: () => void;
}

@Injectable({ providedIn: 'root' })
export class KeyboardShortcutService {
  private readonly document = inject(DOCUMENT);
  private readonly preferences = inject(UserPreferencesService);
  private readonly registrations = new Set<ShortcutRegistration>();
  private navigation: (() => void) | null = null;
  private readonly nativeEscapes = new WeakSet<KeyboardEvent>();
  private queued = false;
  private destroyed = false;
  readonly availableShortcuts = signal<readonly ShortcutBinding[]>([]);
  readonly activeDialog = signal<HTMLElement | null>(null);
  readonly contextLabel = signal('Atajos de esta pantalla');

  constructor() {
    effect(() => {
      this.preferences.ready();
      this.preferences.shortcutsEnabled();
      this.scheduleRefresh();
    });
    const capture = (event: KeyboardEvent) => {
      if (
        event.code === 'Escape' &&
        !event.isComposing &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        this.preferences.ready() &&
        this.preferences.shortcutsEnabled() &&
        !this.selectionOpen() &&
        !this.popoverOpen() &&
        this.editable(event.target)
      ) {
        event.preventDefault();
        event.stopPropagation();
        this.releaseFocus();
        return;
      }
      if (event.code === 'Escape' && (this.modal() || this.selectionOpen() || this.popoverOpen()))
        this.nativeEscapes.add(event);
    };
    const listener = (event: KeyboardEvent) => this.dispatch(event);
    this.document.addEventListener('keydown', capture, true);
    this.document.addEventListener('keydown', listener);
    const observer =
      typeof MutationObserver !== 'undefined'
        ? new MutationObserver(() => this.scheduleRefresh())
        : null;
    observer?.observe(this.document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        'disabled',
        'hidden',
        'inert',
        'aria-hidden',
        'aria-disabled',
        'aria-busy',
        'aria-modal',
        'class',
        'style',
      ],
    });
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      observer?.disconnect();
      this.document.removeEventListener('keydown', capture, true);
      this.document.removeEventListener('keydown', listener);
    });
  }

  register(element: HTMLElement, action: ShortcutAction, execute: () => void): () => void {
    const registration = { element, action, execute };
    this.registrations.add(registration);
    this.scheduleRefresh();
    return () => {
      this.registrations.delete(registration);
      this.scheduleRefresh();
    };
  }

  registerNavigation(open: () => void): () => void {
    this.navigation = open;
    this.scheduleRefresh();
    return () => {
      if (this.navigation === open) this.navigation = null;
      this.scheduleRefresh();
    };
  }

  private scheduleRefresh(): void {
    if (this.queued || this.destroyed) return;
    this.queued = true;
    queueMicrotask(() => {
      this.queued = false;
      if (this.destroyed) return;
      const modal = this.modal();
      this.activeDialog.set(modal);
      this.contextLabel.set(modal ? 'Atajos de este diálogo' : 'Atajos de esta pantalla');
      const actions = this.candidates(modal);
      const next =
        !this.preferences.ready() || !this.preferences.shortcutsEnabled()
          ? []
          : KEYBOARD_ACTION_SHORTCUTS.filter((binding) =>
              binding.action === 'navigate'
                ? !modal && !!this.navigation
                : (binding.action === 'cancel' &&
                    !!modal?.querySelector('.p-dialog-close-button:not(:disabled)')) ||
                  actions.some((action) => action.action === binding.action),
            );
      if (
        next.map((item) => item.action).join() !==
        this.availableShortcuts()
          .map((item) => item.action)
          .join()
      )
        this.availableShortcuts.set(next);
    });
  }

  private dispatch(event: KeyboardEvent): void {
    if (
      !this.preferences.shortcutsEnabled() ||
      !this.preferences.ready() ||
      event.defaultPrevented ||
      (event.repeat && event.code !== 'KeyJ' && event.code !== 'KeyK') ||
      event.isComposing ||
      event.getModifierState('AltGraph') ||
      event.altKey ||
      event.shiftKey ||
      event.ctrlKey ||
      event.metaKey ||
      this.nativeEscapes.has(event)
    )
      return;
    if (
      (event.code === 'KeyJ' || event.code === 'KeyK') &&
      !this.editable(event.target) &&
      !this.selectionOpen()
    ) {
      event.preventDefault();
      const top = event.code === 'KeyJ' ? 96 : -96;
      const pane = this.modal()?.querySelector<HTMLElement>('.p-dialog-content');
      if (pane) pane.scrollBy({ top, behavior: 'auto' });
      else this.document.defaultView?.scrollBy({ top, behavior: 'auto' });
      return;
    }
    const shortcut = KEYBOARD_ACTION_SHORTCUTS.find((item) => item.code === event.code);
    if (!shortcut || this.selectionOpen()) return;
    const target = event.target instanceof Element ? event.target : null;
    const editable = target?.closest(
      'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"]',
    );
    if (editable && shortcut.action !== 'cancel') return;
    const modal = this.modal();
    if (shortcut.action === 'navigate') {
      if (modal || !this.navigation) return;
      event.preventDefault();
      this.navigation();
      return;
    }
    const candidates = this.candidates(modal).filter(
      (registration) =>
        registration.action === shortcut.action &&
        (!editable ||
          (!!editable.closest('form') &&
            registration.element.closest('form') === editable.closest('form'))),
    );
    const candidate =
      candidates.find((registration) =>
        registration.element.contains(this.document.activeElement),
      ) ?? candidates[0];
    if (!candidate) return;
    event.preventDefault();
    candidate.execute();
  }

  releaseFocus(): void {
    const active = this.document.activeElement;
    if (!(active instanceof HTMLElement)) return;
    const scope = active.closest('[data-keyboard-scope]');
    active.blur();
    scope?.querySelector<HTMLElement>('[data-focus-exit]')?.focus();
  }

  private editable(target: EventTarget | null): Element | null {
    return target instanceof Element
      ? target.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"]',
        )
      : null;
  }

  private candidates(modal: HTMLElement | null): ShortcutRegistration[] {
    return [...this.registrations].filter(
      (registration) =>
        this.available(registration.element) &&
        (!modal ||
          (modal.getAttribute('role') !== 'alertdialog' && modal.contains(registration.element))),
    );
  }

  private modal(): HTMLElement | null {
    return (
      [
        ...this.document.querySelectorAll<HTMLElement>(
          '[role="dialog"][aria-modal="true"], [role="alertdialog"]',
        ),
      ]
        .filter(
          (element) =>
            this.available(element, false) &&
            !element.closest('.p-popover, .p-select-overlay, .p-multiselect-overlay, .p-autocomplete-overlay, .p-datepicker-panel') &&
            !(element.matches('p-dialog') && element.childElementCount === 0),
        )
        .at(-1) ?? null
    );
  }

  private selectionOpen(): boolean {
    return [
      ...this.document.querySelectorAll<HTMLElement>(
        '[role="listbox"], .p-select-overlay, .p-multiselect-overlay, .p-autocomplete-overlay, .p-datepicker-panel',
      ),
    ].some((element) => this.available(element, false));
  }

  private popoverOpen(): boolean {
    return [...this.document.querySelectorAll<HTMLElement>('.p-popover')].some((element) =>
      this.available(element, false),
    );
  }

  private available(element: HTMLElement, actionableCheck = true): boolean {
    if (!element.isConnected) return false;
    const actionable =
      !actionableCheck || element.matches('button, input')
        ? element
        : (element.querySelector<HTMLElement>('button, input') ?? element);
    if (
      actionable.matches(':disabled, [aria-disabled="true"], .p-button-loading') ||
      actionable.closest('[inert], [hidden], [aria-hidden="true"], [aria-busy="true"]')
    )
      return false;
    for (
      let ancestor: HTMLElement | null = actionable;
      ancestor;
      ancestor = ancestor.parentElement
    ) {
      const style = this.document.defaultView?.getComputedStyle(ancestor);
      if (style?.display === 'none' || style?.visibility === 'hidden') return false;
    }
    return true;
  }
}
