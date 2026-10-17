import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CategoryApiService } from '@features/categories/services/api/category-api.service';
import { CategoryList } from '@features/categories/models/interfaces/category-list.interface';
import { CategoryDetails } from '@features/categories/models/interfaces/category-details.interface';

describe('CategoryApiService', () => {
  let service: CategoryApiService;
  let httpMock: HttpTestingController;

  const mockList: CategoryList[] = [
    {
      id: 1,
      name: 'Electrónica',
      description: 'Dispositivos electrónicos',
      active: true,
      productCount: 5,
      deletable: false,
    },
  ];

  const mockDetails: CategoryDetails = {
    id: 1,
    name: 'Electrónica',
    description: 'Dispositivos electrónicos',
    active: true,
    productCount: 5,
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T10:30:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CategoryApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CategoryApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll()', () => {
    it('should_GET_categories_and_return_paged_list', () => {
      const paged = {
        content: mockList,
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: false,
      };
      service.getAll().subscribe((result) => {
        expect(result.content).toEqual(mockList);
      });
      const req = httpMock.expectOne('/api/categories');
      expect(req.request.method).toBe('GET');
      req.flush(paged);
    });
  });

  describe('getById()', () => {
    it('should_GET_category_by_id', () => {
      service.getById(1).subscribe((result) => {
        expect(result).toEqual(mockDetails);
      });
      const req = httpMock.expectOne('/api/categories/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockDetails);
    });
  });

  describe('create()', () => {
    it('should_POST_to_create_category', () => {
      service.create({ name: 'Electrónica', description: 'Dispositivos' }).subscribe((result) => {
        expect(result).toEqual(mockDetails);
      });
      const req = httpMock.expectOne('/api/categories');
      expect(req.request.method).toBe('POST');
      req.flush(mockDetails);
    });
  });

  describe('update()', () => {
    it('should_PUT_to_update_category', () => {
      service.update(1, { name: 'Electrónica Updated' }).subscribe((result) => {
        expect(result).toEqual(mockDetails);
      });
      const req = httpMock.expectOne('/api/categories/1');
      expect(req.request.method).toBe('PUT');
      req.flush(mockDetails);
    });
  });

  describe('delete()', () => {
    it('should_DELETE_category_by_id', () => {
      service.delete(1).subscribe();
      const req = httpMock.expectOne('/api/categories/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });
});
