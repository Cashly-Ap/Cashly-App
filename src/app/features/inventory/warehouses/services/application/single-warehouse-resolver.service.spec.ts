import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { firstValueFrom, of, throwError } from 'rxjs';
import { SingleWarehouseResolverService } from '@features/inventory/warehouses/services/application/single-warehouse-resolver.service';
import { WarehouseApiService } from '@features/inventory/warehouses/services/api/warehouse-api.service';
import { CustomerApiService } from '@features/partners/customers/services/api/customer-api.service';
import { WarehouseList } from '@features/inventory/warehouses/models/interfaces/warehouse.interfaces';
import { CustomerWarehouseAccessItem } from '@features/partners/customers/models/interfaces/customer-warehouse-access.interface';

const warehouse = (id: string, name: string): WarehouseList => ({
  id,
  name,
  state: '',
  municipality: '',
  active: true,
  deletable: true,
});

const assignment = (warehouseId: string, warehouseName: string): CustomerWarehouseAccessItem => ({
  id: 'access-1',
  customerId: 'customer-1',
  warehouseId,
  warehouseName,
});

describe('SingleWarehouseResolverService', () => {
  let service: SingleWarehouseResolverService;
  let warehouseApi: { getAllSimple: ReturnType<typeof vi.fn> };
  let customerApi: { getWarehouseAccess: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    warehouseApi = { getAllSimple: vi.fn() };
    customerApi = { getWarehouseAccess: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        SingleWarehouseResolverService,
        { provide: WarehouseApiService, useValue: warehouseApi },
        { provide: CustomerApiService, useValue: customerApi },
      ],
    });

    service = TestBed.inject(SingleWarehouseResolverService);
  });

  it('should resolve the only company warehouse', async () => {
    warehouseApi.getAllSimple.mockReturnValue(of([warehouse('wh-1', 'Principal')]));

    const result = await firstValueFrom(service.resolveForCompany());

    expect(result).toEqual({ id: 'wh-1', code: '', name: 'Principal' });
  });

  it('should return null when the company has several warehouses', async () => {
    warehouseApi.getAllSimple.mockReturnValue(
      of([warehouse('wh-1', 'Principal'), warehouse('wh-2', 'Secundario')]),
    );

    const result = await firstValueFrom(service.resolveForCompany());

    expect(result).toBeNull();
  });

  it('should resolve the single warehouse assigned to the customer', async () => {
    warehouseApi.getAllSimple.mockReturnValue(
      of([warehouse('wh-1', 'Principal'), warehouse('wh-2', 'Secundario')]),
    );
    customerApi.getWarehouseAccess.mockReturnValue(of([assignment('wh-2', 'Secundario')]));

    const result = await firstValueFrom(service.resolveForCustomer('customer-1'));

    expect(result).toEqual({ id: 'wh-2', code: '', name: 'Secundario' });
  });

  it('should return null without a customer id', async () => {
    const result = await firstValueFrom(service.resolveForCustomer(null));

    expect(result).toBeNull();
    expect(warehouseApi.getAllSimple).not.toHaveBeenCalled();
  });

  it('should return null when the warehouse list cannot be loaded', async () => {
    warehouseApi.getAllSimple.mockReturnValue(throwError(() => new Error('boom')));

    await expect(firstValueFrom(service.resolveForCompany())).resolves.toBeNull();
  });

  it('should return null when the assigned warehouse is not active', async () => {
    warehouseApi.getAllSimple.mockReturnValue(
      of([warehouse('wh-1', 'Principal'), warehouse('wh-2', 'Secundario')]),
    );
    customerApi.getWarehouseAccess.mockReturnValue(of([assignment('wh-9', 'Retired')]));

    const result = await firstValueFrom(service.resolveForCustomer('customer-1'));

    expect(result).toBeNull();
  });

  it('should fall back to the company warehouse when the access call fails', async () => {
    warehouseApi.getAllSimple.mockReturnValue(of([warehouse('wh-1', 'Principal')]));
    customerApi.getWarehouseAccess.mockReturnValue(throwError(() => new Error('forbidden')));

    const result = await firstValueFrom(service.resolveForCustomer('customer-1'));

    expect(result).toEqual({ id: 'wh-1', code: '', name: 'Principal' });
  });

  it('should return null when the customer has several assigned warehouses', async () => {
    warehouseApi.getAllSimple.mockReturnValue(
      of([warehouse('wh-1', 'Principal'), warehouse('wh-2', 'Secundario')]),
    );
    customerApi.getWarehouseAccess.mockReturnValue(
      of([assignment('wh-1', 'Principal'), assignment('wh-2', 'Secundario')]),
    );

    const result = await firstValueFrom(service.resolveForCustomer('customer-1'));

    expect(result).toBeNull();
  });

  it('should resolve the only company warehouse when the customer has no assignment', async () => {
    warehouseApi.getAllSimple.mockReturnValue(of([warehouse('wh-1', 'Principal')]));
    customerApi.getWarehouseAccess.mockReturnValue(of([]));

    const result = await firstValueFrom(service.resolveForCustomer('customer-1'));

    expect(result).toEqual({ id: 'wh-1', code: '', name: 'Principal' });
  });
});
