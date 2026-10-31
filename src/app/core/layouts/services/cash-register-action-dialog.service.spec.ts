import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CashRegisterActionDialogService } from '@core/layouts/services/cash-register-action-dialog.service';

describe('CashRegisterActionDialogService', () => {
  let service: CashRegisterActionDialogService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CashRegisterActionDialogService);
  });

  it('starts without a pending request', () => {
    expect(service.request()).toBeNull();
  });

  it('stores the requested action', () => {
    service.open({ action: 'close' });

    expect(service.request()).toEqual({ action: 'close' });
  });

  it('clears the pending request', () => {
    service.open({ action: 'detail' });

    service.close();

    expect(service.request()).toBeNull();
  });
});
