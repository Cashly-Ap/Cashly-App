import { ChangeDetectionStrategy, Component, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { CashRegisterReportFilters } from '@features/reports/finance/models/interfaces';

@Component({
  selector: 'app-cash-register-report-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    DatePickerModule,
  ],
  templateUrl: './cash-register-report-modal.component.html',
})
export class CashRegisterReportModalComponent {
  readonly visible = input(false);
  readonly visibleChange = output<boolean>();
  readonly onGenerateExcel = output<CashRegisterReportFilters>();

  readonly dateFrom = signal<Date | null>(null);
  readonly dateTo = signal<Date | null>(null);

  onHide(): void {
    this.visibleChange.emit(false);
  }

  generateExcel(): void {
    const from = this.dateFrom();
    const to = this.dateTo();
    if (!from || !to) return;

    this.onGenerateExcel.emit({
      dateFrom: formatDate(from),
      dateTo: formatDate(to),
    });
  }
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
