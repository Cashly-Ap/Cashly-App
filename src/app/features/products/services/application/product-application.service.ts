import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { ProductApiService, ProductFilters } from '@features/products/services/api/product-api';
import { ProductList, ProductDetails, ProductCreate, ProductUpdate, ProductStockByWarehouse } from '@features/products/models/interfaces';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

@Injectable({ providedIn: 'root' })
export class ProductApplicationService {
  private readonly api = inject(ProductApiService);

  readonly products = signal<ProductList[]>([]);
  readonly simpleProducts = signal<ProductList[]>([]);
  readonly currentProduct = signal<ProductDetails | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalElements = signal(0);

  loadAll(filters?: ProductFilters): Observable<PagedResponse<ProductList>> {
    this.loading.set(true);
    this.error.set(null);
    return this.api.getAll(filters).pipe(
      tap({
        next: (res) => {
          this.products.set(res.content ?? []);
          this.totalElements.set(res.totalElements ?? 0);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadSimpleProducts(): Observable<ProductList[]> {
    return this.api.getAllSimple().pipe(
      tap({ next: (products) => this.simpleProducts.set(products) }),
    );
  }

  loadById(id: string): Observable<ProductDetails> {
    this.loading.set(true);
    this.error.set(null);
    return this.api.getById(id).pipe(
      tap({
        next: (product) => this.currentProduct.set(product),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  create(data: ProductCreate): Observable<ProductDetails> {
    this.loading.set(true);
    this.error.set(null);
    return this.api.create(data).pipe(
      tap({ error: (err: Error) => this.error.set(err.message) }),
      finalize(() => this.loading.set(false)),
    );
  }

  update(id: string, data: ProductUpdate): Observable<ProductDetails> {
    this.loading.set(true);
    this.error.set(null);
    return this.api.update(id, data).pipe(
      tap({
        next: (product) => {
          this.products.update((current) =>
            current.map((p) =>
              p.id === id ? { ...p, name: product.name, categoryName: product.categoryName } : p
            ),
          );
          if (this.currentProduct()?.id === id) this.currentProduct.set(product);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  toggleActive(id: string, active: boolean): Observable<ProductDetails> {
    this.loading.set(true);
    this.error.set(null);
    return this.api.toggleActive(id, active).pipe(
      tap({
        next: (product) => {
          this.products.update((current) =>
            current.map((p) => (p.id === id ? { ...p, active: product.active } : p)),
          );
          if (this.currentProduct()?.id === id) this.currentProduct.set(product);
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
        next: () => this.products.update((current) => current.filter((p) => p.id !== id)),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  getById(id: string): Observable<ProductDetails> {
    return this.api.getById(id);
  }

  getStock(id: string): Observable<ProductStockByWarehouse[]> {
    return this.api.getStock(id);
  }
}
