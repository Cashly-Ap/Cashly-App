import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MovementOverviewApiService } from './movement-overview-api.service';

describe('MovementOverviewApiService', () => {
  let service: MovementOverviewApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MovementOverviewApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('sends every filter, grouping and pagination to the movements endpoint', () => {
    service
      .getOverview({
        groupBy: 'MOVEMENT_TYPE',
        warehouseId: '11111111-1111-4111-8111-111111111111',
        productId: '22222222-2222-4222-8222-222222222222',
        movementType: 'EXIT',
        search: ' M-01 ',
        page: 2,
        size: 25,
      })
      .subscribe();

    const req = http.expectOne((request) => request.url === '/api/warehouses/movements');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('groupBy')).toBe('MOVEMENT_TYPE');
    expect(req.request.params.get('warehouseId')).toBe(
      '11111111-1111-4111-8111-111111111111',
    );
    expect(req.request.params.get('productId')).toBe(
      '22222222-2222-4222-8222-222222222222',
    );
    expect(req.request.params.get('movementType')).toBe('EXIT');
    expect(req.request.params.get('search')).toBe('M-01');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('25');
    req.flush({});
  });

  it('omits optional filters for the consolidated movements view', () => {
    service.getOverview({ page: 0, size: 10 }).subscribe();

    const req = http.expectOne((request) => request.url === '/api/warehouses/movements');
    expect(req.request.params.keys().sort()).toEqual(['page', 'size']);
    req.flush({});
  });

  it('sends the initial global movements request without a warehouse parameter', () => {
    service.getOverview({ groupBy: 'PRODUCT', page: 0, size: 10 }).subscribe();

    const req = http.expectOne((request) => request.url === '/api/warehouses/movements');
    expect(req.request.params.has('warehouseId')).toBe(false);
    expect(req.request.params.get('groupBy')).toBe('PRODUCT');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    req.flush({});
  });

  it('omits an empty warehouseId so the backend treats it as optional', () => {
    service
      .getOverview({ groupBy: 'PRODUCT', warehouseId: '', page: 0, size: 10 })
      .subscribe();

    const req = http.expectOne((request) => request.url === '/api/warehouses/movements');
    expect(req.request.params.has('warehouseId')).toBe(false);
    req.flush({});
  });

  it('omits malformed identifiers and invalid enums before calling the backend', () => {
    service
      .getOverview({
        groupBy: 'PRODUCT',
        warehouseId: 'wh-2',
        productId: 'p-1',
        movementType: 'NOT_A_TYPE' as never,
        page: 0,
        size: 10,
      })
      .subscribe();

    const req = http.expectOne((request) => request.url === '/api/warehouses/movements');
    expect(req.request.params.has('warehouseId')).toBe(false);
    expect(req.request.params.has('productId')).toBe(false);
    expect(req.request.params.has('movementType')).toBe(false);
    req.flush({});
  });

  it('omits blank search values', () => {
    service.getOverview({ groupBy: 'PRODUCT', search: '   ', page: 0, size: 10 }).subscribe();

    const req = http.expectOne((request) => request.url === '/api/warehouses/movements');
    expect(req.request.params.has('search')).toBe(false);
    expect(req.request.params.get('groupBy')).toBe('PRODUCT');
    req.flush({});
  });

  it('clamps pagination and truncates oversized searches', () => {
    service
      .getOverview({ groupBy: 'PRODUCT', search: ` ${'x'.repeat(250)} `, page: -3, size: 500 })
      .subscribe();

    const req = http.expectOne((request) => request.url === '/api/warehouses/movements');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('100');
    expect(req.request.params.get('search')).toHaveLength(200);
    req.flush({});
  });

  it('sends NONE when the ungrouped movements view is requested explicitly', () => {
    service.getOverview({ groupBy: 'NONE', page: 0, size: 10 }).subscribe();

    const req = http.expectOne((request) => request.url === '/api/warehouses/movements');
    expect(req.request.params.get('groupBy')).toBe('NONE');
    expect(req.request.params.has('warehouseId')).toBe(false);
    expect(req.request.params.has('productId')).toBe(false);
    expect(req.request.params.has('movementType')).toBe(false);
    req.flush({});
  });
});
