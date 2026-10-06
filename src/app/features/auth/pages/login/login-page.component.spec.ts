import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { signal } from '@angular/core';
import { LoginPageComponent } from '@features/auth/pages/login/login-page.component';
import { AuthService } from '@features/auth/services';
import { TextInputComponent } from '@core/forms/components/inputs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { ThemeService } from '@core/theme/components/theme-toggle/theme.service';
import { AuthenticationResponse, UserResponse } from '@features/auth/models';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let authServiceMock: {
    login: ReturnType<typeof vi.fn>;
    loading: ReturnType<typeof signal<boolean>>;
    error: ReturnType<typeof signal<string | null>>;
  };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let messageServiceMock: { add: ReturnType<typeof vi.fn> };
  let themeServiceMock: { isDarkMode: ReturnType<typeof signal<boolean>> };

  const mockUser: UserResponse = {
    id: '1',
    email: 'test@example.com',
    userName: 'testuser',
    type: 'OPERATOR',
    role: 'ADMIN',
    active: true,
    createdAt: new Date().toISOString(),
  };

  const mockAuthResponse: AuthenticationResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    entity: mockUser,
  };

  beforeEach(async () => {
    authServiceMock = {
      login: vi.fn(),
      loading: signal(false),
      error: signal<string | null>(null),
    };
    routerMock = {
      navigate: vi.fn(),
    };
    messageServiceMock = {
      add: vi.fn(),
    };
    themeServiceMock = {
      isDarkMode: signal(false),
    };

    await TestBed.configureTestingModule({
      imports: [
        LoginPageComponent,
        ReactiveFormsModule,
        CardModule,
        ButtonModule,
        MessageModule,
        TextInputComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MessageService, useValue: messageServiceMock },
        { provide: ThemeService, useValue: themeServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use the display-sized logo asset', () => {
    expect(component.logoSrc()).toBe('/cashly-logo.svg');
  });

  describe('form initialization', () => {
    it('should initialize form with email and password controls', () => {
      expect(component.form.controls.email).toBeDefined();
      expect(component.form.controls.password).toBeDefined();
    });

    it('should have invalid form when empty', () => {
      expect(component.form.valid).toBe(false);
    });

    it('should have invalid form with only email', () => {
      component.form.controls.email.setValue('test@example.com');
      expect(component.form.valid).toBe(false);
    });

    it('should have invalid form with only password', () => {
      component.form.controls.password.setValue('password');
      expect(component.form.valid).toBe(false);
    });

    it('should have valid form with email and password', () => {
      component.form.controls.email.setValue('test@example.com');
      component.form.controls.password.setValue('password');
      expect(component.form.valid).toBe(true);
    });
  });

  describe('email validation', () => {
    it('should validate required email', () => {
      const emailControl = component.form.controls.email;
      emailControl.markAsTouched();

      expect(emailControl.hasError('required')).toBe(true);
    });

    it('should validate invalid email format', () => {
      const emailControl = component.form.controls.email;
      emailControl.setValue('invalid-email');
      emailControl.markAsTouched();

      expect(emailControl.hasError('email')).toBe(true);
    });

    it('should accept valid email', () => {
      const emailControl = component.form.controls.email;
      emailControl.setValue('test@example.com');
      emailControl.markAsTouched();

      expect(emailControl.valid).toBe(true);
    });
  });

  describe('password validation', () => {
    it('should validate required password', () => {
      const passwordControl = component.form.controls.password;
      passwordControl.markAsTouched();

      expect(passwordControl.hasError('required')).toBe(true);
    });

    it('should accept any password for login', () => {
      const passwordControl = component.form.controls.password;
      passwordControl.setValue('weak');
      passwordControl.markAsTouched();

      expect(passwordControl.valid).toBe(true);
    });
  });

  describe('form submission', () => {
    it('should not submit when form is invalid', () => {
      component.onSubmit();

      expect(authServiceMock.login).not.toHaveBeenCalled();
    });

    it('should call authService.login with form values', () => {
      authServiceMock.login.mockReturnValue(of(mockAuthResponse));

      component.form.controls.email.setValue('test@example.com');
      component.form.controls.password.setValue('Password123!');

      component.onSubmit();

      expect(authServiceMock.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
      });
    });

    it('should send exact data from form to service', () => {
      authServiceMock.login.mockReturnValue(of(mockAuthResponse));

      const testEmail = 'user@domain.com';
      const testPassword = 'MySecretPass123!';

      component.form.controls.email.setValue(testEmail);
      component.form.controls.password.setValue(testPassword);

      component.onSubmit();

      expect(authServiceMock.login).toHaveBeenCalledWith({
        email: testEmail,
        password: testPassword,
      });
    });

    it('should navigate to customers on successful login', async () => {
      authServiceMock.login.mockReturnValue(of(mockAuthResponse));

      component.form.controls.email.setValue('test@example.com');
      component.form.controls.password.setValue('Password123!');

      component.onSubmit();

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(routerMock.navigate).toHaveBeenCalledWith(['/customers']);
    });

    it('should handle login error', async () => {
      const errorMessage = 'Invalid credentials';
      authServiceMock.login.mockReturnValue(throwError(() => ({ message: errorMessage })));

      component.form.controls.email.setValue('test@example.com');
      component.form.controls.password.setValue('wrongpassword');

      component.onSubmit();

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  describe('error messages', () => {
    it('should return correct email error message', () => {
      const emailControl = component.form.controls.email;
      emailControl.setErrors({ required: true });

      const message = component.getEmailError();

      expect(message).toBe('Email is required');
    });

    it('should return correct email format error', () => {
      const emailControl = component.form.controls.email;
      emailControl.setValue('invalid');
      emailControl.setErrors({ email: true });

      const message = component.getEmailError();

      expect(message).toBe('Invalid email format');
    });
  });

  describe('form integration', () => {
    it('should pass correct data through complete flow', async () => {
      authServiceMock.login.mockReturnValue(of(mockAuthResponse));

      const credentials = {
        email: 'integration@test.com',
        password: 'IntegrationTest123!',
      };

      component.form.patchValue(credentials);
      expect(component.form.valid).toBe(true);

      component.onSubmit();

      expect(authServiceMock.login).toHaveBeenCalledTimes(1);
      expect(authServiceMock.login).toHaveBeenCalledWith(credentials);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(routerMock.navigate).toHaveBeenCalledWith(['/customers']);
    });

    it('should maintain form values after failed submission', () => {
      authServiceMock.login.mockReturnValue(throwError(() => ({ message: 'Error' })));

      component.form.controls.email.setValue('test@example.com');
      component.form.controls.password.setValue('password');

      component.onSubmit();

      expect(component.form.controls.email.value).toBe('test@example.com');
      expect(component.form.controls.password.value).toBe('password');
    });
  });
});
