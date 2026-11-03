import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Popover, PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { SupplierApiService } from '@features/partners/suppliers/services/api/supplier-api.service';
import { SupplierList } from '@features/partners/suppliers/models/interfaces/supplier-list.interface';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import {
  SUPPLIER_TYPES,
  SupplierType,
  getSupplierTypeLabel,
} from '@features/partners/suppliers/models/enums/supplier-type.enum';

const PAGE_SIZE = 10;

import { ListFilterComponent } from '@shared/components/list/list-filter/list-filter.component';
import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';
@Component({
  selector: 'app-supplier-picker-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CancelButtonComponent,
    ListFilterComponent,
    TranslateOptionsPipe,
    TranslatePipe,
    DialogModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    PopoverModule,
    SelectModule,
    SearchFieldComponent,
  ],
  templateUrl: './supplier-picker-dialog.component.html',
})
export class SupplierPickerDialogComponent {
  private readonly supplierApi = inject(SupplierApiService);

  readonly visible = input<boolean>(false);
  readonly supplierSelected = output<SupplierList>();
  readonly cancelled = output<void>();

  readonly search = signal<string>('');
  readonly suppliers = signal<SupplierList[]>([]);
  readonly totalElements = signal<number>(0);
  readonly totalPages = signal<number>(0);
  readonly currentPage = signal<number>(0);
  readonly loading = signal<boolean>(false);

  readonly filterType = signal<SupplierType | null>(null);

  readonly supplierTypes = [...SUPPLIER_TYPES];
  readonly pageSize = PAGE_SIZE;
  readonly getSupplierTypeLabel = getSupplierTypeLabel;

  readonly pageLabel = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage() + 1;
    return total > 0 ? `Página ${current} de ${total}` : '';
  });

  readonly activeFilterCount = computed(() => {
    return this.filterType() !== null ? 1 : 0;
  });

  private initialized = false;

  onDialogShow(): void {
    if (!this.initialized) {
      this.initialized = true;
      this.load(0);
    }
    this.resetSelectionState();
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.load(0);
  }

  onPagePrev(): void {
    if (this.currentPage() > 0) {
      this.load(this.currentPage() - 1);
    }
  }

  onPageNext(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.load(this.currentPage() + 1);
    }
  }

  onSelect(supplier: SupplierList): void {
    this.supplierSelected.emit(supplier);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  selectType(type: SupplierType | null): void {
    this.filterType.set(type ?? null);
    this.load(0);
  }

  clearFilters(): void {
    this.filterType.set(null);
    this.load(0);
  }

  private load(page: number): void {
    this.loading.set(true);
    this.supplierApi
      .getAll({
        search: this.search() || undefined,
        type: this.filterType() ?? undefined,
        active: true,
        page,
        size: PAGE_SIZE,
      })
      .subscribe({
        next: (response) => {
          this.suppliers.set(response.content);
          this.totalElements.set(response.totalElements);
          this.totalPages.set(response.totalPages);
          this.currentPage.set(response.number);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  private resetSelectionState(): void {
    this.search.set('');
    this.currentPage.set(0);
  }
}
