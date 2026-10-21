import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Renderer2,
  afterRenderEffect,
  inject,
} from '@angular/core';
import { UserPreferencesService } from '@core/preferences/user-preferences.service';
import { KeyboardShortcutService } from './keyboard-shortcut.service';

@Component({
  selector: 'app-shortcut-help',
  standalone: true,
  templateUrl: './shortcut-help.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShortcutHelpComponent {
  readonly preferences = inject(UserPreferencesService);
  readonly shortcuts = inject(KeyboardShortcutService);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);

  constructor() {
    let home: Node | null = null;
    let marker: Comment | null = null;
    afterRenderEffect(() => {
      const dialog = this.shortcuts.activeDialog();
      if (!home) {
        home = this.element.parentNode;
        if (home) {
          marker = this.renderer.createComment('shortcut-help');
          this.renderer.insertBefore(home, marker, this.element);
        }
      }
      if (!home) return;
      const destination = dialog?.querySelector('.p-dialog-content') ?? dialog;
      if (destination && this.element.parentNode !== destination)
        this.renderer.appendChild(destination, this.element);
      else if (!destination && this.element.parentNode !== home)
        this.renderer.insertBefore(home, this.element, marker);
    });
    inject(DestroyRef).onDestroy(() => {
      if (this.element.parentNode && this.element.parentNode !== home)
        this.renderer.removeChild(this.element.parentNode, this.element);
      if (marker?.parentNode) this.renderer.removeChild(marker.parentNode, marker);
    });
  }
}
