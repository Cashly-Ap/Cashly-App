import { LanguageService } from '@core/i18n/language.service';
import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ShortcutDirective } from '@core/shortcuts/shortcut.directive';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import { ChangeDetectionStrategy, Component, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProductApiService } from '@features/catalog/products/services/api/product-api.service';
import { CategoryApiService } from '@features/catalog/categories/services/api/category-api.service';

export interface QuotesPdfFilters {
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  status?: string;
  productId?: string;
  categoryId?: string;
  mode?: 'SIMPLE' | 'DETAILED';
}

interface SelectOption {
  value: string | null;
  label: string;
}

@Component({
  selector: 'app-quote-pdf-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateOptionsPipe,
    TranslatePipe,
    ShortcutDirective,
    PermissionDirective,
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './quote-pdf-modal.component.html',
})
export class QuotePdfModalComponent {
  readonly locale = inject(LanguageService).locale;

  private readonly productApi = inject(ProductApiService);
  private readonly categoryApi = inject(CategoryApiService);

  readonly visible = input(false);
  readonly visibleChange = output<boolean>();
  readonly onGeneratePdf = output<QuotesPdfFilters>();

  readonly dateFrom = signal<Date | null>(null);
  readonly dateTo = signal<Date | null>(null);
  readonly status = signal<string | null>(null);
  readonly productId = signal<string | null>(null);
  readonly categoryId = signal<string | null>(null);
  readonly mode = signal<'SIMPLE' | 'DETAILED'>('SIMPLE');

  readonly loading = signal(false);
  private filtersLoaded = false;

  readonly statusOptions: SelectOption[] = [
    { value: null, label: 'Todos los estados' },
    { value: 'DRAFT', label: 'Borrador' },
    { value: 'CONVERTED_TO_ORDER', label: 'Convertido a Pedido' },
    { value: 'CONVERTED_TO_INVOICE', label: 'Convertido a Factura' },
    { value: 'CANCELLED', label: 'Cancelado' },
  ];

  readonly modeOptions: SelectOption[] = [
    { value: 'SIMPLE', label: 'Simple' },
    { value: 'DETAILED', label: 'Detallado' },
  ];

  readonly productOptions = signal<SelectOption[]>([{ value: null, label: 'Todos los productos' }]);
  readonly categoryOptions = signal<SelectOption[]>([
    { value: null, label: 'Todas las categorías' },
  ]);

  loadFilters(): void {
    if (this.filtersLoaded) return;
    this.filtersLoaded = true;
    this.loading.set(true);

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
      this.loading.set(false);
    });
  }

  onHide(): void {
    this.visibleChange.emit(false);
  }

  generatePdf(): void {
    const filters: QuotesPdfFilters = {
      dateFrom: this.dateFrom() ? this.formatDate(this.dateFrom()!) : undefined,
      dateTo: this.dateTo() ? this.formatDate(this.dateTo()!) : undefined,
      status: this.status() ?? undefined,
      productId: this.productId() ?? undefined,
      categoryId: this.categoryId() ?? undefined,
      mode: this.mode(),
    };

    this.onGeneratePdf.emit(filters);
    this.visibleChange.emit(false);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
