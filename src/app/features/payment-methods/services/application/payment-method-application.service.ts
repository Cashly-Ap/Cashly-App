import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { PaymentMethodApiService, PaymentMethodFilters } from '@features/payment-methods/services/api/payment-method-api';
import { PaymentMethodMapper } from '@features/payment-methods/services/mappers/payment-method';
import {
  PaymentMethodList,
  PaymentMethodDetail,
  PaymentMethodCreate,
  PaymentMethodUpdate,
} from '@features/payment-methods/models/interfaces';

@Injectable({ providedIn: 'root' })
export class PaymentMethodApplicationService {
  private readonly api = inject(PaymentMethodApiService);

  readonly paymentMethods = signal<PaymentMethodList[]>([]);
  readonly currentPaymentMethod = signal<PaymentMethodDetail | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalElements = signal(0);

  loadPaymentMethods(filters?: PaymentMethodFilters): Observable<PaymentMethodList[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getAll(filters).pipe(
      tap({
        next: (items) => {
          this.paymentMethods.set(items);
          this.totalElements.set(items.length);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadPaymentMethodById(id: string): Observable<PaymentMethodDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getById(id).pipe(
      tap({
        next: (paymentMethod) => this.currentPaymentMethod.set(paymentMethod),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  createPaymentMethod(data: PaymentMethodCreate): Observable<PaymentMethodDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.create(data).pipe(
      tap({
        next: (paymentMethod) => {
          const listItem = PaymentMethodMapper.toList(paymentMethod);
          this.paymentMethods.update((current) => [...current, listItem]);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  updatePaymentMethod(id: string, data: PaymentMethodUpdate): Observable<PaymentMethodDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.update(id, data).pipe(
      tap({
        next: (paymentMethod) => {
          const listItem = PaymentMethodMapper.toList(paymentMethod);
          this.paymentMethods.update((current) =>
            current.map((c) => (c.id === id ? listItem : c)),
          );
          if (this.currentPaymentMethod()?.id === id) {
            this.currentPaymentMethod.set(paymentMethod);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  deletePaymentMethod(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.delete(id).pipe(
      tap({
        next: () => {
          this.paymentMethods.update((current) => current.filter((c) => c.id !== id));
          if (this.currentPaymentMethod()?.id === id) {
            this.currentPaymentMethod.set(null);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  togglePaymentMethod(id: string): Observable<PaymentMethodDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.toggle(id).pipe(
      tap({
        next: (paymentMethod) => {
          this.paymentMethods.update((current) =>
            current.map((c) => (c.id === id ? { ...c, isActive: paymentMethod.isActive } : c)),
          );
          if (this.currentPaymentMethod()?.id === id) {
            this.currentPaymentMethod.set(paymentMethod);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }
}
