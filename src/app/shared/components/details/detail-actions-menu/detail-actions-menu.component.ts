import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';

@Component({
  selector: 'app-detail-actions-menu',
  standalone: true,
  imports: [ButtonModule, PopoverModule],
  templateUrl: './detail-actions-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailActionsMenuComponent {
  private readonly popover = viewChild.required<Popover>('actionsPopover');

  hide(): void {
    this.popover().hide();
  }
}
