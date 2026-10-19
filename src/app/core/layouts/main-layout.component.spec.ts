import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EMPTY, of } from 'rxjs';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { ThemeService } from '@core/theme/components/theme-toggle/theme.service';
import { MessageService } from 'primeng/api';
import { PdfViewerService } from '@core/pdf-viewer/services';
import { CatalogPdfApiService } from '@features/catalog/products/reporting/services/api/catalog-pdf-api.service';
import { CommercialCatalogPdfApiService } from '@features/catalog/products/reporting/services/api/commercial-catalog-pdf-api.service';
import { StockPdfApiService } from '@features/inventory/warehouses/reporting/services/api/stock-pdf-api.service';
import { StockExcelApiService } from '@features/inventory/warehouses/reporting/services/api/stock-excel-api.service';
import { MovementsPdfApiService } from '@features/inventory/warehouses/reporting/services/api/movements-pdf-api.service';
import { MovementsExcelApiService } from '@features/inventory/warehouses/reporting/services/api/movements-excel-api.service';
import { OrderPdfApiService } from '@features/sales/orders/reporting/services/api/order-pdf-api.service';
import { InvoicePdfApiService } from '@features/finance/billing/invoices/reporting/services/api/invoice-pdf-api.service';
import { QuotePdfApiService } from '@features/sales/quotes/reporting/services/api/quote-pdf-api.service';
import { PurchasePdfApiService } from '@features/procurement/purchases/reporting/services/api/purchase-pdf-api.service';
import { ReceivablesPdfApiService } from '@features/finance/treasury/receivables/reporting/services/api/receivables-pdf-api.service';
import { CashRegisterApiService } from '@features/finance/treasury/cash-register/services/api/cash-register-api.service';
import { NotificationApiService } from '@features/platform/notifications/services/api/notification-api.service';
import { NotificationWebSocketService } from '@features/platform/notifications/services/websocket/notification-websocket.service';
import { MenuItem } from '@core/layouts/models';
import { buildMenuItems, MenuCallbacks } from '@core/layouts/config/menu.config';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

function createPdfApiMock() {
  return {
    downloadPdf: vi.fn(),
    getPdf: vi.fn(),
    getExcel: vi.fn(),
    exportExcel: vi.fn(),
    exportReport: vi.fn(),
    downloadOrdersReportPdf: vi.fn(),
    downloadInvoicesReportPdf: vi.fn(),
    downloadQuotesReportPdf: vi.fn(),
    downloadPurchasesReportPdf: vi.fn(),
    getAccountsReceivablePdf: vi.fn(),
  };
}

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let authServiceMock: {
    currentUser: ReturnType<typeof signal>;
    clearAuthState: ReturnType<typeof vi.fn>;
    getUserType: ReturnType<typeof vi.fn>;
    hasPermission: ReturnType<typeof vi.fn>;
    isAuthenticated: ReturnType<typeof vi.fn>;
    ensureAccess: ReturnType<typeof vi.fn>;
    hasModulePermission: ReturnType<typeof vi.fn>;
  };
  let themeServiceMock: { isDarkMode: ReturnType<typeof signal<boolean>> };
  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
    events: ReturnType<typeof of>;
    url: string;
    createUrlTree: ReturnType<typeof vi.fn>;
    serializeUrl: ReturnType<typeof vi.fn>;
  };
  let pdfViewerServiceMock: {
    open: ReturnType<typeof vi.fn>;
  };
  let sanitizerMock: { bypassSecurityTrustResourceUrl: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authServiceMock = {
      currentUser: signal({
        id: '1',
        email: 'test@test.com',
        userName: 'Test User',
        type: 'OPERATOR',
        role: 'ADMIN',
        active: true,
        createdAt: new Date().toISOString(),
      }),
      clearAuthState: vi.fn(),
      getUserType: vi.fn().mockReturnValue('ADMIN'),
      hasPermission: vi
        .fn()
        .mockImplementation((module: BusinessModule) =>
          authServiceMock.hasModulePermission(module),
        ),
      isAuthenticated: vi.fn().mockReturnValue(true),
      ensureAccess: vi.fn().mockReturnValue(of({})),
      hasModulePermission: vi.fn().mockReturnValue(true),
    };

    themeServiceMock = {
      isDarkMode: signal(false),
    };

    routerMock = {
      navigate: vi.fn(),
      events: of(),
      url: '/',
      createUrlTree: vi.fn(),
      serializeUrl: vi.fn(),
    };

    pdfViewerServiceMock = {
      open: vi.fn(),
    };

    sanitizerMock = {
      bypassSecurityTrustResourceUrl: vi.fn().mockReturnValue('safe-url'),
    };

    const pdfApiMock = createPdfApiMock();
    const notificationApiMock = {
      getUnreadCount: vi.fn().mockReturnValue(of({ count: 0 })),
      list: vi.fn().mockReturnValue(of([])),
      markAsRead: vi.fn().mockReturnValue(of(undefined)),
      markAllAsRead: vi.fn().mockReturnValue(of(undefined)),
    };
    const notificationWebSocketMock = {
      notification$: EMPTY,
      connect: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ThemeService, useValue: themeServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: PdfViewerService, useValue: pdfViewerServiceMock },
        { provide: DomSanitizer, useValue: sanitizerMock },
        { provide: CatalogPdfApiService, useValue: pdfApiMock },
        { provide: CommercialCatalogPdfApiService, useValue: pdfApiMock },
        { provide: StockPdfApiService, useValue: pdfApiMock },
        { provide: StockExcelApiService, useValue: pdfApiMock },
        { provide: MovementsPdfApiService, useValue: pdfApiMock },
        { provide: MovementsExcelApiService, useValue: pdfApiMock },
        { provide: OrderPdfApiService, useValue: pdfApiMock },
        { provide: InvoicePdfApiService, useValue: pdfApiMock },
        { provide: QuotePdfApiService, useValue: pdfApiMock },
        { provide: PurchasePdfApiService, useValue: pdfApiMock },
        { provide: ReceivablesPdfApiService, useValue: pdfApiMock },
        { provide: CashRegisterApiService, useValue: pdfApiMock },
        { provide: NotificationApiService, useValue: notificationApiMock },
        { provide: NotificationWebSocketService, useValue: notificationWebSocketMock },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({}),
            snapshot: { params: {}, queryParams: {} },
          },
        },
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ERP permission filtering', () => {
    function menu(): MenuItem[] {
      const callbacks: MenuCallbacks = {
        openCatalogModal: vi.fn(),
        openCommercialCatalogModal: vi.fn(),
        openStockModal: vi.fn(),
        openMovementsModal: vi.fn(),
        openOrdersPdfModal: vi.fn(),
        openInvoicesPdfModal: vi.fn(),
        openQuotesPdfModal: vi.fn(),
        openAccountsReceivablePdfModal: vi.fn(),
        openCashRegisterModal: vi.fn(),
        openPurchasesPdfModal: vi.fn(),
      };
      return buildMenuItems(callbacks);
    }

    function routes(items: MenuItem[]): string[] {
      return items.flatMap((item) => [
        ...(item.routerLink ? [item.routerLink] : []),
        ...routes(item.children ?? []),
      ]);
    }

    it('should hide all areas for an operator without business module permissions', () => {
      authServiceMock.hasModulePermission.mockReturnValue(false);
      const items = component['filterMenuByRole'](menu(), 'OPERATOR');
      expect(items.map((item) => item.label)).toEqual(['Plataforma']);
      expect(routes(items)).toEqual(['/platform/auth/configuration']);
    });

    it('should prune recursively empty report areas and preserve actionable leaves', () => {
      authServiceMock.hasModulePermission.mockImplementation(
        (module: BusinessModule) => module === BusinessModule.DOCUMENT_ADMIN,
      );
      const items = component['filterMenuByRole'](menu(), 'OPERATOR');
      expect(items.map((item) => item.label)).toEqual(['Plataforma']);
      const action = vi.fn();
      expect(
        component['filterMenuByRole'](
          [
            { label: 'Empty', icon: '', children: [] },
            { label: 'Report', icon: '', command: action, children: [] },
            { label: 'Page', icon: '', routerLink: '/page', children: [] },
          ],
          'OPERATOR',
        ).map((item) => item.label),
      ).toEqual(['Report', 'Page']);
    });

    it('should keep inventory pricing accessible without sales permission', () => {
      authServiceMock.hasModulePermission.mockImplementation(
        (module: BusinessModule) => module === BusinessModule.INVENTORY,
      );
      const items = component['filterMenuByRole'](menu(), 'OPERATOR');
      expect(routes(items).sort()).toEqual(
        ['/inventory/warehouses', '/platform/auth/configuration'].sort(),
      );
      expect(items.map((item) => item.label)).toEqual(['Inventario', 'Plataforma']);
    });

    it('should expose administration to every custom role with users permission', () => {
      expect(
        component['filterMenuByRole'](menu(), 'ADMIN')
          .flatMap((item) => item.children ?? [])
          .some((item) => item.routerLink === '/platform/users'),
      ).toBe(true);
      expect(routes(component['filterMenuByRole'](menu(), 'SUPER_ADMIN'))).toContain(
        '/platform/users',
      );
      authServiceMock.hasModulePermission.mockImplementation(
        (module: BusinessModule) => module !== BusinessModule.USERS,
      );
      expect(
        component['filterMenuByRole'](menu(), 'SUPER_ADMIN')
          .flatMap((item) => item.children ?? [])
          .some((item) => item.routerLink === '/platform/users'),
      ).toBe(false);
    });

    it('hides report actions without owner EXPORT even with document EXPORT', () => {
      authServiceMock.hasPermission.mockImplementation(
        (module, action = 'READ') =>
          module === BusinessModule.DOCUMENT_ADMIN ||
          (module === BusinessModule.SALES && action === 'READ'),
      );
      const items = component['filterMenuByRole'](menu(), 'OPERATOR');
      expect(
        items.find((item) => item.label === 'Ventas')?.children?.map((item) => item.label),
      ).toEqual(['Presupuestos', 'Pedidos']);
    });

    it('hides report actions without document EXPORT even with owner EXPORT', () => {
      authServiceMock.hasPermission.mockImplementation(
        (module, action = 'READ') =>
          module === BusinessModule.SALES ||
          (module === BusinessModule.DOCUMENT_ADMIN && action === 'READ'),
      );
      const items = component['filterMenuByRole'](menu(), 'OPERATOR');
      expect(
        items.find((item) => item.label === 'Ventas')?.children?.map((item) => item.label),
      ).toEqual(['Presupuestos', 'Pedidos']);
    });

    it('should require both document access and the corresponding area for report actions', () => {
      authServiceMock.hasModulePermission.mockImplementation((module: BusinessModule) =>
        [BusinessModule.SALES, BusinessModule.DOCUMENT_ADMIN].includes(module),
      );
      const items = component['filterMenuByRole'](menu(), 'OPERATOR');
      const reports = items
        .find((item) => item.label === 'Ventas')
        ?.children?.find((item) => item.label === 'Reportes');
      expect(reports?.children).toHaveLength(2);
      authServiceMock.hasModulePermission.mockImplementation(
        (module: BusinessModule) => module === BusinessModule.SALES,
      );
      expect(
        component['filterMenuByRole'](menu(), 'OPERATOR')
          .flatMap((item) => item.children ?? [])
          .some((item) => item.label === 'Reportes'),
      ).toBe(false);
    });
  });

  describe('initialization', () => {
    it('should initialize with menu items array', () => {
      const items = component.primeMenuItems();
      expect(items).toBeDefined();
      expect(Array.isArray(items)).toBe(true);
    });

    it('should expose currentUser from AuthService', () => {
      expect(component.currentUser()?.userName).toBe('Test User');
      expect(component.currentUser()?.email).toBe('test@test.com');
    });

    it('should convert menu items to PrimeNG format', () => {
      const items = component.primeMenuItems();
      expect(items).toBeDefined();
      expect(Array.isArray(items)).toBe(true);
    });
  });

  describe('logoSrc', () => {
    it('should use the display-sized logo asset', () => {
      expect(component.logoSrc).toBe('/cashly-logo.svg');
    });
  });

  describe('maxWidth input and maxWidthClass computed', () => {
    it('should default maxWidth to 7xl', () => {
      expect(component.maxWidth()).toBe('7xl');
    });

    it('should compute maxWidthClass from maxWidth input', () => {
      expect(component.maxWidthClass()).toBe('max-w-7xl');
    });

    it('should return empty string for none maxWidth', () => {
      fixture.componentRef.setInput('maxWidth', 'none');
      fixture.detectChanges();
      expect(component.maxWidthClass()).toBe('');
    });

    it('should return empty string for full maxWidth', () => {
      fixture.componentRef.setInput('maxWidth', 'full');
      fixture.detectChanges();
      expect(component.maxWidthClass()).toBe('');
    });

    it('should handle different maxWidth values', () => {
      const testCases: Array<{ input: string; expected: string }> = [
        { input: 'sm', expected: 'max-w-sm' },
        { input: 'md', expected: 'max-w-md' },
        { input: 'lg', expected: 'max-w-lg' },
        { input: 'xl', expected: 'max-w-xl' },
        { input: '2xl', expected: 'max-w-2xl' },
        { input: '4xl', expected: 'max-w-4xl' },
        { input: '5xl', expected: 'max-w-5xl' },
        { input: '6xl', expected: 'max-w-6xl' },
      ];

      testCases.forEach(({ input, expected }) => {
        fixture.componentRef.setInput('maxWidth', input);
        fixture.detectChanges();
        expect(component.maxWidthClass()).toBe(expected);
      });
    });
  });

  describe('user menu actions', () => {
    it('should navigate to configuration', () => {
      component.userMenu = { hide: vi.fn() } as unknown as typeof component.userMenu;
      component.goToConfiguration();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/platform/auth/configuration']);
      expect(component.userMenu.hide).toHaveBeenCalled();
    });

    it('should logout and navigate to login', () => {
      component.userMenu = { hide: vi.fn() } as unknown as typeof component.userMenu;
      component.logout();

      expect(authServiceMock.clearAuthState).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/platform/auth/login']);
      expect(component.userMenu.hide).toHaveBeenCalled();
    });

    it('should toggle user menu', () => {
      const mockEvent = new Event('click');
      component.userMenu = { toggle: vi.fn() } as unknown as typeof component.userMenu;

      component.toggleUserMenu(mockEvent);

      expect(component.userMenu.toggle).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('lifecycle hooks', () => {
    it('should subscribe to scroll events on init', () => {
      expect(component['scrollSubscription']).toBeDefined();
    });

    it('should unsubscribe from scroll events on destroy', () => {
      const unsubscribeSpy = vi.fn();
      component['scrollSubscription'] = {
        unsubscribe: unsubscribeSpy,
      } as unknown as (typeof component)['scrollSubscription'];

      component.ngOnDestroy();

      expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('should handle destroy when no subscription exists', () => {
      component['scrollSubscription'] = undefined;

      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});
