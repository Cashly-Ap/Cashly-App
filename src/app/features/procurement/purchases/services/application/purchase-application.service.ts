import { Injectable, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslationService } from '@core/i18n/translation.service';
import { Observable, tap, finalize } from 'rxjs';
import {
  PurchaseApiService,
  PurchaseFilters,
  CancelPurchaseRequest,
} from '@features/procurement/purchases/services/api/purchase-api.service';
import { PurchaseMapper } from '@features/procurement/purchases/services/mappers/purchase.mapper';
import { PurchaseList } from '@features/procurement/purchases/models/interfaces/purchase-list.interface';
import { PurchaseDetails } from '@features/procurement/purchases/models/interfaces/purchase-details.interface';
import { PurchaseCreate } from '@features/procurement/purchases/models/interfaces/purchase-create.interface';
import { PurchaseEdit } from '@features/procurement/purchases/models/interfaces/purchase-edit.interface';

@Injectable({ providedIn: 'root' })
export class PurchaseApplicationService {
  private readonly messages = inject(MessageService);
  private readonly translations = inject(TranslationService);
  private readonly api = inject(PurchaseApiService);

  readonly purchases = signal<PurchaseList[]>([]);
  readonly currentPurchase = signal<PurchaseDetails | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalElements = signal(0);

  loadAll(filters?: PurchaseFilters): Observable<PurchaseList[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getAll(filters).pipe(
      tap({
        next: (items) => {
          this.purchases.set(items);
          this.totalElements.set(items.length);
        },
        error: (err: Error) => this.reportError(err),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadById(id: string): Observable<PurchaseDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getById(id).pipe(
      tap({
        next: (purchase) => this.currentPurchase.set(purchase),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  create(data: PurchaseCreate): Observable<PurchaseDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.create(data).pipe(
      tap({
        next: (purchase) => {
          const listItem = PurchaseMapper.toList(purchase);
          this.purchases.update((current) => [listItem, ...current]);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  update(id: string, data: PurchaseEdit): Observable<PurchaseDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.update(id, data).pipe(
      tap({
        next: (purchase) => {
          const listItem = PurchaseMapper.toList(purchase);
          this.purchases.update((current) => current.map((o) => (o.id === id ? listItem : o)));
          if (this.currentPurchase()?.id === id) {
            this.currentPurchase.set(purchase);
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
        next: () => this.purchases.update((current) => current.filter((o) => o.id !== id)),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  confirm(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return new Observable((observer) => {
      this.api.confirm(id).subscribe({
        next: () => {
          this.purchases.update((current) => current.filter((o) => o.id !== id));
          if (this.currentPurchase()?.id === id) {
            this.currentPurchase.set(null);
          }
          this.loading.set(false);
          observer.next();
          observer.complete();
        },
        error: (err: Error) => {
          this.error.set(err.message);
          this.loading.set(false);
          observer.error(err);
        },
      });
    });
  }

  cancel(id: string, request: CancelPurchaseRequest): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return new Observable((observer) => {
      this.api.cancel(id, request).subscribe({
        next: () => {
          this.purchases.update((current) => current.filter((o) => o.id !== id));
          if (this.currentPurchase()?.id === id) {
            this.currentPurchase.set(null);
          }
          this.loading.set(false);
          observer.next();
          observer.complete();
        },
        error: (err: Error) => {
          this.error.set(err.message);
          this.loading.set(false);
          observer.error(err);
        },
      });
    });
  }

  getProductsForPurchase(filters: {
    search?: string;
    categoryId?: string;
    composite?: boolean;
    page?: number;
    size?: number;
  }) {
    return this.api.getProductsForPurchase(filters);
  }

  getWarehousesForPurchase() {
    return this.api.getWarehousesForPurchase();
  }

  private reportError(error: unknown): void {
    const message = this.errorMessage(error);
    this.error.set(message);
    this.messages.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000,
    });
  }

  private errorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
      const response = error as { error?: unknown; message?: unknown };
      if (typeof response.error === 'object' && response.error !== null) {
        const detail = (response.error as { message?: unknown }).message;
        if (typeof detail === 'string' && detail.trim()) return detail;
      }
      if (typeof response.message === 'string' && response.message.trim()) {
        return response.message;
      }
    }
    return this.translations.t('shared.requestFailed');
  }
}
