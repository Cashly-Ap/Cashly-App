import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  active = input.required<boolean>();
  activeLabel = input<string>('Activo');
  inactiveLabel = input<string>('Inactivo');
}
