import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  InvoiceActionDialogRequest,
  InvoiceActionDialogService,
} from './invoice-action-dialog.service';

describe('InvoiceActionDialogService', () => {
  let service: InvoiceActionDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvoiceActionDialogService);
  });

  it('starts without a pending request', () => {
    expect(service.request()).toBeNull();
  });

  it('stores the requested action', () => {
    const request: InvoiceActionDialogRequest = {
      invoiceId: 'invoice-1',
      invoiceNumber: 'FAC-001',
      action: 'confirm',
    };

    service.open(request);

    expect(service.request()).toEqual(request);
  });

  it('clears the request when closed', () => {
    service.open({ invoiceId: 'invoice-1', invoiceNumber: 'FAC-001', action: 'duplicate' });

    service.close();

    expect(service.request()).toBeNull();
  });
});
