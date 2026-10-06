import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UsersDetailsPageComponent } from '@features/users/pages/users-details-page/users-details-page.component';
import { UserApplicationService } from '@features/users/services/application';
import { UserType } from '@features/users/models/enums';
import { UserDetails } from '@features/users/models/interfaces';

describe('UsersDetailsPageComponent', () => {
  let component: UsersDetailsPageComponent;
  let fixture: ComponentFixture<UsersDetailsPageComponent>;
  let mockActivatedRoute: Partial<ActivatedRoute>;
  let mockUserService: Partial<UserApplicationService>;
  let messageServiceSpy: MessageService;
  let router: Router;

  const mockUser: UserDetails = {
    id: '1',
    email: 'test@cashly.com',
    userName: 'Test User',
    role: UserType.OPERATOR,
    active: true,
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue('1'),
        },
      } as unknown as ActivatedRoute['snapshot'],
    };

    mockUserService = {
      loadUserById: vi.fn().mockReturnValue(of(mockUser)),
    };

    await TestBed.configureTestingModule({
      imports: [UsersDetailsPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: UserApplicationService, useValue: mockUserService },
        MessageService,
        ConfirmationService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersDetailsPageComponent);
    component = fixture.componentInstance;
    messageServiceSpy = TestBed.inject(MessageService);
    router = TestBed.inject(Router);
    vi.spyOn(messageServiceSpy, 'add');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user on init', () => {
    fixture.detectChanges();
    expect(mockUserService.loadUserById).toHaveBeenCalledWith('1');
  });

  it('should set user signal after loading', () => {
    fixture.detectChanges();
    expect(component.user()?.id).toBe('1');
    expect(component.user()?.userName).toBe('Test User');
  });

  it('should handle error when loading user and navigate to list', () => {
    vi.spyOn(mockUserService, 'loadUserById').mockReturnValue(throwError(() => ({ status: 404 })));
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const componentMessageService = fixture.debugElement.injector.get(MessageService);
    const addSpy = vi.spyOn(componentMessageService, 'add');

    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/users']);
  });

  it('should navigate to edit page on onEdit', () => {
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEdit();
    expect(navigateSpy).toHaveBeenCalledWith(['/users', '1', 'edit']);
  });

  it('shows edit before user-specific actions', () => {
    fixture.detectChanges();
    const actionsTrigger = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Acciones'))!;
    actionsTrigger.click();
    fixture.detectChanges();
    const menuText = document.body.textContent ?? '';

    expect(menuText.indexOf('Editar')).toBeLessThan(menuText.indexOf('Cambiar Contraseña'));
    expect(menuText.indexOf('Editar')).toBeLessThan(menuText.indexOf('Cambiar Correo'));
  });

  it('should navigate back to users list on onBack', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/users']);
  });

  it('should return correct type label for OPERATOR', () => {
    const label = component.getTypeLabel(UserType.OPERATOR);
    expect(label).toBe('Operador');
  });

  it('should return correct type label for SUPER_ADMIN', () => {
    const label = component.getTypeLabel(UserType.SUPER_ADMIN);
    expect(label).toBe('Super Admin');
  });
});
