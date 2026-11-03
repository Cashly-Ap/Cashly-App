import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { UserPreferencesService } from '@core/preferences/user-preferences.service';
import { PaymentHistoryDialogComponent } from '@features/finance/treasury/receivables/components/payment-history-dialog/payment-history-dialog.component';

describe('invoice payment history', () => {
  let fixture: ComponentFixture<PaymentHistoryDialogComponent>;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PaymentHistoryDialogComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserPreferencesService, useValue: { colorMode: signal('minimal') } },
      ],
    }).overrideComponent(PaymentHistoryDialogComponent, {
      set: { template: '', imports: [] },
    });
    fixture = TestBed.createComponent(PaymentHistoryDialogComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.componentRef.setInput('customerId', 'customer-a');
    fixture.componentRef.setInput('invoiceId', 'invoice-a');
    fixture.componentRef.setInput('visible', true);
  });

  afterEach(() => {
    fixture.destroy();
    http.verify();
  });

  it('requests only payments allocated to the selected invoice', () => {
    fixture.detectChanges();
    const request = http.expectOne((request) =>
      request.url.endsWith('/customers/customer-a/payment-history'),
    );
    expect(request.request.params.get('invoiceId')).toBe('invoice-a');
    request.flush({ content: [] });
  });

  it('cancels the previous invoice request when another invoice is selected', () => {
    fixture.detectChanges();
    const previous = http.expectOne((request) => request.params.get('invoiceId') === 'invoice-a');
    fixture.componentRef.setInput('invoiceId', 'invoice-b');
    fixture.detectChanges();
    expect(previous.cancelled).toBe(true);
    const current = http.expectOne((request) => request.params.get('invoiceId') === 'invoice-b');
    current.flush({ content: [{ id: 'payment-b', amount: 5, status: 'APPLIED' }] });
    expect(fixture.componentInstance['payments']().map((payment) => payment.id)).toEqual([
      'payment-b',
    ]);
  });

  it('loads the full customer history when no invoice is selected', () => {
    fixture.componentRef.setInput('invoiceId', null);
    fixture.detectChanges();
    const request = http.expectOne((request) =>
      request.url.endsWith('/customers/customer-a/payment-history'),
    );
    expect(request.request.params.has('invoiceId')).toBe(false);
    request.flush({ content: [] });
  });

  it('counts applied payments as approved', () => {
    fixture.detectChanges();
    http
      .expectOne((request) => request.params.get('invoiceId') === 'invoice-a')
      .flush({ content: [{ id: 'payment-a', amount: 5, status: 'APPLIED' }] });
    expect(fixture.componentInstance['approvedCount']()).toBe(1);
  });

  it('clears the previous invoice history while loading another invoice', () => {
    fixture.detectChanges();
    http
      .expectOne((request) => request.params.get('invoiceId') === 'invoice-a')
      .flush({ content: [{ id: 'payment-a', amount: 5, status: 'APPLIED' }] });
    fixture.componentRef.setInput('invoiceId', 'invoice-b');
    fixture.detectChanges();
    expect(fixture.componentInstance['payments']()).toEqual([]);
    http
      .expectOne((request) => request.params.get('invoiceId') === 'invoice-b')
      .flush({ content: [] });
  });
});
