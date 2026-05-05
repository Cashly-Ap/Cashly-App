import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-convert-to-invoice-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule, DecimalPipe],
  templateUrl: './convert-to-invoice-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConvertToInvoiceDialogComponent {
  readonly visible = input<boolean>(false);
  readonly orderNumber = input<string>('');
  readonly customerName = input<string>('');
  readonly totalAmount = input<number>(0);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
