import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, signal, Component } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ChangeEmailDialogComponent } from '@features/users/components/change-email-dialog/change-email-dialog.component';
import { UserApplicationService } from '@features/users/services/application/user-application.service';

@Component({
  standalone: true,
  imports: [ChangeEmailDialogComponent],
  template: `<app-change-email-dialog
    [userId]="userId"
    [visible]="visible"
    (visibleChange)="onVisibleChange($event)"
    (changed)="onChanged($event)"
  />`,
})
class HostComponent {
  userId = 'user-001';
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

  beforeEach(() => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed();
    createHostComponent();
  });

  it('should create', () => {
    expect(dialogComponent).toBeTruthy();
  });

  it('should initialize form with email and confirmEmail controls', () => {
    expect(dialogComponent.form.contains('email')).toBe(true);
    expect(dialogComponent.form.contains('confirmEmail')).toBe(true);
  });

  it('should mark form as touched and return when form is invalid', () => {
    const markAllAsTouchedSpy = vi.spyOn(dialogComponent.form, 'markAllAsTouched');
    dialogComponent.onSubmit();
    expect(markAllAsTouchedSpy).toHaveBeenCalled();
  });

  it('should call changeEmail and emit events on success', () => {
    const addSpy = vi.spyOn(messageService, 'add');

    dialogComponent.emailControl.setValue('new@example.com');
    dialogComponent.confirmEmailControl.setValue('new@example.com');

    dialogComponent.onSubmit();

    expect(mockService.changeEmail).toHaveBeenCalledWith('user-001', 'new@example.com');
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Correo electrónico actualizado exitosamente',
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

    dialogComponent.emailControl.setValue('new@example.com');
    dialogComponent.confirmEmailControl.setValue('new@example.com');

    dialogComponent.onSubmit();

    expect(addSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al actualizar el correo electrónico. Por favor, intente nuevamente.',
      life: 5000,
    });
  });

  it('should reset form and emit visibleChange on cancel', () => {
    dialogComponent.emailControl.setValue('test@example.com');
    dialogComponent.onCancel();

    expect(dialogComponent.form.value.email).toBeNull();
    expect(hostComponent.onVisibleChange).toHaveBeenCalledWith(false);
  });

  it('should return required error for email when empty', () => {
    dialogComponent.emailControl.setValue('');
    dialogComponent.emailControl.markAsTouched();
    expect(dialogComponent.getEmailError()).toBe('El correo electrónico es requerido');
  });

  it('should return invalid format error for email', () => {
    dialogComponent.emailControl.setValue('invalid-email');
    dialogComponent.emailControl.markAsTouched();
    expect(dialogComponent.getEmailError()).toBe('El formato del correo electrónico es inválido');
  });

  it('should return required error for confirmEmail when empty', () => {
    dialogComponent.confirmEmailControl.setValue('');
    dialogComponent.confirmEmailControl.markAsTouched();
    expect(dialogComponent.getConfirmEmailError()).toBe('La confirmación del correo es requerida');
  });

  it('should return mismatch error when emails do not match', () => {
    dialogComponent.emailControl.setValue('a@example.com');
    dialogComponent.confirmEmailControl.setValue('b@example.com');
    expect(dialogComponent.getConfirmEmailError()).toBe('Los correos electrónicos no coinciden');
  });

  it('should return empty string when no errors', () => {
    dialogComponent.emailControl.setValue('valid@example.com');
    dialogComponent.confirmEmailControl.setValue('valid@example.com');
    expect(dialogComponent.getConfirmEmailError()).toBe('');
  });
});
