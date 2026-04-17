import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserApiService } from './user-api.service';
import { UserList, UserDetails, UserCreate, UserEdit } from '@features/users/models/interfaces';
import { UserType } from '@features/users/models/enums';

describe('UserApiService', () => {
  let service: UserApiService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api/users';

  const mockUserDetails: UserDetails = {
    id: '1',
    email: 'test@parsun.com',
    userName: 'Test User',
    role: UserType.OPERATOR,
    active: true,
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockUserList: UserList = {
    id: '1',
    email: 'test@parsun.com',
    userName: 'Test User',
    role: UserType.OPERATOR,
    active: true,
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UserApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll', () => {
    it('should fetch all users', async () => {
      const promise = new Promise<UserList[]>((resolve, reject) => {
        service.getAll().subscribe({ next: resolve, error: reject });
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush([mockUserList]);

      const users = await promise;
      expect(users).toHaveLength(1);
      expect(users[0].id).toBe('1');
      expect(users[0].userName).toBe('Test User');
    });

    it('should handle empty array response', async () => {
      const promise = new Promise<UserList[]>((resolve, reject) => {
        service.getAll().subscribe({ next: resolve, error: reject });
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush([]);

      const users = await promise;
      expect(users).toEqual([]);
    });

    it('should handle HTTP errors', async () => {
      const promise = new Promise((resolve, reject) => {
        service.getAll().subscribe({ next: reject, error: resolve });
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      const error = await promise;
      expect((error as { status: number }).status).toBe(500);
    });
  });

  describe('getById', () => {
    it('should fetch user by id', async () => {
      const promise = new Promise<UserDetails>((resolve, reject) => {
        service.getById('1').subscribe({ next: resolve, error: reject });
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUserDetails);

      const user = await promise;
      expect(user.id).toBe('1');
      expect(user.userName).toBe('Test User');
    });

    it('should handle 404 error when user not found', async () => {
      const promise = new Promise((resolve, reject) => {
        service.getById('999').subscribe({ next: reject, error: resolve });
      });

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      const error = await promise;
      expect((error as { status: number }).status).toBe(404);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createData: UserCreate = {
        email: 'new@parsun.com',
        password: 'Password1!',
        userName: 'New User',
        role: UserType.OPERATOR,
        active: true,
      };

      const promise = new Promise<UserDetails>((resolve, reject) => {
        service.create(createData).subscribe({ next: resolve, error: reject });
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createData);
      req.flush({ ...mockUserDetails, ...createData });

      const user = await promise;
      expect(user.email).toBe('new@parsun.com');
    });

    it('should handle validation errors on create', async () => {
      const createData: UserCreate = {
        email: '',
        password: 'weak',
        userName: '',
        role: UserType.OPERATOR,
        active: true,
      };

      const promise = new Promise((resolve, reject) => {
        service.create(createData).subscribe({ next: reject, error: resolve });
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush({ message: 'Validation failed' }, { status: 400, statusText: 'Bad Request' });

      const error = await promise;
      expect((error as { status: number }).status).toBe(400);
    });
  });

  describe('update', () => {
    it('should update existing user', async () => {
      const editData: UserEdit = {
        id: '1',
        email: 'updated@parsun.com',
        userName: 'Updated User',
        role: UserType.ADMINISTRATION,
        active: false,
      };

      const promise = new Promise<UserDetails>((resolve, reject) => {
        service.update('1', editData).subscribe({ next: resolve, error: reject });
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(editData);
      req.flush({ ...mockUserDetails, ...editData });

      const user = await promise;
      expect(user.userName).toBe('Updated User');
    });

    it('should handle 404 when updating non-existent user', async () => {
      const editData: UserEdit = {
        id: '999',
        email: 'x@x.com',
        userName: 'Ghost',
        role: UserType.OPERATOR,
        active: true,
      };

      const promise = new Promise((resolve, reject) => {
        service.update('999', editData).subscribe({ next: reject, error: resolve });
      });

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      const error = await promise;
      expect((error as { status: number }).status).toBe(404);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const promise = new Promise<void>((resolve, reject) => {
        service.delete('1').subscribe({ next: resolve, error: reject });
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      await promise;
    });

    it('should handle 404 when deleting non-existent user', async () => {
      const promise = new Promise((resolve, reject) => {
        service.delete('999').subscribe({ next: reject, error: resolve });
      });

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      const error = await promise;
      expect((error as { status: number }).status).toBe(404);
    });
  });
});
