import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ChangeUsernamePageComponent } from '@features/auth/pages/change-username/change-username-page.component';
import { AuthService } from '@features/auth/services/application/auth-application.service';
import { AUTH_SUCCESS_MESSAGES } from '@features/auth/messages/success-messages';
import { AUTH_ERROR_MESSAGES } from '@features/auth/messages/error-messages';

describe('ChangeUsernamePageComponent', () => {
  let component: ChangeUsernamePageComponent;
  let fixture: ComponentFixture<ChangeUsernamePageComponent>;
  let mockAuthService: Partial<AuthService>;
  let router: Router;
  let messageService: MessageService;

  function configureTestBed(changeUsernameValue: any = of(undefined)) {
    mockAuthService = {
      changeUsername: vi.fn().mockReturnValue(changeUsernameValue),
      currentUser: vi.fn().mockReturnValue({ userName: 'Test User' }),
      loading: signal(false),
    };

    TestBed.configureTestingModule({
      imports: [ChangeUsernamePageComponent],
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
    fixture = TestBed.createComponent(ChangeUsernamePageComponent);
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

  it('should have a form with userName control', () => {
    expect(component.form.contains('userName')).toBe(true);
  });

  it('should patch form with current userName on init', () => {
    fixture.detectChanges();
    expect(component.form.value.userName).toBe('Test User');
  });

  it('should mark form as touched and return when form is invalid', () => {
    const markAllAsTouchedSpy = vi.spyOn(component.form, 'markAllAsTouched');
    component.form.controls['userName'].setValue('');
    component.onSubmit();
    expect(markAllAsTouchedSpy).toHaveBeenCalled();
  });

  it('should call changeUsername and navigate on success', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    const addSpy = vi.spyOn(messageService, 'add');

    component.form.controls['userName'].setValue('New Name');

    component.onSubmit();

    expect(mockAuthService.changeUsername).toHaveBeenCalledWith({ username: 'New Name' });
    expect(addSpy).toHaveBeenCalledWith(AUTH_SUCCESS_MESSAGES.usernameChanged);
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/configuration']);
  });

  it('should show error message on changeUsername failure', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed(throwError(() => new Error('Failed')));
    createComponent();

    const addSpy = vi.spyOn(messageService, 'add');

    component.form.controls['userName'].setValue('New Name');

    component.onSubmit();

    expect(addSpy).toHaveBeenCalledWith(AUTH_ERROR_MESSAGES.changeUsername);
  });

  it('should navigate to configuration on cancel', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onCancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/configuration']);
  });

  it('should return required error when userName is empty', () => {
    component.form.controls['userName'].setValue('');
    expect(component.getUserNameError()).toBe('El nombre es requerido');
  });

  it('should return minlength error when userName is too short', () => {
    component.form.controls['userName'].setValue('ab');
    expect(component.getUserNameError()).toBe('El nombre debe tener al menos 3 caracteres');
  });

  it('should return empty string when no errors', () => {
    component.form.controls['userName'].setValue('Valid Name');
    expect(component.getUserNameError()).toBe('');
  });
});
