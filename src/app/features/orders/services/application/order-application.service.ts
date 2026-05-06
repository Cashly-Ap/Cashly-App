import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { OrderApiService, OrderFilters } from '../api/order-api.service';
import { OrderMapper } from '../mappers/order.mapper';
import { OrderList, OrderDetails, OrderCreate, OrderEdit } from '../../models/interfaces';

@Injectable({ providedIn: 'root' })
export class OrderApplicationService {
  private readonly api = inject(OrderApiService);

  readonly orders = signal<OrderList[]>([]);
  readonly currentOrder = signal<OrderDetails | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalElements = signal(0);

  loadAll(filters?: OrderFilters): Observable<OrderList[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getAll(filters).pipe(
      tap({
        next: (items) => {
          this.orders.set(items);
          this.totalElements.set(items.length);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadById(id: string): Observable<OrderDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getById(id).pipe(
      tap({
        next: (order) => this.currentOrder.set(order),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  create(data: OrderCreate): Observable<OrderDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.create(data).pipe(
      tap({
        next: (order) => {
          const listItem = OrderMapper.toList(order);
          this.orders.update((current) => [listItem, ...current]);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  update(id: string, data: OrderEdit): Observable<OrderDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.update(id, data).pipe(
      tap({
        next: (order) => {
          const listItem = OrderMapper.toList(order);
          this.orders.update((current) => current.map((o) => (o.id === id ? listItem : o)));
          if (this.currentOrder()?.id === id) {
            this.currentOrder.set(order);
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
        next: () => this.orders.update((current) => current.filter((o) => o.id !== id)),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  confirm(id: string): Observable<OrderDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.confirm(id).pipe(
      tap({
        next: (order) => {
          const listItem = OrderMapper.toList(order);
          this.orders.update((current) => current.map((o) => (o.id === id ? listItem : o)));
          if (this.currentOrder()?.id === id) {
            this.currentOrder.set(order);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  convertToInvoice(id: string): Observable<OrderDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.convertToInvoice(id).pipe(
      tap({
        next: (order) => {
          const listItem = OrderMapper.toList(order);
          this.orders.update((current) => current.map((o) => (o.id === id ? listItem : o)));
          if (this.currentOrder()?.id === id) {
            this.currentOrder.set(order);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  cancel(id: string, reason: string): Observable<OrderDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.cancel(id, reason).pipe(
      tap({
        next: (order) => {
          const listItem = OrderMapper.toList(order);
          this.orders.update((current) => current.map((o) => (o.id === id ? listItem : o)));
          if (this.currentOrder()?.id === id) {
            this.currentOrder.set(order);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }
}
