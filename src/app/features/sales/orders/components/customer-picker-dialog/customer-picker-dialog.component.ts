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
import { Popover, PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { CustomerApiService } from '@features/partners/customers/services/api/customer-api.service';
import { CustomerList } from '@features/partners/customers/models/interfaces/customer-list.interface';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import {
  CUSTOMER_TYPES,
  CustomerType,
  getCustomerTypeLabel,
} from '@features/partners/customers/models/enums/customer-type.enum';

const PAGE_SIZE = 10;

import { ListFilterComponent } from '@shared/components/list/list-filter/list-filter.component';
import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';
import { TableCardComponent } from '@shared/components/ui/table-card/table-card.component';
import { DialogHeaderComponent } from '@shared/components/ui/dialog-header/dialog-header.component';
@Component({
  selector: 'app-customer-picker-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DialogHeaderComponent,
    TableCardComponent,
    CancelButtonComponent,
    ListFilterComponent,
    TranslateOptionsPipe,
    TranslatePipe,
    DialogModule,
    ButtonModule,
    FormsModule,
    PopoverModule,
    SelectModule,
    SearchFieldComponent,
  ],
  templateUrl: './customer-picker-dialog.component.html',
})
export class CustomerPickerDialogComponent {
  private readonly customerApi = inject(CustomerApiService);

  readonly visible = input<boolean>(false);
  readonly description = input('Busque y seleccione el cliente para el pedido');
  readonly hasExistingItems = input<boolean>(false);
  readonly multiple = input<boolean>(false);
  readonly requireConfirmation = input(false);
  readonly initialSelected = input<CustomerList[]>([]);
  readonly customerSelected = output<CustomerList>();
  readonly customersSelected = output<CustomerList[]>();
  readonly cancelled = output<void>();

  readonly search = signal<string>('');
  readonly customers = signal<CustomerList[]>([]);
  readonly totalElements = signal<number>(0);
  readonly totalPages = signal<number>(0);
  readonly currentPage = signal<number>(0);
  readonly loading = signal<boolean>(false);
  readonly selected = signal<CustomerList[]>([]);

  readonly confirmedCustomer = computed(() => {
    const customer = this.selected()[0];
    return !this.loading() && customer && this.customers().some((item) => item.id === customer.id)
      ? customer
      : null;
  });

  readonly filterType = signal<CustomerType | null>(null);

  readonly customerTypes = [...CUSTOMER_TYPES];
  readonly pageSize = PAGE_SIZE;
  readonly getCustomerTypeLabel = getCustomerTypeLabel;

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

  onSelect(customer: CustomerList): void {
    if (!this.multiple()) {
      if (this.requireConfirmation()) {
        this.selected.set([customer]);
        return;
      }
      this.customerSelected.emit(customer);
      return;
    }
    this.selected.update((current) =>
      current.some((item) => item.id === customer.id)
        ? current.filter((item) => item.id !== customer.id)
        : [...current, customer],
    );
  }

  isSelected(customer: CustomerList): boolean {
    return (
      (this.multiple() || this.requireConfirmation()) &&
      this.selected().some((item) => item.id === customer.id)
    );
  }

  confirmSingle(): void {
    const customer = this.confirmedCustomer();
    if (this.requireConfirmation() && !this.multiple() && customer) {
      this.customerSelected.emit(customer);
    }
  }

  confirmMultiple(): void {
    if (this.selected().length > 0) this.customersSelected.emit(this.selected());
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  selectType(type: CustomerType | null): void {
    this.filterType.set(type ?? null);
    this.load(0);
  }

  clearFilters(): void {
    this.filterType.set(null);
    this.load(0);
  }

  private load(page: number): void {
    if (this.requireConfirmation() && !this.multiple()) this.selected.set([]);
    this.loading.set(true);
    this.customerApi
      .getForPicker({
        search: this.search() || undefined,
        type: this.filterType() ?? undefined,
        page,
        size: PAGE_SIZE,
      })
      .subscribe({
        next: (response) => {
          this.customers.set(response.content);
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
    this.selected.set(this.multiple() ? [...this.initialSelected()] : []);
  }
}
