import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UsersFormPageComponent } from './users-form-page.component';
import { UserApplicationService } from '@features/users/services/application';
import { UserDetails } from '@features/users/models/interfaces';
import { UserType } from '@features/users/models/enums';

describe('UsersFormPageComponent', () => {
  let component: UsersFormPageComponent;
  let fixture: ComponentFixture<UsersFormPageComponent>;
  let mockUserService: {
    loading: ReturnType<typeof vi.fn>;
    loadUserById: ReturnType<typeof vi.fn>;
    createUser: ReturnType<typeof vi.fn>;
    updateUser: ReturnType<typeof vi.fn>;
  };

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

  function buildMockService() {
    return {
      loading: vi.fn(() => false),
      loadUserById: vi.fn().mockReturnValue(of(mockUserDetails)),
      createUser: vi.fn().mockReturnValue(of(mockUserDetails)),
      updateUser: vi.fn().mockReturnValue(of(mockUserDetails)),
    };
  }

  async function createComponent(params: Record<string, string> = {}): Promise<void> {
    mockUserService = buildMockService();

    await TestBed.configureTestingModule({
      imports: [UsersFormPageComponent],
      providers: [
        provideRouter([]),
        { provide: UserApplicationService, useValue: mockUserService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap(params)),
            snapshot: {
              paramMap: convertToParamMap(params),
              queryParamMap: convertToParamMap({}),
            },
          },
        },
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersFormPageComponent);
    component = fixture.componentInstance;
  }

  beforeEach(async () => {
    await createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in create mode when no id in route', () => {
    fixture.detectChanges();
    expect(component.isEditMode()).toBe(false);
    expect(component.entityId()).toBeNull();
  });

  it('should have correct title in create mode', () => {
    fixture.detectChanges();
    expect(component.title()).toBe('Nuevo Usuario');
  });

  it('should have correct submit label in create mode', () => {
    fixture.detectChanges();
    expect(component.submitLabel()).toBe('Crear Usuario');
  });

  it('should build form with required fields', () => {
    fixture.detectChanges();
    expect(component.form.get('email')).toBeTruthy();
    expect(component.form.get('password')).toBeTruthy();
    expect(component.form.get('userName')).toBeTruthy();
    expect(component.form.get('role')).toBeTruthy();
    expect(component.form.get('active')).toBeTruthy();
  });

  it('should show password field in create mode', () => {
    fixture.detectChanges();
    expect(component.isEditMode()).toBe(false);
  });

  it('should return email error for required field', () => {
    fixture.detectChanges();
    component.form.get('email')?.setErrors({ required: true });
    expect(component.getEmailError()).toBe('El correo electrónico es requerido');
  });

  it('should return email error for invalid format', () => {
    fixture.detectChanges();
    component.form.get('email')?.setErrors({ email: true });
    expect(component.getEmailError()).toBe('El formato del correo electrónico es inválido');
  });

  it('should return userName error for required field', () => {
    fixture.detectChanges();
    component.form.get('userName')?.setErrors({ required: true });
    expect(component.getUserNameError()).toBe('El nombre de usuario es requerido');
  });

  describe('edit mode', () => {
    beforeEach(async () => {
      TestBed.resetTestingModule();
      await createComponent({ id: '1' });
    });

    it('should have correct title in edit mode', () => {
      fixture.detectChanges();
      expect(component.title()).toBe('Editar Usuario');
    });

    it('should have correct submit label in edit mode', () => {
      fixture.detectChanges();
      expect(component.submitLabel()).toBe('Actualizar Usuario');
    });

    it('should load user data in edit mode', () => {
      fixture.detectChanges();
      expect(mockUserService.loadUserById).toHaveBeenCalledWith('1');
    });
  });
});
