import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfigurationPageComponent } from '@features/platform/auth/pages/configuration/configuration-page.component';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { MessageService } from 'primeng/api';
import { CatalogPdfApiService } from '@features/catalog/products/reporting/services/api/catalog-pdf-api.service';
import { StockPdfApiService } from '@features/inventory/warehouses/reporting/services/api/stock-pdf-api.service';
import { MovementsPdfApiService } from '@features/inventory/warehouses/reporting/services/api/movements-pdf-api.service';
import { OrderPdfApiService } from '@features/sales/orders/reporting/services/api/order-pdf-api.service';
import { InvoicePdfApiService } from '@features/finance/billing/invoices/reporting/services/api/invoice-pdf-api.service';
import { QuotePdfApiService } from '@features/sales/quotes/reporting/services/api/quote-pdf-api.service';

describe('ConfigurationPageComponent', () => {
  let component: ConfigurationPageComponent;
  let fixture: ComponentFixture<ConfigurationPageComponent>;
  let mockAuthService: Partial<AuthService>;
  let router: Router;

  const pdfMocks = [
    { provide: CatalogPdfApiService, useValue: { downloadPdf: vi.fn() } },
    { provide: StockPdfApiService, useValue: { getPdf: vi.fn() } },
    { provide: MovementsPdfApiService, useValue: { getPdf: vi.fn() } },
    { provide: OrderPdfApiService, useValue: { downloadOrdersReportPdf: vi.fn() } },
    { provide: InvoicePdfApiService, useValue: { downloadInvoicesReportPdf: vi.fn() } },
    { provide: QuotePdfApiService, useValue: { downloadQuotesReportPdf: vi.fn() } },
  ];

  function setupTest(userName = 'John Doe', role = 'ADMIN') {
    (TestBed as TestBedStatic).resetTestingModule();

    mockAuthService = {
      currentUser: signal({
        userName,
        email: 'john@example.com',
        role,
        type: role,
      }),
      loading: signal(false),
    };

    TestBed.configureTestingModule({
      imports: [ConfigurationPageComponent],
      providers: [
        { provide: AuthorizationService, useValue: { can: () => true } },
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        MessageService,
        ...pdfMocks,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();

    fixture = TestBed.createComponent(ConfigurationPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  }

  beforeEach(() => {
    setupTest();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return first letter uppercase for getInitials', () => {
    expect(component.getInitials()).toBe('J');
  });

  it('should return empty string for getInitials when userName is empty', () => {
    setupTest('');
    expect(component.getInitials()).toBe('');
  });

  it('should return correct label for OPERATOR user type', () => {
    expect(component.getUserTypeLabel('OPERATOR')).toBe('Operador');
  });

  it('should return correct label for ADMIN user type', () => {
    expect(component.getUserTypeLabel('ADMIN')).toBe('Administrador');
  });

  it('should return correct label for SUPER_ADMIN user type', () => {
    expect(component.getUserTypeLabel('SUPER_ADMIN')).toBe('Super Administrador');
  });

  it('should return the input for unknown user type', () => {
    expect(component.getUserTypeLabel('UNKNOWN' as any)).toBe('UNKNOWN');
  });

  it('should navigate to /auth/change-username on onEditName', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEditName();
    expect(navigateSpy).toHaveBeenCalledWith(['/platform/auth/change-username']);
  });

  it('should navigate to /auth/change-password onChangePassword', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onChangePassword();
    expect(navigateSpy).toHaveBeenCalledWith(['/platform/auth/change-password']);
  });
});
