import { Language } from '@core/i18n/language';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { UserDetails } from '../../user/models/interfaces/user-details.interface';

export interface SelfProfileUpdate {
  language?: Language;
  userName: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: UserDetails['address'];
}

@Injectable({ providedIn: 'root' })
export class SelfProfileService {
  private readonly http = inject(HttpClient);

  getProfile(): Observable<UserDetails> {
    return this.http.get<UserDetails>(`${environment.apiUrl}/auth/profile`);
  }
  updateProfile(profile: SelfProfileUpdate): Observable<UserDetails> {
    const { userName, firstName, lastName, phone, address, language } = profile;
    const payload: SelfProfileUpdate = {
      ...(language ? { language } : {}),
      userName,
      firstName,
      lastName,
      phone,
      address: address
        ? {
            street: address.street,
            city: address.city,
            region: address.region,
            country: address.country,
            postalCode: address.postalCode,
          }
        : null,
    };
    return this.http.put<UserDetails>(`${environment.apiUrl}/auth/profile`, payload);
  }
}
