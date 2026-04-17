import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { CustomerApiService } from '../api/customer-api.service';
import { CustomerMapper } from '../mappers/customer.mapper';
import { CustomerList, CustomerDetails, CustomerCreate, CustomerEdit } from '../../models/interfaces';

@Injectable({ providedIn: 'root' })
export class CustomerApplicationService {
  private readonly api = inject(CustomerApiService);
  private readonly mapper = inject(CustomerMapper);

  readonly customers = signal<CustomerList[]>([]);
  readonly currentCustomer = signal<CustomerDetails | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadAll(): Observable<CustomerList[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getAll().pipe(
      tap({
        next: (customers) => this.customers.set(customers),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadById(id: string): Observable<CustomerDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getById(id).pipe(
      tap({
        next: (customer) => this.currentCustomer.set(customer),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  create(data: CustomerCreate): Observable<CustomerDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.create(data).pipe(
      tap({
        next: (customer) => {
          const listItem = this.mapper.toList(customer);
          this.customers.update((current) => [...current, listItem]);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  update(id: string, data: CustomerEdit): Observable<CustomerDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.update(id, data).pipe(
      tap({
        next: (customer) => {
          const listItem = this.mapper.toList(customer);
          this.customers.update((current) => current.map((c) => (c.id === id ? listItem : c)));
          if (this.currentCustomer()?.id === id) {
            this.currentCustomer.set(customer);
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
        next: () => this.customers.update((current) => current.filter((c) => c.id !== id)),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }
}
