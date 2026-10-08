import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import {
  CustomerApiService,
  CustomerFilters,
  CustomerCreatedResponse,
} from '@features/customers/services/api/customer-api.service';
import { CustomerMapper } from '@features/customers/services/mappers/customer.mapper';
import {
  CustomerList,
  CustomerDetails,
  CustomerCreate,
  CustomerEdit,
} from '@features/customers/models/interfaces';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

@Injectable({ providedIn: 'root' })
export class CustomerApplicationService {
  private readonly api = inject(CustomerApiService);
  private readonly mapper = inject(CustomerMapper);

  readonly customers = signal<CustomerList[]>([]);
  readonly currentCustomer = signal<CustomerDetails | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalElements = signal(0);

  loadAll(filters?: CustomerFilters): Observable<PagedResponse<CustomerList>> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getAll(filters).pipe(
      tap({
        next: (res) => {
          this.customers.set(res.content ?? []);
          this.totalElements.set(res.totalElements ?? 0);
        },
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

  create(data: CustomerCreate): Observable<CustomerCreatedResponse> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.create(data).pipe(
      tap({
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
