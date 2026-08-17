import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { vi } from 'vitest';
import { ChangePortalPasswordDialogComponent } from './change-portal-password-dialog.component';
import { CustomerApplicationService } from '@features/customers/services/application';
import { CUSTOMER_SUCCESS_MESSAGES } from '@features/customers/messages';

describe('ChangePortalPasswordDialogComponent', () => {
  let fixture: ComponentFixture<ChangePortalPasswordDialogComponent>;
  const service = {
    changePortalPassword: vi.fn().mockReturnValue(of(undefined)),
    loading: signal(false),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangePortalPasswordDialogComponent],
      providers: [{ provide: CustomerApplicationService, useValue: service }, MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePortalPasswordDialogComponent);
    fixture.componentRef.setInput('customerId', 'customer-1');
    fixture.componentRef.setInput('customerName', 'Cliente Uno');
    fixture.componentRef.setInput('customerRif', 'J-12345678-9');
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
  });

  it('should submit a valid portal password and use customer messages', () => {
    const component = fixture.componentInstance;
    const addSpy = vi.spyOn(TestBed.inject(MessageService), 'add');
    component.newPassword.set('Nueva@1234');
    component.confirmPassword.set('Nueva@1234');

    component.onSubmit();

    expect(service.changePortalPassword).toHaveBeenCalledWith('customer-1', 'Nueva@1234');
    expect(addSpy).toHaveBeenCalledWith(CUSTOMER_SUCCESS_MESSAGES.portalPasswordChanged);
  });

  it.each([
    ['Ab1@34', 'La contraseña debe tener al menos 8 caracteres'],
    ['A1@' + 'a'.repeat(99), 'La contraseña no puede exceder 100 caracteres'],
    ['abcde@123', 'La contraseña debe contener: letra mayúscula'],
    ['ABCDE@123', 'La contraseña debe contener: letra minúscula'],
    ['Abcdef@gh', 'La contraseña debe contener: número'],
    ['Abcdef123', 'La contraseña debe contener: carácter especial'],
  ])('should validate %s', (password, expectedError) => {
    fixture.componentInstance.newPassword.set(password);
    expect(fixture.componentInstance.passwordError()).toBe(expectedError);
  });

  it('should accept a compliant password and the customer RIF', () => {
    fixture.componentInstance.newPassword.set('Abcdef@123');
    expect(fixture.componentInstance.passwordError()).toBe('');

    fixture.componentInstance.newPassword.set('J-12345678-9');
    expect(fixture.componentInstance.passwordError()).toBe('');
  });
});
