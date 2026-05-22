import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DebitNoteFormPageComponent } from './debit-note-form-page.component';
import { FinanceApplicationService } from '@features/finances/services/application/finance-application.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

describe('DebitNoteFormPageComponent', () => {
  let component: DebitNoteFormPageComponent;
  let fixture: ComponentFixture<DebitNoteFormPageComponent>;
  let mockService: Partial<FinanceApplicationService>;
  let router: Router;
  let messageService: MessageService;

  function configureTestBed(createValue: any = of({ id: 'dn-001' })) {
    mockService = {
      createDebitNote: vi.fn().mockReturnValue(createValue),
      debitNotes: signal([]),
      loading: signal(false),
      error: signal(null),
      totalElements: signal(0),
    };

    TestBed.configureTestingModule({
      imports: [DebitNoteFormPageComponent, ReactiveFormsModule],
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
    fixture = TestBed.createComponent(DebitNoteFormPageComponent);
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

  describe('submit', () => {
    it('should call service.createDebitNote when form is valid', () => {
      fixture.detectChanges();
      component.form.patchValue({
        customerId: 'c1',
        invoiceId: 'inv-001',
        amount: 500,
        reason: 'Test reason',
      });

      component.submit();

      expect(mockService.createDebitNote).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: 'c1',
          invoiceId: 'inv-001',
          amount: 500,
          reason: 'Test reason',
        })
      );
    });

    it('should navigate to debit notes list on success', () => {
      fixture.detectChanges();
      component.form.patchValue({
        customerId: 'c1',
        invoiceId: 'inv-001',
        amount: 500,
        reason: 'Test reason',
      });

      const navigateSpy = vi.spyOn(router, 'navigate');
      component.submit();

      expect(navigateSpy).toHaveBeenCalledWith(['/finances/notas-debito']);
    });

    it('should not submit when form is invalid', () => {
      fixture.detectChanges();
      component.submit();
      expect(mockService.createDebitNote).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should navigate to /finanzas/notas-debito', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.cancel();
      expect(navigateSpy).toHaveBeenCalledWith(['/finances/notas-debito']);
    });
  });
});
