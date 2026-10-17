import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';

@Component({
  selector: 'app-list-container',
  standalone: true,
  imports: [ContentCardComponent],
  templateUrl: './list-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class ListContainerComponent {}
