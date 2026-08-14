import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PendingTabsService } from '@core/pending-tabs';
import { CustomerApiService } from '@features/customers/services/api/customer-api.service';
import { InvoiceApiService } from '@features/invoices/services/api/invoice-api.service';
import { CreditNoteApplicationService } from '@features/credit-notes/services/application/credit-note-application.service';
import { CreditNoteFormPageComponent } from './credit-note-form-page.component';

describe('CreditNoteFormPageComponent', () => {
  let fixture: ComponentFixture<CreditNoteFormPageComponent>;
  const messageService = { add: vi.fn() };
  const service = {
    loading: signal(false),
    createCreditNote: vi.fn(() => of({})),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [CreditNoteFormPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({})),
            snapshot: { queryParamMap: convertToParamMap({}) },
          },
        },
        { provide: CreditNoteApplicationService, useValue: service },
        { provide: MessageService, useValue: messageService },
        { provide: PendingTabsService, useValue: { get: vi.fn(), save: vi.fn(), remove: vi.fn() } },
        { provide: CustomerApiService, useValue: { getForPicker: vi.fn(() => of({})) } },
        { provide: InvoiceApiService, useValue: { getAll: vi.fn(() => of([])) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreditNoteFormPageComponent);
    fixture.detectChanges();
  });

  it('uses structured customer and invoice picker dialogs', () => {
    expect(fixture.nativeElement.querySelector('app-customer-picker-dialog')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-invoice-picker-dialog')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Buscar y seleccionar cliente');
    expect(fixture.nativeElement.textContent).toContain(
      'Buscar factura por número, cliente o fecha',
    );
  });

  it('notifies which required fields are invalid when submitting an incomplete form', () => {
    fixture.componentInstance.onSubmit();

    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'warn',
        summary: 'Formulario incompleto',
      }),
    );
  });
});
