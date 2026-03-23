import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ChangeUsernamePageComponent } from './change-username-page.component';
import { AuthService } from '@features/auth/services/application';
import { UserResponse } from '@features/auth/models';

describe('ChangeUsernamePageComponent', () => {
  let component: ChangeUsernamePageComponent;
  let fixture: ComponentFixture<ChangeUsernamePageComponent>;
  let mockRouter: {
    navigate: ReturnType<typeof vi.fn>;
    events: ReturnType<typeof of>;
    url: string;
    createUrlTree: ReturnType<typeof vi.fn>;
    serializeUrl: ReturnType<typeof vi.fn>;
  };
  let mockAuthService: {
    loading: ReturnType<typeof signal<boolean>>;
    currentUser: ReturnType<typeof signal<UserResponse | null>>;
    changeUsername: ReturnType<typeof vi.fn>;
    clearAuthState: ReturnType<typeof vi.fn>;
    getUserType: ReturnType<typeof vi.fn>;
    isMerchant: ReturnType<typeof vi.fn>;
  };
  let mockMessageService: { add: ReturnType<typeof vi.fn> };
  let mockActivatedRoute: { snapshot: { paramMap: { get: ReturnType<typeof vi.fn> } } };

  const mockUser: UserResponse = {
    id: '123',
    email: 'test@example.com',
    displayName: 'Current User',
    type: 'USER',
    active: true,
    createdAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn(),
      events: of(),
      url: '/',
      createUrlTree: vi.fn(),
      serializeUrl: vi.fn(),
    };

    mockAuthService = {
      loading: signal(false),
      currentUser: signal(mockUser),
      changeUsername: vi.fn(),
      clearAuthState: vi.fn(),
      getUserType: vi.fn().mockReturnValue('USER'),
      isMerchant: vi.fn().mockReturnValue(false),
    };

    mockMessageService = { add: vi.fn() };

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue(null),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [ChangeUsernamePageComponent, ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AuthService, useValue: mockAuthService },
        { provide: MessageService, useValue: mockMessageService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeUsernamePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form initialization', () => {
    it('should have a form with displayName control', () => {
      expect(component.form.get('displayName')).toBeTruthy();
    });

    it('should initialize with current user displayName', () => {
      expect(component.form.get('displayName')?.value).toBe('Current User');
    });

    it('should be valid with current displayName', () => {
      expect(component.form.valid).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should populate form with current user displayName', () => {
      expect(component.form.get('displayName')?.value).toBe('Current User');
    });
  });

  describe('control helper', () => {
    it('should return form control for valid field', () => {
      const control = component['control']('displayName');
      expect(control).toBeTruthy();
    });

    it('should return null for invalid field', () => {
      const control = component['control']('invalidField');
      expect(control).toBeNull();
    });
  });

  describe('asFormControl helper', () => {
    it('should return control as FormControl', () => {
      const control = component['control']('displayName');
      const formControl = component['asFormControl'](control);
      expect(formControl).toBeTruthy();
    });
  });

  describe('onSubmit', () => {
    it('should not submit if form is invalid', () => {
      component.form.patchValue({ displayName: '' });

      component.onSubmit();

      expect(mockAuthService.changeUsername).not.toHaveBeenCalled();
    });

    it('should mark form as touched if invalid', () => {
      component.form.patchValue({ displayName: '' });

      component.onSubmit();

      expect(component.form.touched).toBe(true);
    });

    it('should call changeUsername on valid submit', () => {
      const updatedUser: UserResponse = { ...mockUser, displayName: 'New User' };
      mockAuthService.changeUsername.mockReturnValue(of(updatedUser));

      component.form.patchValue({ displayName: 'New User' });

      component.onSubmit();

      expect(mockAuthService.changeUsername).toHaveBeenCalledWith({
        username: 'New User',
      });
    });

    it('should show success message on successful username change', () => {
      const updatedUser: UserResponse = { ...mockUser, displayName: 'New User' };
      mockAuthService.changeUsername.mockReturnValue(of(updatedUser));

      component.form.patchValue({ displayName: 'New User' });

      component.onSubmit();

      expect(mockMessageService.add).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'success',
        }),
      );
    });

    it('should navigate to configuration on successful username change', () => {
      const updatedUser: UserResponse = { ...mockUser, displayName: 'New User' };
      mockAuthService.changeUsername.mockReturnValue(of(updatedUser));

      component.form.patchValue({ displayName: 'New User' });

      component.onSubmit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/configuration']);
    });

    it('should show error message on username change failure', () => {
      mockAuthService.changeUsername.mockReturnValue(throwError(() => ({ status: 400 })));

      component.form.patchValue({ displayName: 'New User' });

      component.onSubmit();

      expect(mockMessageService.add).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
        }),
      );
    });
  });

  describe('onCancel', () => {
    it('should navigate to configuration page', () => {
      component.onCancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/configuration']);
    });
  });

  describe('getDisplayNameError', () => {
    it('should return required error when displayName is empty', () => {
      component.form.patchValue({ displayName: '' });
      component.form.get('displayName')?.markAsTouched();

      const error = component.getDisplayNameError();

      expect(error).toContain('requerido');
    });

    it('should return minlength error when displayName is too short', () => {
      component.form.patchValue({ displayName: 'ab' });
      component.form.get('displayName')?.markAsTouched();

      const error = component.getDisplayNameError();

      expect(error).toContain('3 caracteres');
    });

    it('should return empty string for valid displayName', () => {
      component.form.patchValue({ displayName: 'Valid Name' });
      component.form.get('displayName')?.markAsTouched();

      const error = component.getDisplayNameError();

      expect(error).toBe('');
    });
  });

  describe('form validation', () => {
    it('should be invalid with empty displayName', () => {
      component.form.patchValue({ displayName: '' });
      expect(component.form.valid).toBe(false);
    });

    it('should be invalid with displayName less than 3 characters', () => {
      component.form.patchValue({ displayName: 'ab' });
      expect(component.form.valid).toBe(false);
    });

    it('should be valid with displayName of 3 or more characters', () => {
      component.form.patchValue({ displayName: 'abc' });
      expect(component.form.valid).toBe(true);
    });

    it('should have required validator', () => {
      component.form.patchValue({ displayName: '' });
      expect(component.form.get('displayName')?.hasError('required')).toBe(true);
    });

    it('should have minlength validator', () => {
      component.form.patchValue({ displayName: 'ab' });
      expect(component.form.get('displayName')?.hasError('minlength')).toBe(true);
    });
  });
});
