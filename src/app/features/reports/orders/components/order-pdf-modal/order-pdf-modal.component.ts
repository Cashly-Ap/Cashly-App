import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  OnInit,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { OrderPdfApiService, OrdersPdfFilters } from '../../services/api/order-pdf-api.service';

@Component({
  selector: 'app-order-pdf-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
  ],
  templateUrl: './order-pdf-modal.component.html',
})
export class OrderPdfModalComponent implements OnInit {
  private readonly orderPdfApi = inject(OrderPdfApiService);

  readonly visible = input(false);
  readonly visibleChange = output<boolean>();
  readonly onGeneratePdf = output<OrdersPdfFilters>();

  readonly status = signal<string | null>(null);
  readonly fromDate = signal<Date | null>(null);
  readonly toDate = signal<Date | null>(null);
  readonly mode = signal<'simple' | 'detailed'>('simple');

  readonly statusOptions = [
    { value: null, label: 'Todos los estados' },
    { value: 'DRAFT', label: 'Borrador' },
    { value: 'CONFIRMED', label: 'Confirmado' },
    { value: 'INVOICED', label: 'Facturado' },
    { value: 'CANCELLED', label: 'Cancelado' },
  ];

  readonly modeOptions = [
    { value: 'simple', label: 'Simple' },
    { value: 'detailed', label: 'Detallado' },
  ];

  ngOnInit(): void {
    // No need to load data here, filters are applied on the backend
  }

  onHide(): void {
    this.visibleChange.emit(false);
  }

  generatePdf(): void {
    const filters: OrdersPdfFilters = {
      status: this.status() ?? undefined,
      fromDate: this.fromDate() ? this.formatDate(this.fromDate()!) : undefined,
      toDate: this.toDate() ? this.formatDate(this.toDate()!) : undefined,
      mode: this.mode(),
    };

    this.onGeneratePdf.emit(filters);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}