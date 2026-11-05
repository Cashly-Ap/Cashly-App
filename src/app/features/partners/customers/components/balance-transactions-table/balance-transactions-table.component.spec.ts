import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { LanguageService } from '@core/i18n/language.service';
import { BalanceTransactionsTableComponent } from '@features/partners/customers/components/balance-transactions-table/balance-transactions-table.component';

describe('BalanceTransactionsTableComponent', () => {
  let fixture: ComponentFixture<BalanceTransactionsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceTransactionsTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BalanceTransactionsTableComponent);
    fixture.componentRef.setInput('transactions', [
      {
        id: 'transaction-1',
        customerId: 'customer-1',
        type: 'INVOICES',
        amount: 125,
        referenceType: 'INVOICES',
        referenceId: 'invoice-1',
        number: 'INV-001',
        referenceNumber: 'PED-001',
        createdBy: 'user-1',
        createdAt: '2026-08-17T10:00:00',
      },
    ]);
    fixture.componentRef.setInput('totalRecords', 1);
    fixture.detectChanges();
  });

  it('renders mobile cards and a desktop table at their corresponding breakpoints', () => {
    const mobile = fixture.nativeElement.querySelector(
      '[data-testid="balance-transactions-mobile"]',
    );
    const desktop = fixture.nativeElement.querySelector(
      '[data-testid="balance-transactions-desktop"]',
    );

    expect(mobile.className).toContain('md:hidden');
    expect(desktop.className).toContain('hidden');
    expect(desktop.className).toContain('md:block');
    expect(mobile.textContent).toContain('INV-001');
    expect(mobile.textContent).toContain('PED-001');
    expect(mobile.textContent?.replace(/\u00a0/g, ' ')).toContain('125,00 US$');
  });

  it('translates the movement type badge with the active language', () => {
    const language = TestBed.inject(LanguageService);

    language.setLanguage('es');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Factura');

    language.setLanguage('en');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Invoice');
  });
});
