import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  WarehouseActionDialogRequest,
  WarehouseActionDialogService,
} from '@core/layouts/services/warehouse-action-dialog.service';

describe('WarehouseActionDialogService', () => {
  let service: WarehouseActionDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WarehouseActionDialogService);
  });

  it('starts without a pending request', () => {
    expect(service.request()).toBeNull();
  });

  it('stores the requested warehouse operation', () => {
    const request: WarehouseActionDialogRequest = {
      warehouseId: 'warehouse-1',
      warehouseName: 'Central',
      operation: 'entry',
    };

    service.open(request);

    expect(service.request()).toEqual(request);
  });

  it('clears the request when closed', () => {
    service.open({ warehouseId: 'warehouse-1', warehouseName: 'Central', operation: 'exit' });

    service.close();

    expect(service.request()).toBeNull();
  });
});
