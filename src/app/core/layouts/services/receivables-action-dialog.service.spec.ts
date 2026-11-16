import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  ReceivablesActionDialogService,
  ReceivablesActionDialogRequest,
} from '@core/layouts/services/receivables-action-dialog.service';

describe('ReceivablesActionDialogService', () => {
  let service: ReceivablesActionDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReceivablesActionDialogService);
  });

  it('starts without a pending request', () => {
    expect(service.request()).toBeNull();
  });

  it('stores the requested action', () => {
    const request: ReceivablesActionDialogRequest = {
      customerId: 'customer-1',
      customerName: 'Acme',
      action: 'pay_all',
    };

    service.open(request);

    expect(service.request()).toEqual(request);
  });

  it('clears the request when closed', () => {
    service.open({ customerId: 'customer-1', customerName: 'Acme', action: 'view' });

    service.close();

    expect(service.request()).toBeNull();
  });
});
