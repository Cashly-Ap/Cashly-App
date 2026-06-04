import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { AdvanceApiService, AdvanceFilters } from '../api/advance-api.service';
import { AdvanceMapper } from '../mappers/advance.mapper';
import { AdvanceList, AdvanceDetail, AdvanceCreate, AdvanceApply } from '../../models/interfaces';

@Injectable({ providedIn: 'root' })
export class AdvanceApplicationService {
  private readonly api = inject(AdvanceApiService);

  readonly advances = signal<AdvanceList[]>([]);
  readonly currentAdvance = signal<AdvanceDetail | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalElements = signal(0);

  loadAll(filters?: AdvanceFilters): Observable<AdvanceList[]> {
    this.loading.set(true);
    this.error.set(null);
    return this.api.getAll(filters).pipe(
      tap({
        next: (items) => {
          this.advances.set(items);
          this.totalElements.set(items.length);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadById(id: string): Observable<AdvanceDetail> {
    this.loading.set(true);
    this.error.set(null);
    return this.api.getById(id).pipe(
      tap({
        next: (advance) => this.currentAdvance.set(advance),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  create(data: AdvanceCreate): Observable<AdvanceDetail> {
    this.loading.set(true);
    this.error.set(null);
    return this.api.create(data).pipe(
      tap({
        next: (advance) => {
          const listItem = AdvanceMapper.toList(advance);
          this.advances.update((current) => [listItem, ...current]);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  apply(id: string, data: AdvanceApply): Observable<AdvanceDetail> {
    this.loading.set(true);
    this.error.set(null);
    return this.api.apply(id, data).pipe(
      tap({
        next: (advance) => {
          this.currentAdvance.set(advance);
          this.advances.update((current) =>
            current.map((a) => (a.id === id ? AdvanceMapper.toList(advance) : a)));
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  cancel(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);
    return this.api.cancel(id).pipe(
      tap({
        next: () => {
          this.advances.update((current) => current.filter((a) => a.id !== id));
          if (this.currentAdvance()?.id === id) this.currentAdvance.set(null);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }
}
