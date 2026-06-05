import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { InvoiceApiService, InvoiceFilters } from '../api/invoice-api.service';
import { InvoiceMapper } from '../mappers/invoice.mapper';
import { InvoiceList, InvoiceDetails, InvoiceCreate, InvoiceUpdate } from '../../models/interfaces';

@Injectable({ providedIn: 'root' })
export class InvoiceApplicationService {
  private readonly api = inject(InvoiceApiService);

  readonly invoices = signal<InvoiceList[]>([]);
  readonly currentInvoice = signal<InvoiceDetails | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalElements = signal(0);

  loadAll(filters?: InvoiceFilters): Observable<InvoiceList[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getAll(filters).pipe(
      tap({
        next: (items) => {
          this.invoices.set(items);
          this.totalElements.set(items.length);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadById(id: string): Observable<InvoiceDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getById(id).pipe(
      tap({
        next: (invoice) => this.currentInvoice.set(invoice),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  create(data: InvoiceCreate): Observable<InvoiceDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.create(data).pipe(
      tap({
        next: (invoice) => {
          const listItem = InvoiceMapper.toList(invoice);
          this.invoices.update((current) => [listItem, ...current]);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  update(id: string, data: InvoiceUpdate): Observable<InvoiceDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.update(id, data).pipe(
      tap({
        next: (invoice) => {
          const listItem = InvoiceMapper.toList(invoice);
          this.invoices.update((current) => current.map((i) => (i.id === id ? listItem : i)));
          if (this.currentInvoice()?.id === id) {
            this.currentInvoice.set(invoice);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  cancel(id: string, reason: string): Observable<InvoiceDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.cancel(id, reason).pipe(
      tap({
        next: (invoice) => {
          const listItem = InvoiceMapper.toList(invoice);
          this.invoices.update((current) => current.map((i) => (i.id === id ? listItem : i)));
          if (this.currentInvoice()?.id === id) {
            this.currentInvoice.set(invoice);
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
        next: () => this.invoices.update((current) => current.filter((i) => i.id !== id)),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  confirm(id: string, data?: { confirmationPassword?: string; useBalance?: boolean; balanceAmount?: number; paymentMethodId?: string }): Observable<InvoiceDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.confirm(id, data).pipe(
      tap({
        next: (invoice) => {
          const listItem = InvoiceMapper.toList(invoice);
          this.invoices.update((current) => current.map((i) => (i.id === id ? listItem : i)));
          if (this.currentInvoice()?.id === id) {
            this.currentInvoice.set(invoice);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  duplicate(id: string): Observable<InvoiceDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.duplicate(id).pipe(
      tap({
        next: (invoice) => {
          const listItem = InvoiceMapper.toList(invoice);
          this.invoices.update((current) => [listItem, ...current]);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }
}
