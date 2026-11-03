import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable, tap } from 'rxjs';
import { UserDetails } from '@features/platform/auth/user/models/interfaces/user-details.interface';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
@Injectable({ providedIn: 'root' })
export class UserPhotoService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private endpoint(id?: string): string {
    return `${environment.apiUrl}/${id ? `users/${id}` : 'auth/profile'}/photo`;
  }
  get(id?: string): Observable<Blob> {
    return this.http.get(this.endpoint(id), { responseType: 'blob' });
  }
  upload(file: File, id?: string): Observable<UserDetails> {
    const data = new FormData();
    data.append('file', file);
    return this.http
      .post<UserDetails>(this.endpoint(id), data)
      .pipe(tap((user) => this.sync(user, id)));
  }
  remove(id?: string): Observable<UserDetails> {
    return this.http
      .delete<UserDetails>(this.endpoint(id))
      .pipe(tap((user) => this.sync(user, id)));
  }
  private sync(user: UserDetails, id?: string): void {
    if (!id || id === this.auth.currentUser()?.id)
      this.auth.syncProfilePhoto(user.photoPath ?? null);
  }
}
