import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { CommercialCatalogPdfApiService } from '@features/reports/inventory/services/api/commercial-catalog-pdf-api.service';

describe('CommercialCatalogPdfApiService', () => {
  let service: CommercialCatalogPdfApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommercialCatalogPdfApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CommercialCatalogPdfApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should GET /api/reports/inventory/commercial-catalog/pdf without filters', () => {
    service.downloadPdf({}).subscribe();

    const req = httpMock.expectOne('/api/reports/inventory/commercial-catalog/pdf');
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob());
  });

  it('should set search query param when search provided', () => {
    service.downloadPdf({ search: 'test' }).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === '/api/reports/inventory/commercial-catalog/pdf' &&
        r.params.get('search') === 'test',
    );
    expect(req.request.method).toBe('GET');
    req.flush(new Blob());
  });

  it('should set categoryId query param when provided', () => {
    service.downloadPdf({ categoryId: 'cat-1' }).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === '/api/reports/inventory/commercial-catalog/pdf' &&
        r.params.get('categoryId') === 'cat-1',
    );
    expect(req.request.method).toBe('GET');
    req.flush(new Blob());
  });

  it('should set priceTypeId query param when provided', () => {
    service.downloadPdf({ priceTypeId: 'pt-1' }).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === '/api/reports/inventory/commercial-catalog/pdf' &&
        r.params.get('priceTypeId') === 'pt-1',
    );
    expect(req.request.method).toBe('GET');
    req.flush(new Blob());
  });

  it('should set all query params when all filters provided', () => {
    service
      .downloadPdf({ search: 'prod', categoryId: 'cat-2', priceTypeId: 'pt-3', active: false })
      .subscribe();

    const req = httpMock.expectOne((r) => {
      return (
        r.url === '/api/reports/inventory/commercial-catalog/pdf' &&
        r.params.get('search') === 'prod' &&
        r.params.get('categoryId') === 'cat-2' &&
        r.params.get('priceTypeId') === 'pt-3' &&
        r.params.get('active') === 'false'
      );
    });
    expect(req.request.method).toBe('GET');
    req.flush(new Blob());
  });
});
