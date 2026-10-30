import { TranslatePipe } from '@core/i18n/translate.pipe';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  viewChild,
} from '@angular/core';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';

@Component({
  selector: 'app-detail-actions-menu',
  standalone: true,
  imports: [TranslatePipe, ButtonModule, PopoverModule],
  templateUrl: './detail-actions-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailActionsMenuComponent {
  private readonly actions = contentChildren(PermissionDirective, { descendants: true });
  readonly hasActions = computed(() => this.actions().some((action) => action.allowed()));
  private readonly popover = viewChild.required<Popover>('actionsPopover');

  hide(): void {
    this.popover().hide();
  }
}
