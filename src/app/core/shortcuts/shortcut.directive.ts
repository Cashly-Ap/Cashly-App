import { DestroyRef, Directive, ElementRef, effect, inject, input } from '@angular/core';
import { KeyboardShortcutService } from '@core/shortcuts/keyboard-shortcut.service';
import { KEYBOARD_ACTION_SHORTCUTS, ShortcutAction } from '@core/shortcuts/shortcut-reference';

@Directive({ selector: '[appShortcut]', standalone: true })
export class ShortcutDirective {
  readonly appShortcut = input.required<ShortcutAction>();
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly shortcuts = inject(KeyboardShortcutService);

  constructor() {
    effect((onCleanup) => {
      const action = this.appShortcut();
      const host = this.element.nativeElement;
      const binding = KEYBOARD_ACTION_SHORTCUTS.find((item) => item.action === action);
      if (binding)
        host.setAttribute(
          'aria-keyshortcuts',
          `${binding.code.startsWith('Key') ? binding.code.slice(3) : binding.code}`,
        );
      onCleanup(
        this.shortcuts.register(host, action, () => {
          const target = host.matches('button, input')
            ? host
            : host.querySelector<HTMLElement>('button, input');
          if (action === 'search') target?.focus();
          else target?.click();
        }),
      );
    });
    inject(DestroyRef).onDestroy(() =>
      this.element.nativeElement.removeAttribute('aria-keyshortcuts'),
    );
  }
}
