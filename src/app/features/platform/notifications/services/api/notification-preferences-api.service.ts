import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  NotificationPreferences,
  NotificationPreferencesUpdate,
} from '@features/platform/notifications/models/notification-preferences.model';

@Injectable({ providedIn: 'root' })
export class NotificationPreferencesApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = '/api/notifications/preferences';

  get(): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>(this.endpoint);
  }

  update(payload: NotificationPreferencesUpdate): Observable<NotificationPreferences> {
    return this.http.put<NotificationPreferences>(this.endpoint, payload);
  }
}
