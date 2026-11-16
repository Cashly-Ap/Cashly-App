import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import {
  CategoryApiService,
  CategoryFilters,
} from '@features/catalog/categories/services/api/category-api.service';
import { CategoryList } from '@features/catalog/categories/models/interfaces/category-list.interface';
import { CategoryDetails } from '@features/catalog/categories/models/interfaces/category-details.interface';
import { CategoryCreate } from '@features/catalog/categories/models/interfaces/category-create.interface';
import { CategoryUpdate } from '@features/catalog/categories/models/interfaces/category-update.interface';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

@Injectable({ providedIn: 'root' })
export class CategoryApplicationService {
  private readonly api = inject(CategoryApiService);

  readonly categories = signal<CategoryList[]>([]);
  readonly currentCategory = signal<CategoryDetails | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalElements = signal(0);

  loadAll(filters?: CategoryFilters): Observable<PagedResponse<CategoryList>> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getAll(filters).pipe(
      tap({
        next: (res) => {
          this.categories.set(res.content ?? []);
          this.totalElements.set(res.totalElements ?? 0);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadById(id: string): Observable<CategoryDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getById(id).pipe(
      tap({
        next: (category) => this.currentCategory.set(category),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  create(data: CategoryCreate): Observable<CategoryDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.create(data).pipe(
      tap({
        next: (category) => {
          const listItem: CategoryList = {
            id: category.id,
            name: category.name,
            description: category.description,
            active: category.active,
            productCount: category.productCount,
            deletable: category.productCount === 0,
          };
          this.categories.update((current) => [...current, listItem]);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  update(id: string, data: CategoryUpdate): Observable<CategoryDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.update(id, data).pipe(
      tap({
        next: (category) => {
          const listItem: CategoryList = {
            id: category.id,
            name: category.name,
            description: category.description,
            active: category.active,
            productCount: category.productCount,
            deletable: category.productCount === 0,
          };
          this.categories.update((current) => current.map((c) => (c.id === id ? listItem : c)));
          if (this.currentCategory()?.id === id) {
            this.currentCategory.set(category);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  toggleActive(id: string, active: boolean): Observable<CategoryDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.toggleActive(id, active).pipe(
      tap({
        next: (category) => {
          this.categories.update((current) =>
            current.map((c) => (c.id === id ? { ...c, active: category.active } : c)),
          );
          if (this.currentCategory()?.id === id) {
            this.currentCategory.set(category);
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
        next: () => this.categories.update((current) => current.filter((c) => c.id !== id)),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }
}
