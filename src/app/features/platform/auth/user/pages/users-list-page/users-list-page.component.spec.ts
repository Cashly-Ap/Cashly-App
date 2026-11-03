import { AccessManagementService } from '@features/platform/auth/authorization/services/access-management.service';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UsersListPageComponent } from '@features/platform/auth/user/pages/users-list-page/users-list-page.component';
import { UserApplicationService } from '@features/platform/auth/user/services/application/user-application.service';
import { UserType } from '@features/platform/auth/user/models/enums/user-type.enum';
import { UserList } from '@features/platform/auth/user/models/interfaces/user-list.interface';

describe('UsersListPageComponent', () => {
  let component: UsersListPageComponent;
  let fixture: ComponentFixture<UsersListPageComponent>;
  let mockUserService: Partial<UserApplicationService>;
  let router: Router;
  const queryParams = new BehaviorSubject(convertToParamMap({}));

  const mockUser: UserList = {
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

  beforeEach(async () => {
    queryParams.next(convertToParamMap({}));
    mockUserService = {
      loadUsers: vi.fn().mockReturnValue(of([mockUser])),
      deleteUser: vi.fn().mockReturnValue(of(undefined)),
      users: signal([mockUser]),
      loading: signal(false),
      error: signal(null),
      totalElements: signal(1),
    };

    await TestBed.configureTestingModule({
      imports: [UsersListPageComponent],
      providers: [
        {
          provide: AccessManagementService,
          useValue: { roleOptions: () => of([{ id: 'role-1', name: 'Custom role' }]) },
        },
        { provide: AuthorizationService, useValue: { can: () => true } },
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { queryParamMap: queryParams } },
        { provide: UserApplicationService, useValue: mockUserService },
        ConfirmationService,
        MessageService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersListPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    fixture.detectChanges();
    expect(mockUserService.loadUsers).toHaveBeenCalled();
  });

  it('should navigate to new user on onCreate', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onCreate();
    expect(navigateSpy).toHaveBeenCalledWith(['/platform/users', 'new']);
  });

  it('should navigate to user detail on onView', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onView(mockUser);
    expect(navigateSpy).toHaveBeenCalledWith(['/platform/users', mockUser.id]);
  });

  it('should navigate to user edit on onEdit', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEdit(mockUser);
    expect(navigateSpy).toHaveBeenCalledWith(['/platform/users', mockUser.id, 'edit']);
  });

  it('should filter users based on search term', () => {
    fixture.detectChanges();
    component.onSearch('Test');
    expect(mockUserService.loadUsers).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'Test' }),
    );
  });

  it('should return empty filtered list when no match', () => {
    fixture.detectChanges();
    component.onSearch('nonexistent');
    expect(mockUserService.loadUsers).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'nonexistent' }),
    );
  });

  it('includes inactive users from other roles in the navbar selector', async () => {
    fixture.detectChanges();
    component.filterActive.set('true');
    component.filterRole.set('role-1');
    queryParams.next(convertToParamMap({ navAction: 'Editar' }));
    await Promise.resolve();
    expect(mockUserService.loadUsers).toHaveBeenLastCalledWith(
      expect.not.objectContaining({ active: expect.anything() }),
    );
    expect(mockUserService.loadUsers).toHaveBeenLastCalledWith(
      expect.not.objectContaining({ role: expect.anything() }),
    );
  });

  it('should return correct type label', () => {
    const label = component.getTypeLabel(UserType.OPERATOR);
    expect(label).toBe('Operador');
  });
  it('does not request assignable role options for a read-only user administrator', () => {
    vi.spyOn(TestBed.inject(AuthorizationService), 'can').mockReturnValue(false);
    const options = vi.spyOn(TestBed.inject(AccessManagementService), 'roleOptions');
    fixture.detectChanges();
    expect(options).not.toHaveBeenCalled();
    expect(component.canFilterRoles()).toBe(false);
  });
});
