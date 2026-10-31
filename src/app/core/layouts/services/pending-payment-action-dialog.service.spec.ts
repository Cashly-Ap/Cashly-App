import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { PendingPaymentActionDialogService } from '@core/layouts/services/pending-payment-action-dialog.service';

describe('PendingPaymentActionDialogService', () => {
  let service: PendingPaymentActionDialogService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PendingPaymentActionDialogService);
  });

  it('starts without a pending request', () => {
    expect(service.request()).toBeNull();
  });

  it('stores the requested payment action', () => {
    service.open({ paymentId: 'payment-1', action: 'approve' });

    expect(service.request()).toEqual({ paymentId: 'payment-1', action: 'approve' });
  });

  it('clears the pending request', () => {
    service.open({ paymentId: 'payment-1', action: 'reject' });

    service.close();

    expect(service.request()).toBeNull();
  });
});
