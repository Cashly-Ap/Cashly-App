import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-list-action-buttons',
  standalone: true,
  imports: [ButtonModule, TooltipModule],
  templateUrl: './list-action-buttons.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListActionButtonsComponent {
  showView = input<boolean>(true);
  showEdit = input<boolean>(true);
  showDelete = input<boolean>(true);
  showPrint = input<boolean>(false);
  showPayment = input<boolean>(false);
  showCancel = input<boolean>(false);
  showDeliver = input<boolean>(false);

  view = output<void>();
  edit = output<void>();
  delete = output<void>();
  print = output<void>();
  payment = output<void>();
  cancel = output<void>();
  deliver = output<void>();
}
