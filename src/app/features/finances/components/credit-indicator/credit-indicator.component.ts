import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-credit-indicator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TagModule],
  templateUrl: './credit-indicator.component.html',
})
export class CreditIndicatorComponent {
  readonly availableCredit = input<number>(0);
  readonly hasOverdue = input<boolean>(false);

  readonly status = computed(() => {
    if (this.hasOverdue()) {
      return { label: 'Bloqueado', severity: 'danger' as const };
    }
    if (this.availableCredit() <= 0) {
      return { label: 'Sin crédito', severity: 'danger' as const };
    }
    if (this.availableCredit() < 1000) {
      return { label: 'Crédito bajo', severity: 'warn' as const };
    }
    return { label: 'Disponible', severity: 'success' as const };
  });
}
