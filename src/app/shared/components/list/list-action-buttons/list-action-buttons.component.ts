import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';

export interface ListAction {
  label: string;
  icon: string;
  command: () => void;
  danger?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'app-list-action-buttons',
  standalone: true,
  imports: [ButtonModule, PopoverModule, TooltipModule],
  templateUrl: './list-action-buttons.component.html',
  host: { class: 'flex w-full justify-center' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListActionButtonsComponent {
  readonly actions = input.required<readonly ListAction[]>();
  readonly ariaLabel = input('Abrir acciones del registro');
  readonly orderedActions = computed(() => {
    const priorities = new Map([
      ['Ver detalle', 0],
      ['Editar', 1],
      ['Eliminar', 2],
    ]);
    return this.actions()
      .map((action, index) => ({ action, index }))
      .sort(
        (left, right) =>
          (priorities.get(left.action.label) ?? 3) - (priorities.get(right.action.label) ?? 3) ||
          left.index - right.index,
      )
      .map(({ action }) => action);
  });
}
