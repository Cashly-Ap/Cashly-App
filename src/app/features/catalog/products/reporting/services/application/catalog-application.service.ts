import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { CatalogApiService } from '@features/catalog/products/reporting/services/api/catalog-api.service';
import { CatalogItem } from '@features/catalog/products/reporting/models/interfaces/catalog-item.interface';
import { CatalogFilters } from '@features/catalog/products/reporting/models/interfaces/catalog-filters.interface';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

@Injectable({ providedIn: 'root' })
export class CatalogApplicationService {
  private readonly api = inject(CatalogApiService);

  readonly items = signal<CatalogItem[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalElements = signal(0);

  loadAll(filters?: CatalogFilters): Observable<PagedResponse<CatalogItem>> {
    this.loading.set(true);
    this.error.set(null);
    return this.api.getAll(filters).pipe(
      tap({
        next: (res) => {
          this.items.set(res.content ?? []);
          this.totalElements.set(res.totalElements ?? 0);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }
}
