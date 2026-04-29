import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductPhotoService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly productsUrl = '/api/products';
  private readonly filesUrl = '/api/files';

  private readonly objectUrls = new Set<string>();

  private readonly _photoUrl = signal<string | null>(null);
  readonly photoUrl = this._photoUrl.asReadonly();

  loadPhoto(photoPath: string | null): void {
    this._photoUrl.set(null);
    if (!photoPath) return;

    this.http
      .get(`${this.filesUrl}/${photoPath}`, { responseType: 'blob' })
      .pipe(catchError(() => of(null)))
      .subscribe((blob) => {
        if (blob) {
          const objectUrl = URL.createObjectURL(blob);
          this.objectUrls.add(objectUrl);
          this._photoUrl.set(objectUrl);
        }
      });
  }

  uploadPhoto(id: string, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<void>(`${this.productsUrl}/${id}/photo`, formData);
  }

  deletePhoto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.productsUrl}/${id}/photo`);
  }

  getPhotoUrl(photoPath: string): Observable<string | null> {
    return this.http
      .get(`${this.filesUrl}/${photoPath}`, { responseType: 'blob' })
      .pipe(
        map((blob) => {
          const objectUrl = URL.createObjectURL(blob);
          this.objectUrls.add(objectUrl);
          return objectUrl;
        }),
        catchError(() => of(null)),
      );
  }

  clearPhoto(): void {
    this._photoUrl.set(null);
  }

  ngOnDestroy(): void {
    this.revokeAll();
  }

  private revokeAll(): void {
    this.objectUrls.forEach((url) => URL.revokeObjectURL(url));
    this.objectUrls.clear();
  }
}
