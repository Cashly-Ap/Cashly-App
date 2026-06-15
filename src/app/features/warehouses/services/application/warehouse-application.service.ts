import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { WarehouseApiService, WarehouseFilters } from '@features/warehouses/services/api/warehouse-api.service';
import { WarehouseList, WarehouseDetails, WarehouseCreate, WarehouseUpdate, StockEntryRequest, StockExitRequest, WarehouseStockItem, WarehouseMovementItem, MovementFilters } from '@features/warehouses/models/interfaces';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

@Injectable({ providedIn: 'root' })
export class WarehouseApplicationService {
  private readonly api = inject(WarehouseApiService);

  readonly warehouses = signal<WarehouseList[]>([]);
  readonly simpleWarehouses = signal<WarehouseList[]>([]);
  readonly currentWarehouse = signal<WarehouseDetails | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalElements = signal(0);

  loadAll(filters?: WarehouseFilters): Observable<PagedResponse<WarehouseList>> {
    this.loading.set(true);
    this.error.set(null);
    return this.api.getAll(filters).pipe(
      tap({
        next: (res) => {
          this.warehouses.set(res.content ?? []);
          this.totalElements.set(res.totalElements ?? 0);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadSimpleWarehouses(): Observable<WarehouseList[]> {
    return this.api.getAllSimple().pipe(
      tap({ next: (warehouses) => this.simpleWarehouses.set(warehouses) }),
    );
  }

  loadById(id: string): Observable<WarehouseDetails> {
    this.loading.set(true);
    this.error.set(null);
    return this.api.getById(id).pipe(
      tap({
        next: (warehouse) => this.currentWarehouse.set(warehouse),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  create(data: WarehouseCreate): Observable<WarehouseDetails> {
    this.loading.set(true);
    this.error.set(null);
    return this.api.create(data).pipe(
      tap({ error: (err: Error) => this.error.set(err.message) }),
      finalize(() => this.loading.set(false)),
    );
  }

  update(id: string, data: WarehouseUpdate): Observable<WarehouseDetails> {
    this.loading.set(true);
    this.error.set(null);
    return this.api.update(id, data).pipe(
      tap({
        next: (warehouse) => {
          this.warehouses.update((current) =>
            current.map((w) => (w.id === id ? { ...w, name: warehouse.name, state: warehouse.state, municipality: warehouse.municipality } : w)),
          );
          if (this.currentWarehouse()?.id === id) this.currentWarehouse.set(warehouse);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  toggleActive(id: string, active: boolean): Observable<WarehouseDetails> {
    this.loading.set(true);
    this.error.set(null);
    return this.api.toggleActive(id, active).pipe(
      tap({
        next: (warehouse) => {
          this.warehouses.update((current) =>
            current.map((w) => (w.id === id ? { ...w, active: warehouse.active } : w)),
          );
          if (this.currentWarehouse()?.id === id) this.currentWarehouse.set(warehouse);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  delete(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);
    return this.api.delete(id).pipe(
      tap({
        next: () => this.warehouses.update((current) => current.filter((w) => w.id !== id)),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  addEntry(id: string, data: StockEntryRequest): Observable<void> {
    return this.api.addEntry(id, data);
  }

  addExit(id: string, data: StockExitRequest): Observable<void> {
    return this.api.addExit(id, data);
  }

  getStock(id: string): Observable<WarehouseStockItem[]> {
    return this.api.getStock(id);
  }

  getMovements(id: string, filters?: MovementFilters): Observable<PagedResponse<WarehouseMovementItem>> {
    return this.api.getMovements(id, filters);
  }
}
