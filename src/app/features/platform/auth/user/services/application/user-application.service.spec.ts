import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UserApplicationService } from '@features/platform/auth/user/services/application/user-application.service';
import { UserApiService } from '@features/platform/auth/user/services/api/user-api.service';
import { UserList } from '@features/platform/auth/user/models/interfaces/user-list.interface';
import { UserDetails } from '@features/platform/auth/user/models/interfaces/user-details.interface';
import { UserCreate } from '@features/platform/auth/user/models/interfaces/user-create.interface';
import { UserEdit } from '@features/platform/auth/user/models/interfaces/user-edit.interface';
import { UserType } from '@features/platform/auth/user/models/enums/user-type.enum';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

describe('UserApplicationService', () => {
  let service: UserApplicationService;
  let mockApiService: {
    getAll: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const mockUserDetails: UserDetails = {
    firstName: 'Test',
    lastName: 'User',
    address: null,
    phone: null,
    roleId: 'role-1',
    departmentId: 'department-1',
    id: '1',
    email: 'test@cashly.com',
    userName: 'Test User',
    role: UserType.OPERATOR,
    active: true,
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockUserList: UserList = {
    deletable: true,
    firstName: 'Test',
    lastName: 'User',
    address: null,
    phone: null,
    roleId: 'role-1',
    departmentId: 'department-1',
    id: '1',
    email: 'test@cashly.com',
    userName: 'Test User',
    role: UserType.OPERATOR,
    active: true,
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
  };

  const mockPagedResponse = (items: UserList[]): PagedResponse<UserList> => ({
    content: items,
    totalElements: items.length,
    totalPages: 1,
    size: 20,
    number: 0,
  });

  beforeEach(() => {
    mockApiService = {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [UserApplicationService, { provide: UserApiService, useValue: mockApiService }],
    });

    service = TestBed.inject(UserApplicationService);
  });

  describe('initial state', () => {
    it('should have empty users array initially', () => {
      expect(service.users()).toEqual([]);
    });

    it('should have null currentUser initially', () => {
      expect(service.currentUser()).toBeNull();
    });

    it('should not be loading initially', () => {
      expect(service.loading()).toBe(false);
    });

    it('should have null error initially', () => {
      expect(service.error()).toBeNull();
    });
  });

  describe('loadUsers', () => {
    it('should load users and update signal', () => {
      mockApiService.getAll.mockReturnValue(of(mockPagedResponse([mockUserList])));

      service.loadUsers().subscribe(() => {
        expect(service.users()).toHaveLength(1);
        expect(service.users()[0].id).toBe('1');
      });

      expect(service.loading()).toBe(false);
    });

    it('should set error on failure', () => {
      mockApiService.getAll.mockReturnValue(throwError(() => new Error('Network error')));

      service.loadUsers().subscribe({
        error: () => {
          expect(service.error()).toBe('Network error');
        },
      });

      expect(service.loading()).toBe(false);
    });

    it('should clear previous error before loading', () => {
      mockApiService.getAll.mockReturnValue(of(mockPagedResponse([mockUserList])));

      service.loadUsers().subscribe(() => {
        expect(service.error()).toBeNull();
      });
    });
  });

  describe('loadUserById', () => {
    it('should load user by id and update currentUser signal', () => {
      mockApiService.getById.mockReturnValue(of(mockUserDetails));

      service.loadUserById('1').subscribe((user) => {
        expect(user.id).toBe('1');
        expect(service.currentUser()?.id).toBe('1');
      });

      expect(service.loading()).toBe(false);
    });

    it('should set error when user not found', () => {
      mockApiService.getById.mockReturnValue(throwError(() => new Error('Not found')));

      service.loadUserById('999').subscribe({
        error: () => {
          expect(service.error()).toBe('Not found');
        },
      });

      expect(service.loading()).toBe(false);
    });
  });

  describe('createUser', () => {
    it('should create user and add to users list', () => {
      mockApiService.getAll.mockReturnValue(of([]));
      mockApiService.create.mockReturnValue(of(mockUserDetails));

      service.loadUsers().subscribe();

      const createData: UserCreate = {
        firstName: 'Test',
        lastName: 'User',
        address: null,
        phone: null,
        roleId: 'role-1',
        departmentId: 'department-1',
        email: 'new@cashly.com',
        password: 'Password1!',
        userName: 'New User',
      };

      service.createUser(createData).subscribe(() => {
        expect(service.users()).toHaveLength(1);
        expect(service.users()[0].id).toBe('1');
      });

      expect(service.loading()).toBe(false);
    });

    it('should set error on create failure', () => {
      mockApiService.create.mockReturnValue(throwError(() => new Error('Conflict')));

      const createData: UserCreate = {
        firstName: 'Test',
        lastName: 'User',
        address: null,
        phone: null,
        roleId: 'role-1',
        departmentId: 'department-1',
        email: 'duplicate@cashly.com',
        password: 'Password1!',
        userName: 'Duplicate User',
      };

      service.createUser(createData).subscribe({
        error: () => {
          expect(service.error()).toBe('Conflict');
        },
      });

      expect(service.loading()).toBe(false);
    });
  });

  describe('updateUser', () => {
    it('should update user and refresh list item', () => {
      mockApiService.getAll.mockReturnValue(of(mockPagedResponse([mockUserList])));
      service.loadUsers().subscribe();

      const updatedDetails: UserDetails = {
        firstName: 'Test',
        lastName: 'User',
        address: null,
        phone: null,
        roleId: 'role-1',
        departmentId: 'department-1',
        ...mockUserDetails,
        userName: 'Updated User',
        role: UserType.ADMIN,
      };
      mockApiService.update.mockReturnValue(of(updatedDetails));

      const editData: UserEdit = {
        firstName: 'Test',
        lastName: 'User',
        address: null,
        phone: null,
        roleId: 'role-1',
        departmentId: 'department-1',
        userName: 'Updated User',
        active: true,
      };

      service.updateUser('1', editData).subscribe(() => {
        const updatedUser = service.users().find((u) => u.id === '1');
        expect(updatedUser?.userName).toBe('Updated User');
      });

      expect(service.loading()).toBe(false);
    });

    it('should update currentUser if it matches the updated user', () => {
      mockApiService.getById.mockReturnValue(of(mockUserDetails));
      service.loadUserById('1').subscribe();

      const updatedDetails: UserDetails = {
        firstName: 'Test',
        lastName: 'User',
        address: null,
        phone: null,
        roleId: 'role-1',
        departmentId: 'department-1',
        ...mockUserDetails,
        userName: 'New Name',
      };
      mockApiService.update.mockReturnValue(of(updatedDetails));

      const editData: UserEdit = {
        firstName: 'Test',
        lastName: 'User',
        address: null,
        phone: null,
        roleId: 'role-1',
        departmentId: 'department-1',
        userName: 'New Name',
        active: true,
      };

      service.updateUser('1', editData).subscribe(() => {
        expect(service.currentUser()?.userName).toBe('New Name');
      });
    });

    it('should set error on update failure', () => {
      mockApiService.update.mockReturnValue(throwError(() => new Error('Update failed')));

      const editData: UserEdit = {
        firstName: 'Test',
        lastName: 'User',
        address: null,
        phone: null,
        roleId: 'role-1',
        departmentId: 'department-1',
        userName: 'Test',
        active: true,
      };

      service.updateUser('1', editData).subscribe({
        error: () => {
          expect(service.error()).toBe('Update failed');
        },
      });

      expect(service.loading()).toBe(false);
    });
  });

  describe('deleteUser', () => {
    it('should delete user and remove from list', () => {
      mockApiService.getAll.mockReturnValue(of(mockPagedResponse([mockUserList])));
      service.loadUsers().subscribe();

      mockApiService.delete.mockReturnValue(of(undefined));

      service.deleteUser('1').subscribe(() => {
        expect(service.users()).toHaveLength(0);
      });

      expect(service.loading()).toBe(false);
    });

    it('should set error on delete failure', () => {
      mockApiService.delete.mockReturnValue(throwError(() => new Error('Delete failed')));

      service.deleteUser('1').subscribe({
        error: () => {
          expect(service.error()).toBe('Delete failed');
        },
      });

      expect(service.loading()).toBe(false);
    });
  });
});
