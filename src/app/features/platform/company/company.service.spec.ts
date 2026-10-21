import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Company, CompanyService } from './company.service';

describe('CompanyService branding lifecycle', () => {
  const company: Company = {
    id: 'installation',
    legalName: 'Example Company',
    tradeName: null,
    taxId: null,
    email: null,
    phone: null,
    website: null,
    address: null,
    logoPath: 'company/logo.png',
  };
  let service: CompanyService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CompanyService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    service.clear();
    http.verify();
    vi.restoreAllMocks();
  });

  it('loads the logo as an authenticated HTTP blob and releases it on logout', () => {
    const revoke = vi.spyOn(URL, 'revokeObjectURL');
    service.load().subscribe();
    http.expectOne('/api/company').flush(company);
    const request = http.expectOne('/api/company/logo');
    expect(request.request.responseType).toBe('blob');
    request.flush(new Blob(['image'], { type: 'image/png' }));
    const url = service.logoUrl();
    expect(url).toMatch(/^blob:/);
    service.clear();
    expect(service.logoUrl()).toBeNull();
    expect(service.company()).toBeNull();
    expect(revoke).toHaveBeenCalledWith(url);
  });

  it('does not restore a private logo if logout occurs while its request is pending', () => {
    const create = vi.spyOn(URL, 'createObjectURL');
    service.load().subscribe();
    http.expectOne('/api/company').flush(company);
    const pending = http.expectOne('/api/company/logo');
    service.clear();
    pending.flush(new Blob(['image']));
    expect(service.logoUrl()).toBeNull();
    expect(create).not.toHaveBeenCalled();
  });

  it('preserves the fallback after a logo failure and accepts a later upload', () => {
    service.load().subscribe();
    http.expectOne('/api/company').flush(company);
    http.expectOne('/api/company/logo').flush(null, { status: 404, statusText: 'Not Found' });
    expect(service.logoUrl()).toBeNull();
    const file = new File(['png'], 'logo.png', { type: 'image/png' });
    service.upload(file).subscribe();
    const upload = http.expectOne('/api/company/logo');
    expect(upload.request.method).toBe('POST');
    expect(upload.request.body.get('file')).toBe(file);
    upload.flush({ ...company, logoPath: 'company/replaced.png' });
    http.expectOne('/api/company/logo').flush(new Blob(['new']));
    expect(service.logoUrl()).toMatch(/^blob:/);
  });
  it('uploads a separate PDF logo without replacing the navbar logo and removes it independently', () => {
    service.load().subscribe();
    http.expectOne('/api/company').flush(company);
    http.expectOne('/api/company/logo').flush(new Blob(['navbar']));
    const navbarLogo = service.logoUrl();
    const file = new File(['pdf'], 'pdf-logo.png', { type: 'image/png' });
    service.uploadPdfLogo(file).subscribe();
    const upload = http.expectOne('/api/company/pdf-logo');
    expect(upload.request.method).toBe('POST');
    expect(upload.request.body.get('file')).toBe(file);
    upload.flush({ ...company, pdfLogoPath: 'company/pdf.png' });
    const preview = http.expectOne('/api/company/pdf-logo');
    expect(preview.request.responseType).toBe('blob');
    preview.flush(new Blob(['pdf']));
    const pdfLogo = service.pdfLogoUrl();
    expect(pdfLogo).toMatch(/^blob:/);
    expect(service.logoUrl()).toBe(navbarLogo);
    const revoke = vi.spyOn(URL, 'revokeObjectURL');
    service.removePdfLogo().subscribe();
    const remove = http.expectOne('/api/company/pdf-logo');
    expect(remove.request.method).toBe('DELETE');
    remove.flush({ ...company, pdfLogoPath: null });
    expect(service.pdfLogoUrl()).toBeNull();
    expect(revoke).toHaveBeenCalledWith(pdfLogo);
    expect(service.logoUrl()).toBe(navbarLogo);
  });

  it('does not restore the PDF logo when a pending private request finishes after logout', () => {
    service.load().subscribe();
    http
      .expectOne('/api/company')
      .flush({ ...company, logoPath: null, pdfLogoPath: 'company/pdf.png' });
    const pending = http.expectOne('/api/company/pdf-logo');
    service.clear();
    pending.flush(new Blob(['pdf']));
    expect(service.pdfLogoUrl()).toBeNull();
  });
  it('previews pending images and removals without mutating saved company branding', () => {
    const file = new File(['pdf'], 'pdf.png', { type: 'image/png' });
    const companyLogo = new File(['navbar'], 'navbar.png', { type: 'image/png' });
    let result: Blob | undefined;
    service
      .previewPdfLogo({ file, companyLogo, removePdfLogo: true, removeLogo: true })
      .subscribe((blob) => (result = blob));
    const preview = http.expectOne('/api/company/pdf-logo/preview');
    expect(preview.request.method).toBe('POST');
    expect(preview.request.responseType).toBe('blob');
    expect(preview.request.body.get('file')).toBe(file);
    expect(preview.request.body.get('companyLogo')).toBe(companyLogo);
    expect(preview.request.body.get('removePdfLogo')).toBe('true');
    expect(preview.request.body.get('removeLogo')).toBe('true');
    const pdf = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
    preview.flush(pdf);
    expect(result).toBe(pdf);
    expect(service.company()).toBeNull();
    expect(service.logoUrl()).toBeNull();
    expect(service.pdfLogoUrl()).toBeNull();
  });
});
