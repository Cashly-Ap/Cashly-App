import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PriceTypeApplicationService } from '@features/catalog/price-types/services/application/price-type-application.service';
import { PriceTypeApiService } from '@features/catalog/price-types/services/api/price-type-api.service';
import { PriceTypeDetails } from '@features/catalog/price-types/models/interfaces/price-type-details.interface';

describe('PriceTypeApplicationService', () => {
  let service: PriceTypeApplicationService;
  let apiMock: Partial<PriceTypeApiService>;

  const mockDetails: PriceTypeDetails = {
    id: '1',
    name: 'Precio Mayorista',
    active: true,
  };

  const mockPage = {
    content: [
      { id: '1', name: 'Precio Mayorista', active: true, deletable: true },
      { id: '2', name: 'Precio Minorista', active: true, deletable: true },
    ],
    totalElements: 2,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: false,
  };

  beforeEach(() => {
    apiMock = {
      getAll: vi.fn().mockReturnValue(of(mockPage)),
      findById: vi.fn().mockReturnValue(of(mockDetails)),
      create: vi.fn().mockReturnValue(of(mockDetails)),
      update: vi.fn().mockReturnValue(of(mockDetails)),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      providers: [PriceTypeApplicationService, { provide: PriceTypeApiService, useValue: apiMock }],
    });

    service = TestBed.inject(PriceTypeApplicationService);
  });

  it('should_load_all_price_types_and_update_signals', () => {
    service.loadAll().subscribe();
    expect(service.priceTypes()).toHaveLength(2);
    expect(service.totalElements()).toBe(2);
    expect(service.isLoading()).toBe(false);
  });

  it('should_pass_filters_to_api', () => {
    service.loadAll({ size: 1000 }).subscribe();
    expect(apiMock.getAll).toHaveBeenCalledWith({ size: 1000 });
  });

  it('should_load_price_type_by_id_and_update_selected', () => {
    service.loadById('1').subscribe();
    expect(service.selectedPriceType()?.name).toBe('Precio Mayorista');
  });

  it('should_create_price_type_and_add_to_list', () => {
    service.create({ name: 'Nuevo Tipo' }).subscribe();
    expect(service.priceTypes()).toHaveLength(1);
  });

  it('should_delete_price_type_and_remove_from_list', () => {
    service.loadAll().subscribe();
    service.remove('1').subscribe();
    expect(service.priceTypes()).toHaveLength(1);
    expect(service.priceTypes()[0].id).toBe('2');
  });

  it('should_set_error_signal_on_load_failure', () => {
    apiMock.getAll = vi.fn().mockReturnValue(throwError(() => new Error('Network error')));
    service.loadAll().subscribe({ error: () => {} });
    expect(service.error()).toBe('Network error');
    expect(service.isLoading()).toBe(false);
  });
});
