import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-content-card',
  standalone: true,
  templateUrl: './content-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentCardComponent {}
