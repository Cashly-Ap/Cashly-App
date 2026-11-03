import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreditNoteApiService } from '@features/finance/billing/credit-notes/services/api/credit-note-api.service';
import { DebitNoteApiService } from '@features/finance/billing/debit-notes/services/api/debit-note-api.service';
import { InvoiceDetails } from '@features/finance/billing/invoices/models/interfaces/invoice-details.interface';
import { NoteFormDialogComponent } from '@shared/ui/note-form-dialog/note-form-dialog.component';

describe('NoteFormDialogComponent', () => {
  let fixture: ComponentFixture<NoteFormDialogComponent>;
  const creditNoteApi = { create: vi.fn(() => of({})) };
  const debitNoteApi = { create: vi.fn(() => of({})) };
  const messageService = { add: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    creditNoteApi.create.mockReturnValue(of({}));
    await TestBed.configureTestingModule({
      imports: [NoteFormDialogComponent],
      providers: [
        { provide: CreditNoteApiService, useValue: creditNoteApi },
        { provide: DebitNoteApiService, useValue: debitNoteApi },
        { provide: MessageService, useValue: messageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteFormDialogComponent);
    fixture.componentRef.setInput('invoice', createInvoice());
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
  });

  it('shows a form warning instead of silently ignoring an invalid submission', () => {
    fixture.componentInstance.submit();

    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'warn', summary: 'Formulario incompleto' }),
    );
    expect(creditNoteApi.create).not.toHaveBeenCalled();
  });

  it('publishes a persistent success notification after creating a credit note', () => {
    const confirmed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);
    fixture.componentInstance.amount.set(25);
    fixture.componentInstance.reason.set('Ajuste comercial');

    fixture.componentInstance.submit();

    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        detail: 'shared.notes.creditNoteCreatedSuccessfully',
      }),
    );
    expect(confirmed).toHaveBeenCalledOnce();
  });

  it('shows the API error and keeps the dialog open when creation fails', () => {
    creditNoteApi.create.mockReturnValue(
      throwError(() => ({ error: { message: 'El monto supera el saldo de la factura' } })),
    );
    fixture.componentInstance.amount.set(999);
    fixture.componentInstance.reason.set('Ajuste');

    fixture.componentInstance.submit();

    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        detail: 'El monto supera el saldo de la factura',
      }),
    );
    expect(fixture.componentInstance.isSubmitting()).toBe(false);
  });
});

function createInvoice(): InvoiceDetails {
  return {
    id: 'invoice-1',
    invoiceNumber: 'INV-2026-00054',
    customerId: 'customer-1',
    customerName: 'Cliente',
    customerRif: 'J-12345678-9',
  } as InvoiceDetails;
}
