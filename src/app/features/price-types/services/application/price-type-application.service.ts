import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { PriceTypeApiService } from '../api/price-type-api.service';
import { PriceTypeList, PriceTypeDetails, PriceTypeCreate, PriceTypeUpdate } from '../../models/interfaces';

@Injectable({ providedIn: 'root' })
export class PriceTypeApplicationService {
  private readonly api = inject(PriceTypeApiService);

  readonly priceTypes = signal<PriceTypeList[]>([]);
  readonly selectedPriceType = signal<PriceTypeDetails | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  loadAll(): Observable<PriceTypeList[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.api.findAll().pipe(
      tap({
        next: (types) => this.priceTypes.set(types),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.isLoading.set(false)),
    );
  }

  loadAllActive(): Observable<PriceTypeList[]> {
    return this.loadAll();
  }

  loadById(id: string): Observable<PriceTypeDetails> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.api.findById(id).pipe(
      tap({
        next: (type) => this.selectedPriceType.set(type),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.isLoading.set(false)),
    );
  }

  create(data: PriceTypeCreate): Observable<PriceTypeDetails> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.api.create(data).pipe(
      tap({
        next: (type) => {
          const listItem: PriceTypeList = { id: type.id, name: type.name, active: type.active };
          this.priceTypes.update((current) => [...current, listItem]);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.isLoading.set(false)),
    );
  }

  update(id: string, data: PriceTypeUpdate): Observable<PriceTypeDetails> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.api.update(id, data).pipe(
      tap({
        next: (type) => {
          const listItem: PriceTypeList = { id: type.id, name: type.name, active: type.active };
          this.priceTypes.update((current) => current.map((t) => (t.id === id ? listItem : t)));
          if (this.selectedPriceType()?.id === id) {
            this.selectedPriceType.set(type);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.isLoading.set(false)),
    );
  }

  remove(id: string): Observable<void> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.api.delete(id).pipe(
      tap({
        next: () => this.priceTypes.update((current) => current.filter((t) => t.id !== id)),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.isLoading.set(false)),
    );
  }
}
