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
import { Router, RouterLink, RouterModule, NavigationStart } from '@angular/router';
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
import { AuthService } from '@features/auth/services';
import { UserType } from '@features/auth/models';
import { ThemeToggleComponent } from '@core/theme/components';
import { PendingTabsDropdownComponent } from '@core/pending-tabs/components';
import { CatalogPdfModalComponent } from '@features/reports/inventory/components/catalog-pdf-modal';
import { StockPdfModalComponent } from '@features/reports/inventory/components/stock-pdf-modal';
import { MovementsPdfModalComponent } from '@features/reports/inventory/components/movements-pdf-modal';
import { PdfViewerModalComponent } from '@features/reports/inventory/components/pdf-viewer-modal';
import { CatalogPdfApiService } from '@features/reports/inventory/services/api/catalog-pdf-api.service';
import { StockPdfApiService } from '@features/reports/inventory/services/api/stock-pdf-api.service';
import { StockExcelApiService } from '@features/reports/inventory/services/api/stock-excel-api.service';
import { MovementsPdfApiService } from '@features/reports/inventory/services/api/movements-pdf-api.service';
import { MovementsExcelApiService } from '@features/reports/inventory/services/api/movements-excel-api.service';
import { CatalogPdfFilters, StockPdfFilters, MovementsPdfFilters } from '@features/reports/inventory/models/interfaces';
import { OrderPdfModalComponent } from '@features/reports/orders/components/order-pdf-modal/order-pdf-modal.component';
import { OrderPdfApiService, OrdersPdfFilters } from '@features/reports/orders/services/api/order-pdf-api.service';
import { InvoicePdfModalComponent } from '@features/reports/invoices/components/invoice-pdf-modal/invoice-pdf-modal.component';
import { InvoicePdfApiService, InvoicesPdfFilters } from '@features/reports/invoices/services/api/invoice-pdf-api.service';
import { QuotePdfModalComponent } from '@features/reports/quotes/components/quote-pdf-modal/quote-pdf-modal.component';
import { QuotePdfApiService, QuotesPdfFilters } from '@features/reports/quotes/services/api/quote-pdf-api.service';
import { fromEvent, Subscription, filter } from 'rxjs';
import { FileDownloadHelper } from '@shared/utils/file-download.helper';
export type ContentMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full' | 'none';

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
    RouterLink,
    RouterModule,
    ThemeToggleComponent,
    Popover,
    PendingTabsDropdownComponent,
    DrawerModule,
    PanelMenuModule,
    CatalogPdfModalComponent,
    StockPdfModalComponent,
    MovementsPdfModalComponent,
    PdfViewerModalComponent,
    OrderPdfModalComponent,
    InvoicePdfModalComponent,
    QuotePdfModalComponent,
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
  private stockPdfApi = inject(StockPdfApiService);
  private stockExcelApi = inject(StockExcelApiService);
  private movementsPdfApi = inject(MovementsPdfApiService);
  private movementsExcelApi = inject(MovementsExcelApiService);
  private orderPdfApi = inject(OrderPdfApiService);
  private invoicePdfApi = inject(InvoicePdfApiService);
  private quotePdfApi = inject(QuotePdfApiService);
  private scrollSubscription?: Subscription;
  private routerSubscription?: Subscription;
  private currentObjectUrl: string | null = null;

  maxWidth = input<ContentMaxWidth>('7xl');

  currentUser = this.authService.currentUser;

  logoSrc = '/Parsun.png';

  readonly activeModal = signal<'catalog' | 'stock' | 'movements' | 'orders' | 'invoices' | 'quotes' | null>(null);
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
      openStockModal: () => this.activeModal.set('stock'),
      openMovementsModal: () => this.activeModal.set('movements'),
      openOrdersPdfModal: () => this.activeModal.set('orders'),
      openInvoicesPdfModal: () => this.activeModal.set('invoices'),
      openQuotesPdfModal: () => this.activeModal.set('quotes'),
    };
    return this.filterMenuByRole(buildMenuItems(callbacks), role);
  }

  private filterMenuByRole(items: MenuItem[], userType: UserType): MenuItem[] {
    return items
      .filter((item) => {
        if (item.allowedRoles && !item.allowedRoles.includes(userType)) return false;
        if (item.requiredModule && !this.authService.hasModulePermission(item.requiredModule)) return false;
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
      });
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
    this.pdfTitle.set('Catálogo de Productos');
    this.pdfViewerVisible.set(true);
    this.catalogPdfApi.downloadPdf(filters).pipe(
      finalize(() => this.loadingPdf.set(false))
    ).subscribe({
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
    this.stockPdfApi.getPdf(filters).pipe(
      finalize(() => this.loadingPdf.set(false))
    ).subscribe({
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
    this.movementsPdfApi.getPdf(filters).pipe(
      finalize(() => this.loadingPdf.set(false))
    ).subscribe({
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
    this.orderPdfApi.downloadOrdersReportPdf(filters).pipe(
      finalize(() => this.loadingPdf.set(false))
    ).subscribe({
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
    this.invoicePdfApi.downloadInvoicesReportPdf(filters).pipe(
      finalize(() => this.loadingPdf.set(false))
    ).subscribe({
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
    this.quotePdfApi.downloadQuotesReportPdf(filters).pipe(
      finalize(() => this.loadingPdf.set(false))
    ).subscribe({
      next: (blob) => {
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
    this.router.navigate(['/dashboard']);
  }

  goToConfiguration(): void {
    this.router.navigate(['/auth/configuration']);
    this.userMenu?.hide();
  }

  logout(): void {
    this.authService.clearAuthState();
    this.router.navigate(['/auth/login']);
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
