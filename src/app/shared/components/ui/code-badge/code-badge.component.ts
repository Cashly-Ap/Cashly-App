import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-code-badge',
  standalone: true,
  templateUrl: './code-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeBadgeComponent {
  readonly label = input.required<string>();
}
