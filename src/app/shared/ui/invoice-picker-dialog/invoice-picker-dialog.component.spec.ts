import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InvoiceApiService } from '@features/invoices/services/api/invoice-api.service';
import { InvoicePickerDialogComponent } from './invoice-picker-dialog.component';

describe('InvoicePickerDialogComponent', () => {
  let fixture: ComponentFixture<InvoicePickerDialogComponent>;
  const invoiceApi = { getAll: vi.fn(() => of([])) };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [InvoicePickerDialogComponent],
      providers: [{ provide: InvoiceApiService, useValue: invoiceApi }],
    }).compileComponents();
    fixture = TestBed.createComponent(InvoicePickerDialogComponent);
  });

  it('loads only invoices associated with the selected customer', () => {
    fixture.componentRef.setInput('customerId', 'customer-1');

    fixture.componentInstance.onDialogShow();

    expect(invoiceApi.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: 'customer-1' }),
    );
  });
});
