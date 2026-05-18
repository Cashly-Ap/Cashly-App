import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ChangeCommissionDeductionPageComponent } from './change-commission-deduction-page.component';
import { AuthService } from '@features/auth/services/application';
import { AUTH_SUCCESS_MESSAGES, AUTH_ERROR_MESSAGES } from '@features/auth/messages';

describe('ChangeCommissionDeductionPageComponent', () => {
  let component: ChangeCommissionDeductionPageComponent;
  let fixture: ComponentFixture<ChangeCommissionDeductionPageComponent>;
  let mockAuthService: Partial<AuthService>;
  let router: Router;
  let messageService: MessageService;

  function configureTestBed(changeCommissionDeductionValue: any = of(undefined)) {
    mockAuthService = {
      changeCommissionDeduction: vi.fn().mockReturnValue(changeCommissionDeductionValue),
      currentUser: signal({ userName: 'Test User' }),
      loading: signal(false),
    };

    TestBed.configureTestingModule({
      imports: [ChangeCommissionDeductionPageComponent],
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
    fixture = TestBed.createComponent(ChangeCommissionDeductionPageComponent);
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

  it('should have a form with commissionDeductionPercentage control', () => {
    expect(component.form.contains('commissionDeductionPercentage')).toBe(true);
  });

  it('should patch form with 0 on init', () => {
    fixture.detectChanges();
    expect(component.form.value.commissionDeductionPercentage).toBe(0);
  });

  it('should mark form as touched and return when form is invalid', () => {
    const markAllAsTouchedSpy = vi.spyOn(component.form, 'markAllAsTouched');
    component.form.controls['commissionDeductionPercentage'].setValue(-1);
    component.onSubmit();
    expect(markAllAsTouchedSpy).toHaveBeenCalled();
  });

  it('should call changeCommissionDeduction and navigate on success', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    const addSpy = vi.spyOn(messageService, 'add');

    component.form.controls['commissionDeductionPercentage'].setValue(25);

    component.onSubmit();

    expect(mockAuthService.changeCommissionDeduction).toHaveBeenCalledWith({ commissionDeductionPercentage: 25 });
    expect(addSpy).toHaveBeenCalledWith(AUTH_SUCCESS_MESSAGES.commissionDeductionChanged);
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/configuration']);
  });

  it('should show error message on changeCommissionDeduction failure', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed(throwError(() => new Error('Failed')));
    createComponent();

    const addSpy = vi.spyOn(messageService, 'add');

    component.form.controls['commissionDeductionPercentage'].setValue(25);

    component.onSubmit();

    expect(addSpy).toHaveBeenCalledWith(AUTH_ERROR_MESSAGES.changeCommissionDeduction);
  });

  it('should navigate to configuration on cancel', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onCancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/configuration']);
  });

  it('should return required error when control is empty', () => {
    component.form.controls['commissionDeductionPercentage'].setValue(null);
    expect(component.getCommissionDeductionError()).toBe('El deducible mensual es requerido');
  });

  it('should return min error when value is less than 0', () => {
    component.form.controls['commissionDeductionPercentage'].setValue(-5);
    expect(component.getCommissionDeductionError()).toBe('El valor debe ser mayor o igual a 0');
  });

  it('should return max error when value exceeds 100', () => {
    component.form.controls['commissionDeductionPercentage'].setValue(101);
    expect(component.getCommissionDeductionError()).toBe('El valor no puede superar el 100%');
  });

  it('should return empty string when no errors', () => {
    component.form.controls['commissionDeductionPercentage'].setValue(50);
    expect(component.getCommissionDeductionError()).toBe('');
  });
});
