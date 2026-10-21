import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import {
  Component,
  computed,
  ViewChild,
  OnInit,
  OnDestroy,
  input,
  inject,
  signal,
  HostListener,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router, RouterOutlet, NavigationStart } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MenuItem as PrimeMenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { Ripple } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { Popover } from 'primeng/popover';
import { DrawerModule, Drawer } from 'primeng/drawer';
import { PanelMenuModule } from 'primeng/panelmenu';
import { finalize } from 'rxjs';
import { MenuItem } from '@core/layouts/models';
import { buildMenuItems } from '@core/layouts/config';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { UserType } from '@features/platform/auth/models/interfaces/user.interface';
import { ThemeToggleComponent } from '@core/theme/components';
import { PendingTabsDropdownComponent } from '@core/pending-tabs/components';
import { NotificationBellComponent } from '@features/platform/notifications/components/notification-bell/notification-bell.component';
import { CatalogPdfModalComponent } from '@features/catalog/products/reporting/components/catalog-pdf-modal/catalog-pdf-modal.component';
import { CommercialCatalogPdfModalComponent } from '@features/catalog/products/reporting/components/commercial-catalog-pdf-modal/commercial-catalog-pdf-modal.component';
import { StockPdfModalComponent } from '@features/inventory/warehouses/reporting/components/stock-pdf-modal/stock-pdf-modal.component';
import { MovementsPdfModalComponent } from '@features/inventory/warehouses/reporting/components/movements-pdf-modal/movements-pdf-modal.component';
import { PdfViewerModalComponent } from '@shared/components/pdf-viewer-modal/pdf-viewer-modal.component';
import { CatalogPdfApiService } from '@features/catalog/products/reporting/services/api/catalog-pdf-api.service';
import { CommercialCatalogPdfApiService } from '@features/catalog/products/reporting/services/api/commercial-catalog-pdf-api.service';
import { StockPdfApiService } from '@features/inventory/warehouses/reporting/services/api/stock-pdf-api.service';
import { StockExcelApiService } from '@features/inventory/warehouses/reporting/services/api/stock-excel-api.service';
import { MovementsPdfApiService } from '@features/inventory/warehouses/reporting/services/api/movements-pdf-api.service';
import { MovementsExcelApiService } from '@features/inventory/warehouses/reporting/services/api/movements-excel-api.service';
import { CatalogPdfFilters } from '@features/catalog/products/reporting/models/interfaces/catalog-pdf-filters.interface';
import { CommercialCatalogPdfFilters } from '@features/catalog/products/reporting/models/interfaces/commercial-catalog-pdf-filters.interface';
import { StockPdfFilters } from '@features/inventory/warehouses/reporting/models/interfaces/stock-pdf-filters.interface';
import { MovementsPdfFilters } from '@features/inventory/warehouses/reporting/models/interfaces/movements-pdf-filters.interface';
import { OrderPdfModalComponent } from '@features/sales/orders/reporting/components/order-pdf-modal/order-pdf-modal.component';
import {
  OrderPdfApiService,
  OrdersPdfFilters,
} from '@features/sales/orders/reporting/services/api/order-pdf-api.service';
import { InvoicePdfModalComponent } from '@features/finance/billing/invoices/reporting/components/invoice-pdf-modal/invoice-pdf-modal.component';
import {
  InvoicePdfApiService,
  InvoicesPdfFilters,
} from '@features/finance/billing/invoices/reporting/services/api/invoice-pdf-api.service';
import { QuotePdfModalComponent } from '@features/sales/quotes/reporting/components/quote-pdf-modal/quote-pdf-modal.component';
import {
  QuotePdfApiService,
  QuotesPdfFilters,
} from '@features/sales/quotes/reporting/services/api/quote-pdf-api.service';
import { PurchasePdfModalComponent } from '@features/procurement/purchases/reporting/components/purchase-pdf-modal/purchase-pdf-modal.component';
import {
  PurchasePdfApiService,
  PurchasesPdfFilters,
} from '@features/procurement/purchases/reporting/services/api/purchase-pdf-api.service';
import { CashRegisterReportModalComponent } from '@features/finance/treasury/cash-register/reporting/components/cash-register-report-modal/cash-register-report-modal.component';
import { AccountsReceivablePdfModalComponent } from '@features/finance/treasury/receivables/reporting/components/accounts-receivable-pdf-modal/accounts-receivable-pdf-modal.component';
import { CashRegisterReportFilters } from '@features/finance/treasury/cash-register/reporting/models/interfaces';
import { AccountsReceivableFilters } from '@features/finance/treasury/receivables/reporting/models/interfaces';
import { ReceivablesPdfApiService } from '@features/finance/treasury/receivables/reporting/services/api/receivables-pdf-api.service';
import { CashRegisterApiService } from '@features/finance/treasury/cash-register/services/api/cash-register-api.service';
import { fromEvent, Subscription, filter } from 'rxjs';
import { FileDownloadHelper } from '@shared/utils/file-download.helper';
export type ContentMaxWidth =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'
  | 'full'
  | 'none';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NgOptimizedImage,
    ButtonModule,
    ToastModule,
    MenubarModule,
    Ripple,
    AvatarModule,
    RouterOutlet,
    ThemeToggleComponent,
    Popover,
    PendingTabsDropdownComponent,
    NotificationBellComponent,
    DrawerModule,
    PanelMenuModule,
    CatalogPdfModalComponent,
    CommercialCatalogPdfModalComponent,
    StockPdfModalComponent,
    MovementsPdfModalComponent,
    PdfViewerModalComponent,
    OrderPdfModalComponent,
    InvoicePdfModalComponent,
    QuotePdfModalComponent,
    PurchasePdfModalComponent,
    CashRegisterReportModalComponent,
    AccountsReceivablePdfModalComponent,
  ],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('userMenu') userMenu!: Popover;
  @ViewChild('mobileDrawer') mobileDrawer!: Drawer;

  mobileMenuVisible = signal(false);
  isMobile = signal(false);

  private authService = inject(AuthService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private catalogPdfApi = inject(CatalogPdfApiService);
  private commercialCatalogPdfApi = inject(CommercialCatalogPdfApiService);
  private stockPdfApi = inject(StockPdfApiService);
  private stockExcelApi = inject(StockExcelApiService);
  private movementsPdfApi = inject(MovementsPdfApiService);
  private movementsExcelApi = inject(MovementsExcelApiService);
  private orderPdfApi = inject(OrderPdfApiService);
  private invoicePdfApi = inject(InvoicePdfApiService);
  private quotePdfApi = inject(QuotePdfApiService);
  private purchasePdfApi = inject(PurchasePdfApiService);
  private financePdfApi = inject(ReceivablesPdfApiService);
  private cashRegisterApi = inject(CashRegisterApiService);
  private scrollSubscription?: Subscription;
  private routerSubscription?: Subscription;
  private currentObjectUrl: string | null = null;

  maxWidth = input<ContentMaxWidth>('7xl');

  currentUser = this.authService.currentUser;

  logoSrc = '/cashly-logo.svg';

  readonly activeModal = signal<
    | 'catalog'
    | 'commercialCatalog'
    | 'stock'
    | 'movements'
    | 'orders'
    | 'invoices'
    | 'quotes'
    | 'purchases'
    | 'accountsReceivable'
    | 'cashRegister'
    | null
  >(null);
  readonly pdfViewerVisible = signal(false);
  readonly pdfUrl = signal<SafeResourceUrl | null>(null);
  readonly pdfTitle = signal('');
  readonly loadingPdf = signal(false);

  primeMenuItems = computed<PrimeMenuItem[]>(() => {
    const userType = this.authService.currentUser()?.type as UserType;
    return this.buildMenuItems(userType).map((item) => this.convertMenuItem(item));
  });

  mobileMenuItems = computed<PrimeMenuItem[]>(() => {
    const userType = this.authService.currentUser()?.type as UserType;
    return this.buildMenuItems(userType).map((item) => this.convertToMobileMenuItem(item));
  });

  maxWidthClass = computed(() => {
    const width = this.maxWidth();
    if (width === 'none' || width === 'full') {
      return '';
    }
    return `max-w-${width}`;
  });

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated())
      this.authService.ensureAccess().subscribe({ error: () => undefined });
    this.checkScreenSize();
    this.scrollSubscription = fromEvent(window, 'scroll').subscribe(() => {
      if (this.userMenu?.overlayVisible) {
        this.userMenu.hide();
      }
    });

    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe(() => {
        this.closeMobileMenu();
      });
  }

  ngOnDestroy(): void {
    this.scrollSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
    this.revokeCurrentUrl();
  }

  private buildMenuItems(userType: UserType): MenuItem[] {
    const user = this.authService.currentUser();
    const role = (user?.role || user?.type) as UserType;
    const callbacks = {
      openCatalogModal: () => this.activeModal.set('catalog'),
      openCommercialCatalogModal: () => this.activeModal.set('commercialCatalog'),
      openStockModal: () => this.activeModal.set('stock'),
      openMovementsModal: () => this.activeModal.set('movements'),
      openOrdersPdfModal: () => this.activeModal.set('orders'),
      openInvoicesPdfModal: () => this.activeModal.set('invoices'),
      openQuotesPdfModal: () => this.activeModal.set('quotes'),
      openPurchasesPdfModal: () => this.activeModal.set('purchases'),
      openAccountsReceivablePdfModal: () => this.activeModal.set('accountsReceivable'),
      openCashRegisterModal: () => this.activeModal.set('cashRegister'),
    };
    return this.filterMenuByRole(buildMenuItems(callbacks), role);
  }

  private filterMenuByRole(items: MenuItem[], userType: UserType): MenuItem[] {
    return items
      .filter((item) => {
        if (
          item.requiredModule &&
          !this.authService.hasPermission(item.requiredModule, item.requiredAction ?? 'READ')
        )
          return false;
        if (
          item.requiredAction &&
          !this.authService.hasPermission(BusinessModule.DOCUMENT_ADMIN, item.requiredAction)
        )
          return false;
        return true;
      })
      .map((item) => {
        if (item.children) {
          return {
            ...item,
            children: this.filterMenuByRole(item.children, userType),
          };
        }
        return item;
      })
      .filter(
        (item) => !item.children || item.children.length > 0 || !!item.routerLink || !!item.command,
      );
  }

  private convertMenuItem(item: MenuItem): PrimeMenuItem {
    const primeItem: PrimeMenuItem = {
      label: item.label,
      icon: item.icon,
      routerLink: item.routerLink,
      visible: item.visible ?? true,
      badge: item.badge,
      separator: item.separator,
      command: item.command,
    };

    if (item.children) {
      primeItem.items = item.children.map((child) => this.convertMenuItem(child));
    }

    return primeItem;
  }

  onCatalogPdf(filters: CatalogPdfFilters): void {
    this.activeModal.set(null);
    this.loadingPdf.set(true);
    this.pdfTitle.set('Reporte de Productos');
    this.pdfViewerVisible.set(true);
    this.catalogPdfApi
      .downloadPdf(filters)
      .pipe(finalize(() => this.loadingPdf.set(false)))
      .subscribe({
        next: (blob) => {
          this.revokeCurrentUrl();
          const url = URL.createObjectURL(blob);
          this.currentObjectUrl = url;
          this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        },
      });
  }

  onCommercialCatalogPdf(filters: CommercialCatalogPdfFilters): void {
    this.activeModal.set(null);
    this.loadingPdf.set(true);
    this.pdfTitle.set('Catálogo Comercial');
    this.pdfViewerVisible.set(true);
    this.commercialCatalogPdfApi
      .downloadPdf(filters)
      .pipe(finalize(() => this.loadingPdf.set(false)))
      .subscribe({
        next: (blob) => {
          this.revokeCurrentUrl();
          const url = URL.createObjectURL(blob);
          this.currentObjectUrl = url;
          this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        },
      });
  }

  onStockPdf(filters: StockPdfFilters): void {
    this.activeModal.set(null);
    this.loadingPdf.set(true);
    this.pdfTitle.set('Stock de Almacenes');
    this.pdfViewerVisible.set(true);
    this.stockPdfApi
      .getPdf(filters)
      .pipe(finalize(() => this.loadingPdf.set(false)))
      .subscribe({
        next: (blob) => {
          this.revokeCurrentUrl();
          const url = URL.createObjectURL(blob);
          this.currentObjectUrl = url;
          this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        },
      });
  }

  onMovementsPdf(filters: MovementsPdfFilters): void {
    this.activeModal.set(null);
    this.loadingPdf.set(true);
    this.pdfTitle.set('Historial de Movimientos');
    this.pdfViewerVisible.set(true);
    this.movementsPdfApi
      .getPdf(filters)
      .pipe(finalize(() => this.loadingPdf.set(false)))
      .subscribe({
        next: (blob) => {
          this.revokeCurrentUrl();
          const url = URL.createObjectURL(blob);
          this.currentObjectUrl = url;
          this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        },
      });
  }

  onStockExcel(filters: StockPdfFilters): void {
    this.activeModal.set(null);
    this.stockExcelApi.getExcel(filters).subscribe({
      next: (blob) => {
        FileDownloadHelper.downloadFromBlob(blob, 'stock-almacenes.xlsx');
      },
    });
  }

  onMovementsExcel(filters: MovementsPdfFilters): void {
    this.activeModal.set(null);
    this.movementsExcelApi.getExcel(filters).subscribe({
      next: (blob) => {
        FileDownloadHelper.downloadFromBlob(blob, 'historial-movimientos.xlsx');
      },
    });
  }

  onOrdersPdf(filters: OrdersPdfFilters): void {
    this.activeModal.set(null);
    this.loadingPdf.set(true);
    this.pdfTitle.set('Reporte de Pedidos');
    this.pdfViewerVisible.set(true);
    this.orderPdfApi
      .downloadOrdersReportPdf(filters)
      .pipe(finalize(() => this.loadingPdf.set(false)))
      .subscribe({
        next: (blob) => {
          this.revokeCurrentUrl();
          const url = URL.createObjectURL(blob);
          this.currentObjectUrl = url;
          this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        },
      });
  }

  onInvoicesPdf(filters: InvoicesPdfFilters): void {
    this.activeModal.set(null);
    this.loadingPdf.set(true);
    this.pdfTitle.set('Reporte de Facturas');
    this.pdfViewerVisible.set(true);
    this.invoicePdfApi
      .downloadInvoicesReportPdf(filters)
      .pipe(finalize(() => this.loadingPdf.set(false)))
      .subscribe({
        next: (blob) => {
          this.revokeCurrentUrl();
          const url = URL.createObjectURL(blob);
          this.currentObjectUrl = url;
          this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        },
      });
  }

  onQuotesPdf(filters: QuotesPdfFilters): void {
    this.activeModal.set(null);
    this.loadingPdf.set(true);
    this.pdfTitle.set('Reporte de Presupuestos');
    this.pdfViewerVisible.set(true);
    this.quotePdfApi
      .downloadQuotesReportPdf(filters)
      .pipe(finalize(() => this.loadingPdf.set(false)))
      .subscribe({
        next: (blob) => {
          this.revokeCurrentUrl();
          const url = URL.createObjectURL(blob);
          this.currentObjectUrl = url;
          this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        },
      });
  }

  onPurchasesPdf(filters: PurchasesPdfFilters): void {
    this.activeModal.set(null);
    this.loadingPdf.set(true);
    this.pdfTitle.set('Reporte de Compras');
    this.pdfViewerVisible.set(true);
    this.purchasePdfApi
      .downloadPurchasesReportPdf(filters)
      .pipe(finalize(() => this.loadingPdf.set(false)))
      .subscribe({
        next: (blob) => {
          this.revokeCurrentUrl();
          const url = URL.createObjectURL(blob);
          this.currentObjectUrl = url;
          this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        },
      });
  }

  onAccountsReceivablePdf(filters: AccountsReceivableFilters): void {
    this.activeModal.set(null);
    this.loadingPdf.set(true);
    this.pdfTitle.set('Cuentas por Cobrar');
    this.pdfViewerVisible.set(true);
    this.financePdfApi
      .getAccountsReceivablePdf(filters)
      .pipe(finalize(() => this.loadingPdf.set(false)))
      .subscribe({
        next: (blob) => {
          this.revokeCurrentUrl();
          const url = URL.createObjectURL(blob);
          this.currentObjectUrl = url;
          this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        },
      });
  }

  onCashRegisterReport(filters: CashRegisterReportFilters): void {
    this.activeModal.set(null);
    const baseName = `caja-${filters.dateFrom}-${filters.dateTo}-${filters.type.toLowerCase()}`;
    if (filters.format === 'PDF') {
      this.loadingPdf.set(true);
      this.pdfTitle.set('Reporte de Caja');
      this.pdfViewerVisible.set(true);
    }
    this.cashRegisterApi
      .exportReport(filters)
      .pipe(finalize(() => this.loadingPdf.set(false)))
      .subscribe({
        next: (blob) => {
          if (filters.format === 'EXCEL') {
            FileDownloadHelper.downloadFromBlob(blob, `${baseName}.xlsx`);
            return;
          }
          this.revokeCurrentUrl();
          const url = URL.createObjectURL(blob);
          this.currentObjectUrl = url;
          this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        },
      });
  }

  closePdfViewer(): void {
    this.pdfViewerVisible.set(false);
    this.revokeCurrentUrl();
    this.pdfUrl.set(null);
  }

  private revokeCurrentUrl(): void {
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }
  }

  toggleUserMenu(event: Event): void {
    if (this.userMenu) {
      this.userMenu.toggle(event);
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/analytics/dashboard']);
  }

  goToSecurity(): void {
    this.userMenu?.hide();
    void this.router.navigate(['/platform/auth/security']);
  }

  goToConfiguration(): void {
    this.router.navigate(['/platform/auth/configuration']);
    this.userMenu?.hide();
  }

  logout(): void {
    this.authService.clearAuthState();
    this.router.navigate(['/platform/auth/login']);
    this.userMenu?.hide();
  }

  toggleMobileMenu(): void {
    this.mobileMenuVisible.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuVisible.set(false);
    document.body.classList.remove('p-overflow-hidden');
    const masks = document.querySelectorAll('.p-drawer-mask');
    masks.forEach((mask) => mask.remove());
  }

  private checkScreenSize(): void {
    this.isMobile.set(window.innerWidth < 1024);
  }

  private convertToMobileMenuItem(item: MenuItem): PrimeMenuItem {
    const primeItem: PrimeMenuItem = {
      label: item.label,
      icon: item.icon,
      visible: item.visible ?? true,
      badge: item.badge,
      separator: item.separator,
      expanded: false,
    };

    if (item.routerLink) {
      primeItem.command = () => {
        this.mobileMenuVisible.set(false);
        document.body.classList.remove('p-overflow-hidden');
        const masks = document.querySelectorAll('.p-drawer-mask');
        masks.forEach((mask) => mask.remove());
        this.router.navigate([item.routerLink]);
      };
    } else if (item.command) {
      const originalCommand = item.command;
      primeItem.command = () => {
        this.mobileMenuVisible.set(false);
        document.body.classList.remove('p-overflow-hidden');
        const masks = document.querySelectorAll('.p-drawer-mask');
        masks.forEach((mask) => mask.remove());
        originalCommand();
      };
    }

    if (item.children) {
      primeItem.items = item.children.map((child) => this.convertToMobileMenuItem(child));
    }

    return primeItem;
  }
}
