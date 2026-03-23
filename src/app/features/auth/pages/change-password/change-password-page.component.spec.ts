import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ChangePasswordPageComponent } from './change-password-page.component';
import { AuthService } from '@features/auth/services/application';
import { UserResponse } from '@features/auth/models';

describe('ChangePasswordPageComponent', () => {
  let component: ChangePasswordPageComponent;
  let fixture: ComponentFixture<ChangePasswordPageComponent>;
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
    changePassword: ReturnType<typeof vi.fn>;
    clearAuthState: ReturnType<typeof vi.fn>;
    getUserType: ReturnType<typeof vi.fn>;
    isMerchant: ReturnType<typeof vi.fn>;
  };
  let mockMessageService: { add: ReturnType<typeof vi.fn> };
  let mockActivatedRoute: { snapshot: { paramMap: { get: ReturnType<typeof vi.fn> } } };

  const mockUser: UserResponse = {
    id: '123',
    email: 'test@example.com',
    displayName: 'testuser',
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
      changePassword: vi.fn(),
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
      imports: [ChangePasswordPageComponent, ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AuthService, useValue: mockAuthService },
        { provide: MessageService, useValue: mockMessageService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form initialization', () => {
    it('should have a form with newPassword and confirmPassword controls', () => {
      expect(component.form.get('newPassword')).toBeTruthy();
      expect(component.form.get('confirmPassword')).toBeTruthy();
    });

    it('should have empty initial values', () => {
      expect(component.form.get('newPassword')?.value).toBe('');
      expect(component.form.get('confirmPassword')?.value).toBe('');
    });

    it('should be invalid initially', () => {
      expect(component.form.valid).toBe(false);
    });
  });

  describe('control helper', () => {
    it('should return form control for valid field', () => {
      const control = component['control']('newPassword');
      expect(control).toBeTruthy();
    });

    it('should return null for invalid field', () => {
      const control = component['control']('invalidField');
      expect(control).toBeNull();
    });
  });

  describe('asFormControl helper', () => {
    it('should return control as FormControl', () => {
      const control = component['control']('newPassword');
      const formControl = component['asFormControl'](control);
      expect(formControl).toBeTruthy();
    });
  });

  describe('onSubmit', () => {
    it('should not submit if form is invalid', () => {
      component.form.patchValue({
        newPassword: '',
        confirmPassword: '',
      });

      component.onSubmit();

      expect(mockAuthService.changePassword).not.toHaveBeenCalled();
    });

    it('should mark form as touched if invalid', () => {
      component.form.patchValue({
        newPassword: '',
        confirmPassword: '',
      });

      component.onSubmit();

      expect(component.form.touched).toBe(true);
    });

    it('should call changePassword on valid submit', () => {
      mockAuthService.changePassword.mockReturnValue(of(undefined));

      component.form.patchValue({
        newPassword: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

      component.onSubmit();

      expect(mockAuthService.changePassword).toHaveBeenCalledWith({
        newPassword: 'SecurePass123!',
      });
    });

    it('should show success message on successful password change', () => {
      mockAuthService.changePassword.mockReturnValue(of(undefined));

      component.form.patchValue({
        newPassword: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

      component.onSubmit();

      expect(mockMessageService.add).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'success',
        }),
      );
    });

    it('should reset form on successful password change', () => {
      mockAuthService.changePassword.mockReturnValue(of(undefined));

      component.form.patchValue({
        newPassword: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

      component.onSubmit();

      expect(component.form.get('newPassword')?.value).toBeNull();
      expect(component.form.get('confirmPassword')?.value).toBeNull();
    });

    it('should navigate to configuration on successful password change', () => {
      mockAuthService.changePassword.mockReturnValue(of(undefined));

      component.form.patchValue({
        newPassword: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

      component.onSubmit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/configuration']);
    });

    it('should show error message on password change failure', () => {
      mockAuthService.changePassword.mockReturnValue(throwError(() => ({ status: 400 })));

      component.form.patchValue({
        newPassword: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

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

  describe('getPasswordError', () => {
    it('should return error message for weak password', () => {
      component.form.patchValue({ newPassword: 'weak' });
      component.form.get('newPassword')?.markAsTouched();

      const error = component.getPasswordError();

      expect(error).toBeDefined();
    });

    it('should return empty string for valid password', () => {
      component.form.patchValue({ newPassword: 'SecurePass123!' });
      component.form.get('newPassword')?.markAsTouched();

      const error = component.getPasswordError();

      expect(error).toBe('');
    });
  });

  describe('getConfirmPasswordError', () => {
    it('should return mismatch error when passwords do not match', () => {
      component.form.patchValue({
        newPassword: 'SecurePass123!',
        confirmPassword: 'DifferentPass456!',
      });
      component.form.markAllAsTouched();

      const error = component.getConfirmPasswordError();

      expect(error).toContain('no coinciden');
    });

    it('should return empty string when passwords match', () => {
      component.form.patchValue({
        newPassword: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

      const error = component.getConfirmPasswordError();

      expect(error).toBe('');
    });
  });

  describe('form validation', () => {
    it('should be invalid with weak password', () => {
      component.form.patchValue({
        newPassword: 'weak',
        confirmPassword: 'weak',
      });

      expect(component.form.valid).toBe(false);
    });

    it('should be invalid when passwords do not match', () => {
      component.form.patchValue({
        newPassword: 'SecurePass123!',
        confirmPassword: 'DifferentPass456!',
      });

      expect(component.form.valid).toBe(false);
    });

    it('should be valid with strong matching passwords', () => {
      component.form.patchValue({
        newPassword: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

      expect(component.form.valid).toBe(true);
    });

    it('should require confirmPassword', () => {
      component.form.patchValue({
        newPassword: 'SecurePass123!',
        confirmPassword: '',
      });

      expect(component.form.get('confirmPassword')?.hasError('required')).toBe(true);
    });
  });
});
