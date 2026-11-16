import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, signal, Component } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ChangeEmailDialogComponent } from '@features/platform/auth/user/components/change-email-dialog/change-email-dialog.component';
import { UserApplicationService } from '@features/platform/auth/user/services/application/user-application.service';

@Component({
  standalone: true,
  imports: [ChangeEmailDialogComponent],
  template: `<app-change-email-dialog
    [userId]="userId"
    [currentEmail]="currentEmail"
    [selfService]="selfService"
    [visible]="visible"
    (visibleChange)="onVisibleChange($event)"
    (changed)="onChanged($event)"
  />`,
})
class HostComponent {
  userId = 'user-001';
  currentEmail = 'old@example.com';
  selfService = false;
  visible = true;
  onVisibleChange = vi.fn();
  onChanged = vi.fn();
}

describe('ChangeEmailDialogComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialogComponent: ChangeEmailDialogComponent;
  let mockService: Partial<UserApplicationService>;
  let messageService: MessageService;

  function configureTestBed(changeEmailValue: any = of(undefined)) {
    mockService = {
      changeEmail: vi.fn().mockReturnValue(changeEmailValue),
      changeOwnEmail: vi.fn().mockReturnValue(changeEmailValue),
      loading: signal(false),
    };

    TestBed.configureTestingModule({
      imports: [HostComponent, ChangeEmailDialogComponent],
      providers: [{ provide: UserApplicationService, useValue: mockService }, MessageService],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();
  }

  function createHostComponent() {
    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    dialogComponent = fixture.debugElement.children[0].componentInstance;
    messageService = TestBed.inject(MessageService);
  }

  function fillValidForm() {
    dialogComponent.currentEmailControl.setValue('old@example.com');
    dialogComponent.emailControl.setValue('new@example.com');
    dialogComponent.confirmEmailControl.setValue('new@example.com');
  }

  beforeEach(() => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed();
    createHostComponent();
  });

  it('should create', () => {
    expect(dialogComponent).toBeTruthy();
  });

  it('should initialize form with currentEmail, email and confirmEmail controls', () => {
    expect(dialogComponent.form.contains('currentEmail')).toBe(true);
    expect(dialogComponent.form.contains('email')).toBe(true);
    expect(dialogComponent.form.contains('confirmEmail')).toBe(true);
  });

  it('should prefill the current email', () => {
    expect(dialogComponent.currentEmailControl.value).toBe('old@example.com');
  });

  it('should mark form as touched and return when form is invalid', () => {
    const markAllAsTouchedSpy = vi.spyOn(dialogComponent.form, 'markAllAsTouched');
    dialogComponent.onSubmit();
    expect(markAllAsTouchedSpy).toHaveBeenCalled();
  });

  it('should call changeEmail and emit events on success', () => {
    const addSpy = vi.spyOn(messageService, 'add');

    fillValidForm();
    dialogComponent.onSubmit();

    expect(mockService.changeEmail).toHaveBeenCalledWith(
      'user-001',
      'new@example.com',
      'old@example.com',
    );
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'OK',
      detail: 'platform.auth.user.emailUpdatedSuccessfully',
      life: 3000,
    });
    expect(hostComponent.onVisibleChange).toHaveBeenCalledWith(false);
    expect(hostComponent.onChanged).toHaveBeenCalledWith('new@example.com');
  });

  it('should show error message on changeEmail failure', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed(throwError(() => new Error('Failed')));
    createHostComponent();

    const addSpy = vi.spyOn(messageService, 'add');

    fillValidForm();
    dialogComponent.onSubmit();

    expect(addSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'platform.auth.user.couldNotUpdateTheEmailAddressPleaseTryAgain',
      life: 5000,
    });
  });

  it('should reset form and emit visibleChange on cancel', () => {
    dialogComponent.emailControl.setValue('test@example.com');
    dialogComponent.onCancel();

    expect(dialogComponent.emailControl.value).toBe('');
    expect(hostComponent.onVisibleChange).toHaveBeenCalledWith(false);
  });

  it('should reject a current email that does not match the registered one', () => {
    dialogComponent.currentEmailControl.setValue('other@example.com');
    dialogComponent.currentEmailControl.markAsTouched();
    expect(dialogComponent.currentEmailError()).toBe(
      'platform.auth.user.theCurrentEmailDoesNotMatch',
    );
  });

  it('should reject a new email equal to the current one', () => {
    dialogComponent.currentEmailControl.setValue('old@example.com');
    dialogComponent.emailControl.setValue('old@example.com');
    dialogComponent.emailControl.markAsTouched();
    expect(dialogComponent.emailError()).toBe('platform.auth.user.theNewEmailMustBeDifferent');
  });

  it('should return required error for email when empty', () => {
    dialogComponent.emailControl.setValue('');
    dialogComponent.emailControl.markAsTouched();
    expect(dialogComponent.emailError()).toBe('platform.auth.anEmailAddressIsRequired');
  });

  it('should return invalid format error for email', () => {
    dialogComponent.emailControl.setValue('invalid-email');
    dialogComponent.emailControl.markAsTouched();
    expect(dialogComponent.emailError()).toBe('platform.auth.theEmailAddressFormatIsInvalid');
  });

  it('should return required error for confirmEmail when empty', () => {
    dialogComponent.confirmEmailControl.setValue('');
    dialogComponent.confirmEmailControl.markAsTouched();
    expect(dialogComponent.confirmEmailError()).toBe('platform.auth.emailConfirmationIsRequired');
  });

  it('should return mismatch error when emails do not match', () => {
    dialogComponent.emailControl.setValue('a@example.com');
    dialogComponent.confirmEmailControl.setValue('b@example.com');
    dialogComponent.confirmEmailControl.markAsTouched();
    expect(dialogComponent.confirmEmailError()).toBe('platform.auth.theEmailAddressesDoNotMatch');
  });

  it('should return empty string when no errors', () => {
    fillValidForm();
    expect(dialogComponent.confirmEmailError()).toBe('');
  });

  it('should use the self service on the own profile', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed();
    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.selfService = true;
    fixture.detectChanges();
    dialogComponent = fixture.debugElement.children[0].componentInstance;

    fillValidForm();
    dialogComponent.onSubmit();

    expect(mockService.changeOwnEmail).toHaveBeenCalledWith('new@example.com', 'old@example.com');
    expect(mockService.changeEmail).not.toHaveBeenCalled();
    expect(hostComponent.onChanged).toHaveBeenCalledWith('new@example.com');
  });
});
