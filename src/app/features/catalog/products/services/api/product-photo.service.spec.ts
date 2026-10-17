import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProductPhotoService } from '@features/catalog/products/services/api/product-photo.service';

describe('ProductPhotoService', () => {
  let service: ProductPhotoService;
  let httpMock: HttpTestingController;

  const mockBlob = new Blob(['test image content'], { type: 'image/png' });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductPhotoService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ProductPhotoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('uploadPhoto()', () => {
    it('should POST /api/products/:id/photo with FormData', () => {
      const file = new File(['photo content'], 'test.png', { type: 'image/png' });

      service.uploadPhoto('prod-001', file).subscribe((result) => {
        expect(result).toBeNull();
      });

      const req = httpMock.expectOne('/api/products/prod-001/photo');
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush(null, { status: 200, statusText: 'OK' });
    });
  });

  describe('deletePhoto()', () => {
    it('should DELETE /api/products/:id/photo', () => {
      service.deletePhoto('prod-001').subscribe();

      const req = httpMock.expectOne('/api/products/prod-001/photo');
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  describe('getPhotoUrl()', () => {
    it('should GET file blob and return object URL', () => {
      service.getPhotoUrl('photos/test.png').subscribe((url) => {
        expect(url).toBeTruthy();
        expect(typeof url).toBe('string');
        expect(url).toContain('blob:');
      });

      const req = httpMock.expectOne('/api/files/photos/test.png');
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });

    it('should return null on HTTP error', () => {
      service.getPhotoUrl('photos/missing.png').subscribe((url) => {
        expect(url).toBeNull();
      });

      const req = httpMock.expectOne('/api/files/photos/missing.png');
      req.flush(null, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('loadPhoto()', () => {
    it('should set photoUrl to null when photoPath is null', () => {
      service.loadPhoto(null);
      expect(service.photoUrl()).toBeNull();
    });

    it('should set photoUrl to null when photoPath is undefined', () => {
      service.loadPhoto(undefined as unknown as string | null);
      expect(service.photoUrl()).toBeNull();
    });

    it('should load photo and set photoUrl with object URL', () => {
      service.loadPhoto('photos/test.png');

      const req = httpMock.expectOne('/api/files/photos/test.png');
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);

      expect(service.photoUrl()).toBeTruthy();
      expect(typeof service.photoUrl()).toBe('string');
    });

    it('should keep photoUrl null on HTTP error', () => {
      service.loadPhoto('photos/missing.png');

      const req = httpMock.expectOne('/api/files/photos/missing.png');
      req.flush(null, { status: 404, statusText: 'Not Found' });

      expect(service.photoUrl()).toBeNull();
    });
  });

  describe('clearPhoto()', () => {
    it('should set photoUrl to null', () => {
      service.clearPhoto();
      expect(service.photoUrl()).toBeNull();
    });
  });

  describe('ngOnDestroy()', () => {
    it('should revoke all object URLs', () => {
      const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');

      service.ngOnDestroy();

      expect(revokeSpy).not.toHaveBeenCalled();
    });
  });
});
