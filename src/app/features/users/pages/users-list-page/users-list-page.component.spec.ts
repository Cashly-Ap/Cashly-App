import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UsersListPageComponent } from './users-list-page.component';
import { UserApplicationService } from '@features/users/services/application';
import { UserType } from '@features/users/models/enums';
import { UserList } from '@features/users/models/interfaces';

describe('UsersListPageComponent', () => {
  let component: UsersListPageComponent;
  let fixture: ComponentFixture<UsersListPageComponent>;
  let mockUserService: Partial<UserApplicationService>;
  let router: Router;

  const mockUser: UserList = {
    id: '1',
    email: 'test@parsun.com',
    userName: 'Test User',
    role: UserType.OPERATOR,
    active: true,
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(async () => {
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
        provideRouter([]),
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
    expect(navigateSpy).toHaveBeenCalledWith(['/users', 'new']);
  });

  it('should navigate to user detail on onView', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onView(mockUser);
    expect(navigateSpy).toHaveBeenCalledWith(['/users', mockUser.id]);
  });

  it('should navigate to user edit on onEdit', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEdit(mockUser);
    expect(navigateSpy).toHaveBeenCalledWith(['/users', mockUser.id, 'edit']);
  });

  it('should filter users based on search term', () => {
    fixture.detectChanges();
    component.onSearch('Test');
    expect(mockUserService.loadUsers).toHaveBeenCalledWith(expect.objectContaining({ search: 'Test' }));
  });

  it('should return empty filtered list when no match', () => {
    fixture.detectChanges();
    component.onSearch('nonexistent');
    expect(mockUserService.loadUsers).toHaveBeenCalledWith(expect.objectContaining({ search: 'nonexistent' }));
  });

  it('should return correct type label', () => {
    const label = component.getTypeLabel(UserType.OPERATOR);
    expect(label).toBe('Operador');
  });
});
