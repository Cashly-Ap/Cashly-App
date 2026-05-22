import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CreditNoteFormPageComponent } from './credit-note-form-page.component';
import { FinanceApplicationService } from '@features/finances/services/application/finance-application.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

describe('CreditNoteFormPageComponent', () => {
  let component: CreditNoteFormPageComponent;
  let fixture: ComponentFixture<CreditNoteFormPageComponent>;
  let mockService: Partial<FinanceApplicationService>;
  let router: Router;
  let messageService: MessageService;

  function configureTestBed(createValue: any = of({ id: 'cn-001' })) {
    mockService = {
      createCreditNote: vi.fn().mockReturnValue(createValue),
      creditNotes: signal([]),
      loading: signal(false),
      error: signal(null),
      totalElements: signal(0),
    };

    TestBed.configureTestingModule({
      imports: [CreditNoteFormPageComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: FinanceApplicationService, useValue: mockService },
        MessageService,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();
  }

  function createComponent() {
    fixture = TestBed.createComponent(CreditNoteFormPageComponent);
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

  it('should have correct form structure', () => {
    fixture.detectChanges();
    expect(component.form.get('customerId')).toBeTruthy();
    expect(component.form.get('invoiceId')).toBeTruthy();
    expect(component.form.get('amount')).toBeTruthy();
    expect(component.form.get('reason')).toBeTruthy();
  });

  it('should mark customerId as required', () => {
    fixture.detectChanges();
    const ctrl = component.form.get('customerId');
    ctrl?.setValue('');
    expect(ctrl?.hasError('required')).toBe(true);
  });

  it('should mark amount as required', () => {
    fixture.detectChanges();
    const ctrl = component.form.get('amount');
    ctrl?.setValue(null);
    expect(ctrl?.hasError('required')).toBe(true);
  });

  it('should update submit tooltip when form is invalid', () => {
    fixture.detectChanges();
    expect(component.submitTooltip()).toContain('Campos requeridos');
  });

  describe('customer picker', () => {
    it('should open picker', () => {
      fixture.detectChanges();
      component.openPicker();
      expect(component.pickerVisible()).toBe(true);
    });

    it('should set selected customer on selection', () => {
      fixture.detectChanges();
      component.onCustomerSelected({ id: 'c1', alias: 'Test', legalName: 'Test C.A.' } as any);
      expect(component.selectedCustomer()?.id).toBe('c1');
      expect(component.form.get('customerId')?.value).toBe('c1');
      expect(component.pickerVisible()).toBe(false);
    });

    it('should close picker on cancel', () => {
      fixture.detectChanges();
      component.pickerVisible.set(true);
      component.onPickerCancelled();
      expect(component.pickerVisible()).toBe(false);
    });
  });

  describe('submit', () => {
    it('should call service.createCreditNote when form is valid', () => {
      fixture.detectChanges();
      component.form.patchValue({
        customerId: 'c1',
        invoiceId: 'inv-001',
        amount: 500,
        reason: 'Test reason',
      });

      component.submit();

      expect(mockService.createCreditNote).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: 'c1',
          invoiceId: 'inv-001',
          amount: 500,
          reason: 'Test reason',
        })
      );
    });

    it('should navigate to credit notes list on success', () => {
      fixture.detectChanges();
      component.form.patchValue({
        customerId: 'c1',
        invoiceId: 'inv-001',
        amount: 500,
        reason: 'Test reason',
      });

      const navigateSpy = vi.spyOn(router, 'navigate');
      component.submit();

      expect(navigateSpy).toHaveBeenCalledWith(['/finances/notas-credito']);
    });

    it('should show error on failure', () => {
      (TestBed as TestBedStatic).resetTestingModule();
      configureTestBed(throwError(() => new Error('Fail')));
      createComponent();
      fixture.detectChanges();
      component.form.patchValue({
        customerId: 'c1',
        invoiceId: 'inv-001',
        amount: 500,
        reason: 'Test reason',
      });

      const addSpy = vi.spyOn(messageService, 'add');
      component.submit();

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error' })
      );
    });

    it('should not submit when form is invalid', () => {
      fixture.detectChanges();
      component.submit();
      expect(mockService.createCreditNote).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should navigate to /finanzas/notas-credito', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.cancel();
      expect(navigateSpy).toHaveBeenCalledWith(['/finances/notas-credito']);
    });
  });
});
