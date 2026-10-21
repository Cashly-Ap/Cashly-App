import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
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
}
@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/company`;
  readonly company = signal<Company | null>(null);
  readonly logoUrl = signal<string | null>(null);
  private generation = 0;
  load(): Observable<Company> {
    return this.http.get<Company>(this.url).pipe(tap((company) => this.accept(company)));
  }
  update(data: Omit<Company, 'id' | 'logoPath'>): Observable<Company> {
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
  clear(): void {
    this.generation++;
    this.company.set(null);
    this.clearLogo();
  }
  clearLogo(): void {
    const old = this.logoUrl();
    if (old) URL.revokeObjectURL(old);
    this.logoUrl.set(null);
  }
  private accept(company: Company): void {
    const changed = this.company()?.logoPath !== company.logoPath;
    this.company.set(company);
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
