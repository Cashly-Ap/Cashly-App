import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, signal, Component } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ChangePasswordDialogComponent } from '@features/platform/auth/user/components/change-password-dialog/change-password-dialog.component';
import { UserApplicationService } from '@features/platform/auth/user/services/application/user-application.service';

@Component({
  standalone: true,
  imports: [ChangePasswordDialogComponent],
  template: `<app-change-password-dialog
    [userId]="userId"
    [visible]="visible"
    (visibleChange)="onVisibleChange($event)"
    (changed)="onChanged()"
  />`,
})
class HostComponent {
  userId = 'user-001';
  visible = true;
  onVisibleChange = vi.fn();
  onChanged = vi.fn();
}

describe('ChangePasswordDialogComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialogComponent: ChangePasswordDialogComponent;
  let mockService: Partial<UserApplicationService>;
  let messageService: MessageService;

  function configureTestBed(changePasswordValue: any = of(undefined)) {
    mockService = {
      changePassword: vi.fn().mockReturnValue(changePasswordValue),
      loading: signal(false),
    };

    TestBed.configureTestingModule({
      imports: [HostComponent, ChangePasswordDialogComponent],
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

  it('should initialize form with password and confirmPassword controls', () => {
    expect(dialogComponent.form.contains('password')).toBe(true);
    expect(dialogComponent.form.contains('confirmPassword')).toBe(true);
  });

  it('should mark form as touched and return when form is invalid', () => {
    const markAllAsTouchedSpy = vi.spyOn(dialogComponent.form, 'markAllAsTouched');
    dialogComponent.onSubmit();
    expect(markAllAsTouchedSpy).toHaveBeenCalled();
  });

  it('should call changePassword and emit events on success', () => {
    const addSpy = vi.spyOn(messageService, 'add');

    dialogComponent.form.get('password')!.setValue('StrongPass1');
    dialogComponent.form.get('confirmPassword')!.setValue('StrongPass1');

    dialogComponent.onSubmit();

    expect(mockService.changePassword).toHaveBeenCalledWith('user-001', 'StrongPass1');
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Contraseña actualizada exitosamente',
      life: 3000,
    });
    expect(hostComponent.onVisibleChange).toHaveBeenCalledWith(false);
    expect(hostComponent.onChanged).toHaveBeenCalled();
  });

  it('should show error message on changePassword failure', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed(throwError(() => new Error('Failed')));
    createHostComponent();

    const addSpy = vi.spyOn(messageService, 'add');

    dialogComponent.form.get('password')!.setValue('StrongPass1');
    dialogComponent.form.get('confirmPassword')!.setValue('StrongPass1');

    dialogComponent.onSubmit();

    expect(addSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al actualizar la contraseña. Por favor, intente nuevamente.',
      life: 5000,
    });
  });

  it('should reset form and emit visibleChange on cancel', () => {
    dialogComponent.form.get('password')!.setValue('SomePass1');
    dialogComponent.onCancel();

    expect(dialogComponent.form.value.password).toBeNull();
    expect(hostComponent.onVisibleChange).toHaveBeenCalledWith(false);
  });

  it('should return empty string for getPasswordError when no errors', () => {
    dialogComponent.form.get('password')!.setValue('StrongPass1');
    dialogComponent.form.get('confirmPassword')!.setValue('StrongPass1');
    expect(dialogComponent.getPasswordError()).toBe('');
  });

  it('should return mismatch error when passwords do not match', () => {
    dialogComponent.form.get('password')!.setValue('StrongPass1');
    dialogComponent.form.get('confirmPassword')!.setValue('Different1');
    dialogComponent.onSubmit();
    expect(dialogComponent.form.errors).toHaveProperty('passwordsMismatch');
  });
});
