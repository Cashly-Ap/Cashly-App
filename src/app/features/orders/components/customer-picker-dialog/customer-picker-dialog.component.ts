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
import { CustomerApiService } from '@features/customers/services/api/customer-api.service';
import { CustomerList } from '@features/customers/models/interfaces';
import { CUSTOMER_TYPES, CustomerType, getCustomerTypeLabel } from '@features/customers/models/enums/customer-type.enum';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-customer-picker-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule, ButtonModule, FormsModule, InputTextModule, PopoverModule, SelectModule],
  templateUrl: './customer-picker-dialog.component.html',
})
export class CustomerPickerDialogComponent {
  @ViewChild('filterPopover') private readonly filterPopover!: Popover;

  private readonly customerApi = inject(CustomerApiService);

  readonly visible = input<boolean>(false);
  readonly hasExistingItems = input<boolean>(false);
  readonly customerSelected = output<CustomerList>();
  readonly cancelled = output<void>();

  readonly search = signal<string>('');
  readonly customers = signal<CustomerList[]>([]);
  readonly totalElements = signal<number>(0);
  readonly totalPages = signal<number>(0);
  readonly currentPage = signal<number>(0);
  readonly loading = signal<boolean>(false);

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
    this.customerSelected.emit(customer);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  toggleFilterPanel(event: MouseEvent): void {
    this.filterPopover.toggle(event);
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
  }
}
