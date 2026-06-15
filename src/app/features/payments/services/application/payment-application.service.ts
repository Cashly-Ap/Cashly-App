import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { PaymentApiService, PaymentFilters } from '@features/payments/services/api/payment-api';
import { PaymentMapper } from '@features/payments/services/mappers/payment';
import {
  PaymentList,
  PaymentDetail,
  PaymentCreate,
  PaymentUpdate,
} from '@features/payments/models/interfaces';

@Injectable({ providedIn: 'root' })
export class PaymentApplicationService {
  private readonly api = inject(PaymentApiService);

  readonly payments = signal<PaymentList[]>([]);
  readonly currentPayment = signal<PaymentDetail | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalElements = signal(0);

  loadPayments(filters?: PaymentFilters): Observable<PaymentList[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getAll(filters).pipe(
      tap({
        next: (items) => {
          this.payments.set(items);
          this.totalElements.set(items.length);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadPaymentById(id: string): Observable<PaymentDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getById(id).pipe(
      tap({
        next: (payment) => this.currentPayment.set(payment),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  createPayment(data: PaymentCreate): Observable<PaymentDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.create(data).pipe(
      tap({
        next: (payment) => {
          const listItem = PaymentMapper.toList(payment);
          this.payments.update((current) => [listItem, ...current]);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  updatePayment(id: string, data: PaymentUpdate): Observable<PaymentDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.update(id, data).pipe(
      tap({
        next: (payment) => {
          this.currentPayment.set(payment);
          this.payments.update((current) =>
            current.map((p) => (p.id === id ? PaymentMapper.toList(payment) : p)),
          );
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  deletePayment(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.delete(id).pipe(
      tap({
        next: () => {
          this.payments.update((current) => current.filter((p) => p.id !== id));
          if (this.currentPayment()?.id === id) {
            this.currentPayment.set(null);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }
}
