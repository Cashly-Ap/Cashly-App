import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
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
import { ProductApiService } from '@features/products/services/api/product-api.service';
import { CategoryApiService } from '@features/categories/services/api/category-api.service';

interface SelectOption {
  value: string | null;
  label: string;
}

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
  private readonly productApi = inject(ProductApiService);
  private readonly categoryApi = inject(CategoryApiService);

  readonly visible = input(false);
  readonly visibleChange = output<boolean>();
  readonly onGeneratePdf = output<OrdersPdfFilters>();

  readonly dateFrom = signal<Date | null>(null);
  readonly dateTo = signal<Date | null>(null);
  readonly status = signal<string | null>(null);
  readonly productId = signal<string | null>(null);
  readonly categoryId = signal<string | null>(null);
  readonly mode = signal<'SIMPLE' | 'DETAILED'>('SIMPLE');

  readonly statusOptions: SelectOption[] = [
    { value: null, label: 'Todos los estados' },
    { value: 'DRAFT', label: 'Borrador' },
    { value: 'CONFIRMED', label: 'Confirmado' },
    { value: 'INVOICED', label: 'Facturado' },
    { value: 'CANCELLED', label: 'Cancelado' },
  ];

  readonly modeOptions: SelectOption[] = [
    { value: 'SIMPLE', label: 'Simple' },
    { value: 'DETAILED', label: 'Detallado' },
  ];

  readonly productOptions = signal<SelectOption[]>([{ value: null, label: 'Todos los productos' }]);
  readonly categoryOptions = signal<SelectOption[]>([{ value: null, label: 'Todas las categorías' }]);

  ngOnInit(): void {
    this.productApi.getAllSimple().subscribe((products) => {
      this.productOptions.set([
        { value: null, label: 'Todos los productos' },
        ...products.map((p) => ({ value: p.id, label: p.name })),
      ]);
    });

    this.categoryApi.getAll({ size: 1000 }).subscribe((response) => {
      this.categoryOptions.set([
        { value: null, label: 'Todas las categorías' },
        ...(response.content ?? []).map((c) => ({ value: c.id, label: c.name })),
      ]);
    });
  }

  onHide(): void {
    this.visibleChange.emit(false);
  }

  generatePdf(): void {
    const filters: OrdersPdfFilters = {
      dateFrom: this.dateFrom() ? this.formatDate(this.dateFrom()!) : undefined,
      dateTo: this.dateTo() ? this.formatDate(this.dateTo()!) : undefined,
      status: this.status() ?? undefined,
      productId: this.productId() ?? undefined,
      categoryId: this.categoryId() ?? undefined,
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