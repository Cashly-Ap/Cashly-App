import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { StockOverviewApiService } from './stock-overview-api.service';

describe('StockOverviewApiService', () => {
  let service: StockOverviewApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StockOverviewApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('sends all filters and pagination to the inventory endpoint', () => {
    service
      .getOverview({
        groupBy: 'WAREHOUSE',
        warehouseId: 'wh-2',
        categoryId: 'cat-1',
        search: ' M-01 ',
        page: 2,
        size: 25,
      })
      .subscribe();
    const req = http.expectOne((request) => request.url === '/api/warehouses/stock');
    expect(req.request.params.get('groupBy')).toBe('WAREHOUSE');
    expect(req.request.params.get('warehouseId')).toBe('wh-2');
    expect(req.request.params.get('categoryId')).toBe('cat-1');
    expect(req.request.params.get('search')).toBe('M-01');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('25');
    req.flush({});
  });

  it('omits optional filters for the consolidated stock view', () => {
    service.getOverview({ page: 0, size: 10 }).subscribe();
    const req = http.expectOne((request) => request.url === '/api/warehouses/stock');
    expect(req.request.params.keys().sort()).toEqual(['page', 'size']);
    req.flush({});
  });
});
