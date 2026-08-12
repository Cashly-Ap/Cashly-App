import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PriceTypeApiService } from '@features/price-types/services/api/price-type-api.service';
import { PriceTypeList, PriceTypeDetails } from '@features/price-types/models/interfaces';

describe('PriceTypeApiService', () => {
  let service: PriceTypeApiService;
  let httpMock: HttpTestingController;

  const mockList: PriceTypeList[] = [
    { id: '1', name: 'Precio Mayorista', active: true },
    { id: '2', name: 'Precio Minorista', active: true },
  ];

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

  describe('findAll()', () => {
    it('should_GET_price_types_list', () => {
      service.findAll().subscribe((result) => {
        expect(result).toEqual(mockList);
      });
      const req = httpMock.expectOne('/api/price-types');
      expect(req.request.method).toBe('GET');
      req.flush(mockList);
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
