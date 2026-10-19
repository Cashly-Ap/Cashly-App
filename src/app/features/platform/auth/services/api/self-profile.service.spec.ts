import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '@env/environment';
import { SelfProfileService } from './self-profile.service';
describe('SelfProfileService', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('reads own profile without administrative users endpoints', () => {
    TestBed.inject(SelfProfileService)
      .getProfile()
      .subscribe((result) => expect(result.userName).toBe('ana'));
    const request = http.expectOne(`${environment.apiUrl}/auth/profile`);
    expect(request.request.method).toBe('GET');
    http.expectNone((req) => req.url.startsWith('/api/users'));
    request.flush({ userName: 'ana' });
  });
  it('propagates failures to the retry state', () => {
    TestBed.inject(SelfProfileService)
      .getProfile()
      .subscribe({ error: (error) => expect(error.status).toBe(503) });
    http
      .expectOne(`${environment.apiUrl}/auth/profile`)
      .flush({}, { status: 503, statusText: 'Unavailable' });
  });
  it('projects only personal fields even when administrative data is injected', () => {
    const input = {
      userName: 'ana',
      firstName: 'Ana',
      lastName: 'García',
      phone: null,
      address: {
        street: 'Calle 1',
        city: null,
        region: null,
        country: null,
        postalCode: null,
        roleId: 'injected',
      },
      roleId: 'injected',
      departmentId: 'injected',
      active: false,
      email: 'other@example.com',
      permissions: { USERS: ['DELETE'] },
    };
    TestBed.inject(SelfProfileService).updateProfile(input).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/auth/profile`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      userName: 'ana',
      firstName: 'Ana',
      lastName: 'García',
      phone: null,
      address: { street: 'Calle 1', city: null, region: null, country: null, postalCode: null },
    });
    request.flush({ userName: 'ana' });
  });
});
