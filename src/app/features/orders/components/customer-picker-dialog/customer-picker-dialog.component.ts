import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
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
import { CustomerApiService } from '@features/customers/services/api/customer-api.service';
import { CustomerList } from '@features/customers/models/interfaces';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-customer-picker-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule, ButtonModule, FormsModule, InputTextModule],
  templateUrl: './customer-picker-dialog.component.html',
})
export class CustomerPickerDialogComponent implements OnChanges {
  private readonly customerApi = inject(CustomerApiService);

  readonly visible = input<boolean>(false);
  readonly customerSelected = output<CustomerList>();
  readonly cancelled = output<void>();

  readonly search = signal<string>('');
  readonly customers = signal<CustomerList[]>([]);
  readonly totalElements = signal<number>(0);
  readonly totalPages = signal<number>(0);
  readonly currentPage = signal<number>(0);
  readonly loading = signal<boolean>(false);

  readonly pageSize = PAGE_SIZE;

  readonly pageLabel = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage() + 1;
    return total > 0 ? `Página ${current} de ${total}` : '';
  });

  ngOnChanges(): void {
    if (this.visible()) {
      this.reset();
      this.load(0);
    }
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

  private load(page: number): void {
    this.loading.set(true);
    this.customerApi
      .getAll({ search: this.search() || undefined, active: true, page, size: PAGE_SIZE })
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

  private reset(): void {
    this.search.set('');
    this.customers.set([]);
    this.totalElements.set(0);
    this.totalPages.set(0);
    this.currentPage.set(0);
  }
}
