import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ChangePasswordPageComponent } from '@features/auth/pages/change-password/change-password-page.component';
import { AuthService } from '@features/auth/services/application/auth-application.service';
import { AUTH_SUCCESS_MESSAGES } from '@features/auth/messages/success-messages';
import { AUTH_ERROR_MESSAGES } from '@features/auth/messages/error-messages';

describe('ChangePasswordPageComponent', () => {
  let component: ChangePasswordPageComponent;
  let fixture: ComponentFixture<ChangePasswordPageComponent>;
  let mockAuthService: Partial<AuthService>;
  let router: Router;
  let messageService: MessageService;

  function configureTestBed(changePasswordValue: any = of(undefined)) {
    mockAuthService = {
      changePassword: vi.fn().mockReturnValue(changePasswordValue),
      currentUser: vi.fn().mockReturnValue({ userName: 'Test User' }),
    };

    TestBed.configureTestingModule({
      imports: [ChangePasswordPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        MessageService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();
  }

  function createComponent() {
    fixture = TestBed.createComponent(ChangePasswordPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    messageService = TestBed.inject(MessageService);
  }

  beforeEach(() => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed();
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form with newPassword and confirmPassword controls', () => {
    expect(component.form.contains('newPassword')).toBe(true);
    expect(component.form.contains('confirmPassword')).toBe(true);
  });

  it('should mark form as touched and return when form is invalid', () => {
    const markAllAsTouchedSpy = vi.spyOn(component.form, 'markAllAsTouched');
    component.onSubmit();
    expect(markAllAsTouchedSpy).toHaveBeenCalled();
  });

  it('should call changePassword and navigate on success', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    const addSpy = vi.spyOn(messageService, 'add');

    component.form.controls['newPassword'].setValue('Test1234');
    component.form.controls['confirmPassword'].setValue('Test1234');

    component.onSubmit();

    expect(mockAuthService.changePassword).toHaveBeenCalledWith({ newPassword: 'Test1234' });
    expect(addSpy).toHaveBeenCalledWith(AUTH_SUCCESS_MESSAGES.passwordChanged);
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/configuration']);
  });

  it('should show error message on changePassword failure', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed(throwError(() => new Error('Failed')));
    createComponent();

    const addSpy = vi.spyOn(messageService, 'add');

    component.form.controls['newPassword'].setValue('Test1234');
    component.form.controls['confirmPassword'].setValue('Test1234');

    component.onSubmit();

    expect(addSpy).toHaveBeenCalledWith(AUTH_ERROR_MESSAGES.changePassword);
  });

  it('should navigate to configuration on cancel', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onCancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/configuration']);
  });

  it('should return empty string for getPasswordError when no errors', () => {
    component.form.controls['newPassword'].setValue('Test1234');
    component.form.controls['confirmPassword'].setValue('Test1234');
    expect(component.getPasswordError()).toBe('');
  });

  it('should return empty string for getConfirmPasswordError when valid', () => {
    component.form.controls['newPassword'].setValue('Test1234');
    component.form.controls['confirmPassword'].setValue('Test1234');
    component.form.controls['confirmPassword'].markAsTouched();
    expect(component.getConfirmPasswordError()).toBe('');
  });

  it('should return mismatch error when passwords do not match', () => {
    component.form.controls['newPassword'].setValue('Test1234');
    component.form.controls['confirmPassword'].setValue('Different1');
    component.form.controls['confirmPassword'].markAsTouched();
    expect(component.getConfirmPasswordError()).toBe('Las contraseñas no coinciden');
  });

  it('should return required error for confirmPassword when touched and empty', () => {
    component.form.controls['confirmPassword'].markAsTouched();
    expect(component.getConfirmPasswordError()).toBe('La confirmación de contraseña es requerida');
  });
});
