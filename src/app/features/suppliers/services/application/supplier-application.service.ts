import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import {
  SupplierApiService,
  SupplierFilters,
  SupplierCreatedResponse,
} from '@features/suppliers/services/api/supplier-api.service';
import { SupplierMapper } from '@features/suppliers/services/mappers/supplier.mapper';
import { SupplierList } from '@features/suppliers/models/interfaces/supplier-list.interface';
import { SupplierDetails } from '@features/suppliers/models/interfaces/supplier-details.interface';
import { SupplierCreate } from '@features/suppliers/models/interfaces/supplier-create.interface';
import { SupplierEdit } from '@features/suppliers/models/interfaces/supplier-edit.interface';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

@Injectable({ providedIn: 'root' })
export class SupplierApplicationService {
  private readonly api = inject(SupplierApiService);
  private readonly mapper = inject(SupplierMapper);

  readonly suppliers = signal<SupplierList[]>([]);
  readonly currentSupplier = signal<SupplierDetails | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalElements = signal(0);

  loadAll(filters?: SupplierFilters): Observable<PagedResponse<SupplierList>> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getAll(filters).pipe(
      tap({
        next: (res) => {
          this.suppliers.set(res.content ?? []);
          this.totalElements.set(res.totalElements ?? 0);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadById(id: string): Observable<SupplierDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getById(id).pipe(
      tap({
        next: (supplier) => this.currentSupplier.set(supplier),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  create(data: SupplierCreate): Observable<SupplierCreatedResponse> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.create(data).pipe(
      tap({
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  update(id: string, data: SupplierEdit): Observable<SupplierDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.update(id, data).pipe(
      tap({
        next: (supplier) => {
          const listItem = this.mapper.toList(supplier);
          this.suppliers.update((current) => current.map((c) => (c.id === id ? listItem : c)));
          if (this.currentSupplier()?.id === id) {
            this.currentSupplier.set(supplier);
          }
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
        next: () => this.suppliers.update((current) => current.filter((c) => c.id !== id)),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }
}
