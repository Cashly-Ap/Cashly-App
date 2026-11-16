import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
@Component({
  selector: 'app-list-container',
  standalone: true,
  imports: [PanelCardComponent],
  templateUrl: './list-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class ListContainerComponent {}
