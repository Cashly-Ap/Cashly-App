import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { DetailsCardComponent } from '@shared/components/details/details-card/details-card.component';
import { DetailsCardHeaderComponent } from '@shared/components/details/details-card-header/details-card-header.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import { WarehouseApplicationService } from '@features/inventory/warehouses/services/application/warehouse-application.service';
import { WarehouseStockItem } from '@features/inventory/warehouses/models/interfaces/warehouse.interfaces';
import { WAREHOUSE_ERROR_MESSAGES } from '@features/inventory/warehouses/messages/error-messages';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-warehouse-stock-page',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    SearchFieldComponent,
  ],
  templateUrl: './warehouse-stock-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseStockPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(WarehouseApplicationService);
  private readonly messageService = inject(MessageService);

  readonly warehouseId = signal('');
  readonly warehouseName = signal('');
  readonly stock = signal<WarehouseStockItem[]>([]);
  readonly loading = signal(false);
  readonly search = signal('');
  readonly page = signal(0);

  readonly filteredStock = computed(() => {
    const search = this.search().trim().toLowerCase();
    return search
      ? this.stock().filter((item) => item.productName.toLowerCase().includes(search))
      : this.stock();
  });
  readonly totalPages = computed(() => Math.ceil(this.filteredStock().length / PAGE_SIZE));
  readonly pagedStock = computed(() => {
    const start = this.page() * PAGE_SIZE;
    return this.filteredStock().slice(start, start + PAGE_SIZE);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.warehouseId.set(id);
    this.load(id);
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.page.set(0);
  }

  onBack(): void {
    this.router.navigate(['/inventory/warehouses', this.warehouseId()]);
  }

  private load(id: string): void {
    this.loading.set(true);
    forkJoin({
      warehouse: this.service.loadById(id),
      stock: this.service.getStock(id).pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ warehouse, stock }) => {
        this.warehouseName.set(warehouse.name);
        this.stock.set(stock);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: WAREHOUSE_ERROR_MESSAGES.loadStock,
          life: 5000,
        });
        this.router.navigate(['/inventory/warehouses']);
      },
    });
  }
}
