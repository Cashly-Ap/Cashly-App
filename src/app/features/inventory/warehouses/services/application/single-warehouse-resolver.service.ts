import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { CustomerApiService } from '@features/partners/customers/services/api/customer-api.service';
import { WarehouseApiService } from '@features/inventory/warehouses/services/api/warehouse-api.service';
import { WarehouseList } from '@features/inventory/warehouses/models/interfaces/warehouse.interfaces';
import { SingleWarehouseContext } from '@features/inventory/warehouses/models/interfaces/single-warehouse.interface';

@Injectable({ providedIn: 'root' })
export class SingleWarehouseResolverService {
  private readonly warehouseApi = inject(WarehouseApiService);
  private readonly customerApi = inject(CustomerApiService);

  resolveForCompany(): Observable<SingleWarehouseContext | null> {
    return this.warehouseApi.getAllSimple().pipe(
      catchError(() => of([])),
      map((warehouses) => (warehouses.length === 1 ? this.toContext(warehouses[0]) : null)),
    );
  }

  resolveForCustomer(
    customerId: string | null | undefined,
  ): Observable<SingleWarehouseContext | null> {
    if (!customerId) return of(null);

    return forkJoin({
      warehouses: this.warehouseApi.getAllSimple().pipe(catchError(() => of([]))),
      assignments: this.customerApi.getWarehouseAccess(customerId).pipe(catchError(() => of([]))),
    }).pipe(
      map(({ warehouses, assignments }) => {
        if (warehouses.length === 1) return this.toContext(warehouses[0]);
        if (assignments.length !== 1) return null;

        const assignment = assignments[0];
        const warehouse = warehouses.find((item) => item.id === assignment.warehouseId);
        if (!warehouse) return null;

        return this.toContext(warehouse);
      }),
    );
  }

  private toContext(warehouse: WarehouseList): SingleWarehouseContext {
    return { id: warehouse.id, code: '', name: warehouse.name };
  }
}
