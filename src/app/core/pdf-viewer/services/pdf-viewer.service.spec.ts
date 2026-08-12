import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PdfViewerService } from '@core/pdf-viewer/services/pdf-viewer.service';
import { PdfViewerConfig } from '@core/pdf-viewer/models';

describe('PdfViewerService', () => {
  let service: PdfViewerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PdfViewerService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PdfViewerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.close();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial state as not visible', () => {
    expect(service.visible()).toBe(false);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
    expect(service.config()).toBeNull();
  });

  describe('open', () => {
    const mockConfig: PdfViewerConfig = {
      url: '/api/products/pdf/catalog',
      title: 'Catálogo de Productos',
      fileName: 'catalogo.pdf',
      params: { differentialId: '123' },
    };

    it('should set visible and loading to true when opening', () => {
      service.open(mockConfig);

      expect(service.visible()).toBe(true);
      expect(service.loading()).toBe(true);
      expect(service.config()).toEqual(mockConfig);

      const req = httpMock.expectOne((r) => r.url === '/api/products/pdf/catalog');
      req.flush(new Blob(['test'], { type: 'application/pdf' }));
    });

    it('should include params in request', () => {
      service.open(mockConfig);

      const req = httpMock.expectOne(
        (r) => r.url === '/api/products/pdf/catalog' && r.params.get('differentialId') === '123',
      );
      expect(req.request.params.get('differentialId')).toBe('123');

      req.flush(new Blob(['test'], { type: 'application/pdf' }));
    });

    it('should set loading to false and create blob URL on success', () => {
      service.open(mockConfig);

      const req = httpMock.expectOne((r) => r.url === '/api/products/pdf/catalog');
      req.flush(new Blob(['test'], { type: 'application/pdf' }));

      expect(service.loading()).toBe(false);
      expect(service.pdfSafeUrl()).toBeTruthy();
      expect(service.error()).toBeNull();
    });

    it('should set error message on failure', () => {
      service.open(mockConfig);

      const req = httpMock.expectOne((r) => r.url === '/api/products/pdf/catalog');
      req.error(new ProgressEvent('error'), { status: 500 });

      expect(service.loading()).toBe(false);
      expect(service.error()).toBe(
        'Error al cargar el documento PDF. Por favor, intente nuevamente.',
      );
    });

    it('should set specific error message for 404', () => {
      service.open(mockConfig);

      const req = httpMock.expectOne((r) => r.url === '/api/products/pdf/catalog');
      req.error(new ProgressEvent('error'), { status: 404 });

      expect(service.error()).toBe('El documento PDF no fue encontrado');
    });
  });

  describe('close', () => {
    it('should reset state when closing', () => {
      const mockConfig: PdfViewerConfig = {
        url: '/api/test',
        title: 'Test',
      };

      service.open(mockConfig);
      const req = httpMock.expectOne('/api/test');
      req.flush(new Blob(['test'], { type: 'application/pdf' }));

      service.close();

      expect(service.visible()).toBe(false);
      expect(service.loading()).toBe(false);
      expect(service.error()).toBeNull();
      expect(service.config()).toBeNull();
      expect(service.pdfSafeUrl()).toBeNull();
    });
  });

  describe('download', () => {
    it('should not throw when no blob URL exists', () => {
      expect(() => service.download()).not.toThrow();
    });
  });

  describe('openFullscreen', () => {
    it('should not throw when no blob URL exists', () => {
      expect(() => service.openFullscreen()).not.toThrow();
    });
  });
});
