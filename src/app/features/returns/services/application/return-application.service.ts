import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize, switchMap, forkJoin, of, map, catchError } from 'rxjs';
import { ReturnApiService, ReturnFilters } from '@features/returns/services/api/return-api.service';
import { ReturnMapper } from '@features/returns/services/mappers/return.mapper';
import { ReturnList, ReturnDetail, ReturnCreate } from '@features/returns/models/interfaces';
import { CustomerApiService } from '@features/customers/services/api/customer-api.service';
import { ProductApiService } from '@features/products/services/api/product-api.service';

@Injectable({ providedIn: 'root' })
export class ReturnApplicationService {
  private readonly api = inject(ReturnApiService);
  private readonly customerApi = inject(CustomerApiService);
  private readonly productApi = inject(ProductApiService);

  readonly returns = signal<ReturnList[]>([]);
  readonly currentReturn = signal<ReturnDetail | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalElements = signal(0);

  loadReturns(filters?: ReturnFilters): Observable<ReturnList[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getAll(filters).pipe(
      tap({
        next: (items) => {
          this.returns.set(items);
          this.totalElements.set(items.length);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadReturnById(id: string): Observable<ReturnDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getById(id).pipe(
      switchMap((ret) => this.enrichReturnData(ret)),
      tap({
        next: (ret) => this.currentReturn.set(ret),
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  private enrichReturnData(ret: ReturnDetail): Observable<ReturnDetail> {
    const customer$ =
      !ret.customerName && ret.customerId
        ? this.customerApi.getById(ret.customerId).pipe(
            map((c) => ({ customerName: c.legalName, customerRif: c.rif })),
            catchError(() => of(null)),
          )
        : of(null);

    const linesNeedingProducts = ret.lines.filter((l) => !l.productName || !l.productCode);
    const productIds = [...new Set(linesNeedingProducts.map((l) => l.productId))];
    const products$ =
      productIds.length > 0
        ? forkJoin(
            productIds.map((pid) =>
              this.productApi.getById(pid).pipe(
                map((p) => ({ id: p.id, name: p.name, code: p.code })),
                catchError(() => of(null)),
              ),
            ),
          ).pipe(
            map((products) => {
              const map = new Map(products.filter((p) => p).map((p) => [p!.id, p!]));
              return ret.lines.map((line) => {
                const product = map.get(line.productId);
                return {
                  ...line,
                  productName: line.productName || product?.name || '',
                  productCode: line.productCode || product?.code || '',
                };
              });
            }),
          )
        : of(ret.lines);

    return forkJoin({ customer: customer$, lines: products$ }).pipe(
      map(({ customer, lines }) => ({
        ...ret,
        customerName: customer?.customerName ?? ret.customerName,
        customerRif: customer?.customerRif ?? ret.customerRif,
        totalAmount: ret.totalAmount ?? 0,
        lines,
      })),
    );
  }

  createReturn(data: ReturnCreate): Observable<ReturnDetail> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.create(data).pipe(
      tap({
        next: (ret) => {
          const listItem = ReturnMapper.toList(ret);
          this.returns.update((current) => [listItem, ...current]);
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  deleteReturn(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.delete(id).pipe(
      tap({
        next: () => {
          this.returns.update((current) => current.filter((r) => r.id !== id));
          if (this.currentReturn()?.id === id) {
            this.currentReturn.set(null);
          }
        },
        error: (err: Error) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }
}
