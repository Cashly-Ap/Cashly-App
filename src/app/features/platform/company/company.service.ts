import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { finalize, shareReplay } from 'rxjs/operators';
import { environment } from '@env/environment';

const COMPANY_CACHE_KEY = 'cashly:company-cache';
const COMPANY_CACHE_TTL = 5 * 60 * 1000;
export interface Company {
  id: string;
  legalName: string;
  tradeName: string | null;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: {
    street: string | null;
    city: string | null;
    region: string | null;
    country: string | null;
    postalCode: string | null;
  } | null;
  logoPath: string | null;
  pdfLogoPath?: string | null;
}
@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/company`;
  readonly company = signal<Company | null>(null);
  readonly logoUrl = signal<string | null>(null);
  readonly pdfLogoUrl = signal<string | null>(null);
  private generation = 0;
  private pdfGeneration = 0;
  private loadedAt = 0;
  private inFlight$: Observable<Company> | null = null;
  load(force = false): Observable<Company> {
    const current = this.company();
    if (!force && current && this.cacheIsFresh()) return of(current);
    if (!force) {
      const cached = this.readCache();
      if (cached) {
        this.accept(cached, false);
        return of(cached);
      }
    }
    if (this.inFlight$) return this.inFlight$;
    this.inFlight$ = this.http.get<Company>(this.url).pipe(
      tap((company) => this.accept(company)),
      finalize(() => (this.inFlight$ = null)),
      shareReplay(1),
    );
    return this.inFlight$;
  }
  update(data: Omit<Company, 'id' | 'logoPath' | 'pdfLogoPath'>): Observable<Company> {
    return this.http.put<Company>(this.url, data).pipe(tap((company) => this.accept(company)));
  }
  upload(file: File): Observable<Company> {
    const data = new FormData();
    data.append('file', file);
    return this.http
      .post<Company>(`${this.url}/logo`, data)
      .pipe(tap((company) => this.accept(company)));
  }
  removeLogo(): Observable<Company> {
    return this.http
      .delete<Company>(`${this.url}/logo`)
      .pipe(tap((company) => this.accept(company)));
  }
  uploadPdfLogo(file: File): Observable<Company> {
    const data = new FormData();
    data.append('file', file);
    return this.http
      .post<Company>(`${this.url}/pdf-logo`, data)
      .pipe(tap((company) => this.accept(company)));
  }
  removePdfLogo(): Observable<Company> {
    return this.http
      .delete<Company>(`${this.url}/pdf-logo`)
      .pipe(tap((company) => this.accept(company)));
  }
  previewPdfLogo(options: {
    file: File | null;
    companyLogo: File | null;
    removePdfLogo: boolean;
    removeLogo: boolean;
  }): Observable<Blob> {
    const data = new FormData();
    if (options.file) data.append('file', options.file);
    if (options.companyLogo) data.append('companyLogo', options.companyLogo);
    data.append('removePdfLogo', String(options.removePdfLogo));
    data.append('removeLogo', String(options.removeLogo));
    return this.http.post(`${this.url}/pdf-logo/preview`, data, { responseType: 'blob' });
  }
  clear(): void {
    this.generation++;
    this.pdfGeneration++;
    this.loadedAt = 0;
    this.inFlight$ = null;
    this.clearPdfLogo();
    this.company.set(null);
    this.clearLogo();
    try {
      localStorage.removeItem(COMPANY_CACHE_KEY);
    } catch {}
  }
  clearLogo(): void {
    const old = this.logoUrl();
    if (old) URL.revokeObjectURL(old);
    this.logoUrl.set(null);
  }
  private clearPdfLogo(): void {
    const old = this.pdfLogoUrl();
    if (old) URL.revokeObjectURL(old);
    this.pdfLogoUrl.set(null);
  }
  private writeCache(company: Company): void {
    this.loadedAt = Date.now();
    try {
      localStorage.setItem(COMPANY_CACHE_KEY, JSON.stringify({ company, savedAt: this.loadedAt }));
    } catch {}
  }

  private cacheIsFresh(): boolean {
    return this.loadedAt > 0 && Date.now() - this.loadedAt < COMPANY_CACHE_TTL;
  }

  private readCache(): Company | null {
    try {
      const raw = localStorage.getItem(COMPANY_CACHE_KEY);
      if (!raw) return null;
      const cached = JSON.parse(raw) as { company?: Company; savedAt?: number };
      if (!cached.company || typeof cached.savedAt !== 'number') return null;
      if (Date.now() - cached.savedAt >= COMPANY_CACHE_TTL) {
        localStorage.removeItem(COMPANY_CACHE_KEY);
        return null;
      }
      this.loadedAt = cached.savedAt;
      return cached.company;
    } catch {
      return null;
    }
  }

  private acceptPdfLogo(company: Company): void {
    const changed = this.company()?.pdfLogoPath !== company.pdfLogoPath;
    if (!company.pdfLogoPath) {
      this.pdfGeneration++;
      this.clearPdfLogo();
      return;
    }
    if (!changed && this.pdfLogoUrl()) return;
    const generation = ++this.pdfGeneration;
    this.http.get(`${this.url}/pdf-logo`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        if (generation !== this.pdfGeneration) return;
        this.clearPdfLogo();
        this.pdfLogoUrl.set(URL.createObjectURL(blob));
      },
      error: () => {
        if (generation === this.pdfGeneration) this.clearPdfLogo();
      },
    });
  }
  private accept(company: Company, persist = true): void {
    this.acceptPdfLogo(company);
    const changed = this.company()?.logoPath !== company.logoPath;
    this.company.set(company);
    if (persist) this.writeCache(company);
    if (!company.logoPath) {
      this.generation++;
      this.clearLogo();
      return;
    }
    if (!changed && this.logoUrl()) return;
    const generation = ++this.generation;
    this.http.get(`${this.url}/logo`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        if (generation !== this.generation) return;
        this.clearLogo();
        this.logoUrl.set(URL.createObjectURL(blob));
      },
      error: () => {
        if (generation === this.generation) this.clearLogo();
      },
    });
  }
}
