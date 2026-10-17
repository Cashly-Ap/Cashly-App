import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import {
  CashRegisterReportFilters,
  ReportType,
} from '@features/finance/treasury/cash-register/reporting/models/interfaces';
import { CustomerApiService } from '@features/partners/customers/services/api/customer-api.service';
import { ProductApiService } from '@features/catalog/products/services/api/product-api.service';
import { CategoryApiService } from '@features/catalog/categories/services/api/category-api.service';
import { forkJoin } from 'rxjs';

interface SelectOption {
  value: string | null;
  label: string;
}

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
    SelectButtonModule,
    SelectModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './cash-register-report-modal.component.html',
})
export class CashRegisterReportModalComponent {
  private readonly customerApi = inject(CustomerApiService);
  private readonly productApi = inject(ProductApiService);
  private readonly categoryApi = inject(CategoryApiService);

  readonly visible = input(false);
  readonly visibleChange = output<boolean>();
  readonly onGenerateReport = output<CashRegisterReportFilters>();

  readonly dateFrom = signal<Date | null>(null);
  readonly dateTo = signal<Date | null>(null);
  readonly reportType = signal<ReportType>('DETAILED');
  readonly format = signal<'PDF' | 'EXCEL'>('PDF');
  readonly customerId = signal<string | null>(null);
  readonly productId = signal<string | null>(null);
  readonly categoryId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly invalidDateRange = computed(() => {
    const from = this.dateFrom();
    const to = this.dateTo();
    return !!from && !!to && from > to;
  });
  private filtersLoaded = false;

  readonly typeOptions = [
    { label: 'Simple', value: 'SIMPLE' as ReportType },
    { label: 'Detallado', value: 'DETAILED' as ReportType },
    { label: 'Agrupado por cliente', value: 'GROUPED' as ReportType },
  ];

  readonly formatOptions = [
    { label: 'PDF', value: 'PDF' as const, icon: 'pi pi-file-pdf' },
    { label: 'Excel', value: 'EXCEL' as const, icon: 'pi pi-file-excel' },
  ];

  readonly customerOptions = signal<SelectOption[]>([{ value: null, label: 'Todos los clientes' }]);
  readonly productOptions = signal<SelectOption[]>([{ value: null, label: 'Todos los productos' }]);
  readonly categoryOptions = signal<SelectOption[]>([
    { value: null, label: 'Todas las categorías' },
  ]);

  loadFilters(): void {
    if (this.filtersLoaded) return;
    this.filtersLoaded = true;
    this.loading.set(true);
    forkJoin({
      customers: this.customerApi.getAll({ size: 1000 }),
      products: this.productApi.getAllSimple(),
      categories: this.categoryApi.getAll({ size: 1000 }),
    }).subscribe({
      next: ({ customers, products, categories }) => {
        this.customerOptions.set([
          { value: null, label: 'Todos los clientes' },
          ...(customers.content ?? []).map((customer) => ({
            value: customer.id,
            label: customer.legalName,
          })),
        ]);
        this.productOptions.set([
          { value: null, label: 'Todos los productos' },
          ...products.map((product) => ({ value: product.id, label: product.name })),
        ]);
        this.categoryOptions.set([
          { value: null, label: 'Todas las categorías' },
          ...(categories.content ?? []).map((category) => ({
            value: category.id,
            label: category.name,
          })),
        ]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onHide(): void {
    this.visibleChange.emit(false);
  }

  generateReport(): void {
    const from = this.dateFrom();
    const to = this.dateTo();
    if (!from || !to || this.invalidDateRange()) return;

    this.onGenerateReport.emit({
      dateFrom: formatDate(from),
      dateTo: formatDate(to),
      type: this.reportType(),
      format: this.format(),
      customerId: this.customerId() ?? undefined,
      productId: this.productId() ?? undefined,
      categoryId: this.categoryId() ?? undefined,
    });
  }
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
