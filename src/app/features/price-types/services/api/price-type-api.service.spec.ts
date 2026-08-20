import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PriceTypeApiService } from '@features/price-types/services/api/price-type-api.service';
import { PriceTypeList, PriceTypeDetails } from '@features/price-types/models/interfaces';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

describe('PriceTypeApiService', () => {
  let service: PriceTypeApiService;
  let httpMock: HttpTestingController;

  const mockPage: PagedResponse<PriceTypeList> = {
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

  const mockDetails: PriceTypeDetails = {
    id: '1',
    name: 'Precio Mayorista',
    active: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PriceTypeApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PriceTypeApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll()', () => {
    it('should_GET_price_types_page', () => {
      service.getAll().subscribe((result) => {
        expect(result).toEqual(mockPage);
      });
      const req = httpMock.expectOne('/api/price-types');
      expect(req.request.method).toBe('GET');
      req.flush(mockPage);
    });

    it('should_send_pagination_and_filter_params', () => {
      service
        .getAll({ search: 'Mayo', active: true, page: 1, size: 25, orderBy: 'name', orderDir: 'desc' })
        .subscribe();
      const req = httpMock.expectOne(
        (r) =>
          r.url === '/api/price-types' &&
          r.params.get('search') === 'Mayo' &&
          r.params.get('active') === 'true' &&
          r.params.get('page') === '1' &&
          r.params.get('size') === '25' &&
          r.params.get('orderBy') === 'name' &&
          r.params.get('orderDir') === 'desc',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPage);
    });
  });

  describe('findById()', () => {
    it('should_GET_price_type_by_id', () => {
      service.findById('1').subscribe((result) => {
        expect(result).toEqual(mockDetails);
      });
      const req = httpMock.expectOne('/api/price-types/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockDetails);
    });
  });

  describe('create()', () => {
    it('should_POST_to_create_price_type', () => {
      service.create({ name: 'Precio Mayorista' }).subscribe((result) => {
        expect(result).toEqual(mockDetails);
      });
      const req = httpMock.expectOne('/api/price-types');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: 'Precio Mayorista' });
      req.flush(mockDetails);
    });
  });

  describe('update()', () => {
    it('should_PUT_to_update_price_type', () => {
      service
        .update('1', { name: 'Precio Mayorista Updated', active: true })
        .subscribe((result) => {
          expect(result).toEqual(mockDetails);
        });
      const req = httpMock.expectOne('/api/price-types/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ name: 'Precio Mayorista Updated', active: true });
      req.flush(mockDetails);
    });
  });

  describe('delete()', () => {
    it('should_DELETE_price_type_by_id', () => {
      service.delete('1').subscribe();
      const req = httpMock.expectOne('/api/price-types/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });
});
