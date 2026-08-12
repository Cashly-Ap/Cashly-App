import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize, map } from 'rxjs';
import {
  QuoteApiService,
  QuoteFilters,
  ConvertToInvoiceRequest,
  AssignQuoteWarehousesRequest,
} from '@features/quotes/services/api/quote-api.service';
import { QuoteMapper } from '@features/quotes/services/mappers/quote.mapper';
import {
  QuoteList,
  QuoteDetails,
  QuoteCreate,
  QuoteEdit,
} from '@features/quotes/models/interfaces';

@Injectable({ providedIn: 'root' })
export class QuoteApplicationService {
  private readonly api = inject(QuoteApiService);

  readonly quotes = signal<QuoteList[]>([]);
  readonly currentQuote = signal<QuoteDetails | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalElements = signal(0);

  loadAll(filters?: QuoteFilters): Observable<QuoteList[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getAll(filters).pipe(
      tap({
        next: (items) => {
          this.quotes.set(items);
          this.totalElements.set(items.length);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadById(id: string): Observable<QuoteDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getById(id).pipe(
      tap({
        next: (quote) => this.currentQuote.set(quote),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  create(data: QuoteCreate): Observable<QuoteDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.create(data).pipe(
      tap({
        next: (quote) => {
          const listItem = QuoteMapper.toList(quote);
          this.quotes.update((current) => [listItem, ...current]);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  update(id: string, data: QuoteEdit): Observable<QuoteDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.update(id, data).pipe(
      tap({
        next: (quote) => {
          const listItem = QuoteMapper.toList(quote);
          this.quotes.update((current) => current.map((o) => (o.id === id ? listItem : o)));
          if (this.currentQuote()?.id === id) {
            this.currentQuote.set(quote);
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
        next: () => this.quotes.update((current) => current.filter((o) => o.id !== id)),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  convertToOrder(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.convertToOrder(id).pipe(
      map(() => undefined),
      tap({
        next: () => {
          this.quotes.update((current) => current.filter((o) => o.id !== id));
          if (this.currentQuote()?.id === id) {
            this.currentQuote.set(null);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  convertToInvoice(id: string, request: ConvertToInvoiceRequest): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.convertToInvoice(id, request).pipe(
      map(() => undefined),
      tap({
        next: () => {
          this.quotes.update((current) => current.filter((o) => o.id !== id));
          if (this.currentQuote()?.id === id) {
            this.currentQuote.set(null);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  getProductsForQuote(filters: {
    customerId: string;
    search?: string;
    categoryId?: string;
    composite?: boolean;
    page?: number;
    size?: number;
  }) {
    return this.api.getProductsForQuote(filters);
  }

  getWarehousesForQuote(customerId: string) {
    return this.api.getWarehousesForQuote(customerId);
  }

  assignWarehouses(id: string, request: AssignQuoteWarehousesRequest): Observable<QuoteDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.assignWarehouses(id, request).pipe(
      tap({
        next: (quote) => {
          const listItem = QuoteMapper.toList(quote);
          this.quotes.update((current) => current.map((o) => (o.id === id ? listItem : o)));
          if (this.currentQuote()?.id === id) {
            this.currentQuote.set(quote);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }
}
