import { TranslationService } from '@core/i18n/translation.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { NavigationLookupService } from '@core/layouts/services/navigation-lookup.service';
import { ListNavigationPickerComponent } from '@shared/components/list/list-navigation-picker/list-navigation-picker.component';
import { ShortcutHelpComponent } from '@core/shortcuts/shortcut-help.component';
import { ModuleNavigatorComponent } from '@core/shortcuts/module-navigator.component';
import { KeyboardShortcutService } from '@core/shortcuts/keyboard-shortcut.service';
import { DestroyRef } from '@angular/core';
import { ModuleGroup, moduleGroupFromUrl } from '@core/preferences/module-appearance';
import { effect, untracked } from '@angular/core';
import { CompanyService } from '@features/platform/company/company.service';
import { CompanyPermission } from '@features/platform/company/permissions';
import { UserAvatarComponent } from '@shared/components/ui/user-avatar/user-avatar.component';
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
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MenuItem as PrimeMenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { Ripple } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { Popover } from 'primeng/popover';
import { DrawerModule, Drawer } from 'primeng/drawer';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from '@core/layouts/models';
import { buildMenuItems } from '@core/layouts/config';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { ReportActionService } from '@shared/services/report-action.service';
import { CustomerPickerActionService } from '@features/sales/orders/services/customer-picker-action.service';
import { ReportActionHostComponent } from '@core/layouts/components/report-action-host/report-action-host.component';
import { PdfBlobViewerHostComponent } from '@core/layouts/components/pdf-blob-viewer-host/pdf-blob-viewer-host.component';
import { UserType } from '@features/platform/auth/models/interfaces/user.interface';
import { PendingTabsDropdownComponent } from '@core/pending-tabs/components';
import { NotificationBellComponent } from '@features/platform/notifications/components/notification-bell/notification-bell.component';
import { NotificationPreferencesService } from '@features/platform/notifications/services/state/notification-preferences.service';
import { fromEvent, Subscription, filter } from 'rxjs';
import { ActionDialogHostComponent } from '@core/layouts/components/action-dialog-host/action-dialog-host.component';
import { GlobalDialogHostComponent } from '@core/layouts/components/global-dialog-host/global-dialog-host.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DeleteDialogComponent } from '@shared/components/delete-dialog/delete-dialog.component';
import { CancelDialogComponent } from '@shared/components/cancel-dialog/cancel-dialog.component';
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
    TranslatePipe,
    ListNavigationPickerComponent,
    ShortcutHelpComponent,
    CommonModule,
    ModuleNavigatorComponent,
    UserAvatarComponent,
    NgOptimizedImage,
    ButtonModule,
    ToastModule,
    MenubarModule,
    Ripple,
    AvatarModule,
    RouterOutlet,
    Popover,
    PendingTabsDropdownComponent,
    NotificationBellComponent,
    DrawerModule,
    PanelMenuModule,
    ActionDialogHostComponent,
    GlobalDialogHostComponent,
    ReportActionHostComponent,
    PdfBlobViewerHostComponent,
    ConfirmDialogModule,
    DeleteDialogComponent,
    CancelDialogComponent,
  ],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private readonly translations = inject(TranslationService);
  @ViewChild(ModuleNavigatorComponent) moduleNavigator?: ModuleNavigatorComponent;
  readonly navigationMenuItems = computed(() =>
    this.buildMenuItems((this.currentUser()?.role || this.currentUser()?.type) as UserType),
  );
  private readonly keyboardShortcuts = inject(KeyboardShortcutService);
  @ViewChild('userMenu') userMenu!: Popover;
  @ViewChild('mobileDrawer') mobileDrawer!: Drawer;

  mobileMenuVisible = signal(false);
  isMobile = signal(false);

  private authService = inject(AuthService);
  readonly notificationPreferences = inject(NotificationPreferencesService);
  private router = inject(Router);
  private readonly navigationLookup = inject(NavigationLookupService);
  private readonly reportActions = inject(ReportActionService);
  private readonly customerPicker = inject(CustomerPickerActionService);
  readonly activeModule = signal(moduleGroupFromUrl(this.router.url));
  private scrollSubscription?: Subscription;
  private routerSubscription?: Subscription;

  maxWidth = input<ContentMaxWidth>('7xl');

  currentUser = this.authService.currentUser;

  logoSrc = '/cashly-logo.svg';
  readonly companyService = inject(CompanyService);
  readonly companyName = computed(
    () =>
      this.companyService.company()?.tradeName ||
      this.companyService.company()?.legalName ||
      'Cashly',
  );
  private readonly brandingUserId = computed(() => this.currentUser()?.id);
  constructor() {
    const unregisterNavigation = this.keyboardShortcuts.registerNavigation(() =>
      this.moduleNavigator?.open(),
    );
    inject(DestroyRef).onDestroy(unregisterNavigation);
    effect((onCleanup) => {
      const userId = this.brandingUserId();
      const canViewCompany = this.authService.hasPermissionCode(CompanyPermission.VIEW);
      untracked(() => this.companyService.clear());
      if (!userId || !canViewCompany) return;
      const subscription = untracked(() =>
        this.companyService.load().subscribe({ error: () => undefined }),
      );
      onCleanup(() => {
        subscription.unsubscribe();
        untracked(() => this.companyService.clear());
      });
    });
  }
  primeMenuItems = computed<PrimeMenuItem[]>(() => {
    const userType = this.authService.currentUser()?.type as UserType;
    return this.buildMenuItems(userType).map((item) =>
      this.convertMenuItem(item, this.menuGroup(item)),
    );
  });

  mobileMenuItems = computed<PrimeMenuItem[]>(() => {
    const userType = this.authService.currentUser()?.type as UserType;
    return this.buildMenuItems(userType).map((item) =>
      this.convertToMobileMenuItem(item, this.menuGroup(item)),
    );
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
      .subscribe((event) => {
        this.activeModule.set(moduleGroupFromUrl((event as NavigationStart).url));
        this.closeMobileMenu();
      });
  }

  ngOnDestroy(): void {
    this.scrollSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  private buildMenuItems(userType: UserType): MenuItem[] {
    const user = this.authService.currentUser();
    const role = (user?.role || user?.type) as UserType;
    const callbacks = {
      openListAction: (route: string, action: string, queryParams?: Record<string, string>) => {
        this.navigationLookup.open(route, action, queryParams);
      },
      openCustomerEditPicker: () => this.customerPicker.open('edit'),
      openCustomerBalancePicker: () => this.customerPicker.open('balance'),
      openCatalogModal: () => this.reportActions.open('catalog'),
      openCommercialCatalogModal: () => this.reportActions.open('commercialCatalog'),
      openStockModal: () => this.reportActions.open('stock'),
      openMovementsModal: () => this.reportActions.open('movements'),
      openOrdersPdfModal: () => this.reportActions.open('orders'),
      openInvoicesPdfModal: () => this.reportActions.open('invoices'),
      openQuotesPdfModal: () => this.reportActions.open('quotes'),
      openPurchasesPdfModal: () => this.reportActions.open('purchases'),
      openAccountsReceivablePdfModal: () => this.reportActions.open('accountsReceivable'),
      openCashRegisterModal: () => this.reportActions.open('cashRegister'),
    };
    return this.filterMenuByRole(buildMenuItems(callbacks), role);
  }

  private filterMenuByRole(items: MenuItem[], userType: UserType): MenuItem[] {
    return items
      .filter((item) => {
        if (item.requiredPermission && !this.authService.hasPermissionCode(item.requiredPermission))
          return false;
        if (
          item.requiredModule &&
          !this.authService.hasPermission(item.requiredModule, item.requiredAction ?? 'READ')
        )
          return false;
        if (
          (item.requiredPermissions ?? []).some((grant) => {
            const [module, action] = grant.split(':');
            return !this.authService.hasPermission(
              module as BusinessModule,
              action as import('@features/platform/auth/authorization/models/access.model').PermissionAction,
            );
          })
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

  private menuGroup(item: MenuItem): ModuleGroup {
    if (item.routerLink) return moduleGroupFromUrl(item.routerLink);
    const descendant = item.children?.find((child) => child.routerLink || child.children?.length);
    return descendant ? this.menuGroup(descendant) : 'platform';
  }

  private convertMenuItem(
    item: MenuItem,
    group: ModuleGroup = this.menuGroup(item),
  ): PrimeMenuItem {
    const primeItem: PrimeMenuItem = {
      styleClass: `cashly-module-${group}`,
      label: this.translations.t(item.label),
      icon: item.icon,
      routerLink: item.routerLink,
      visible: item.visible ?? true,
      badge: item.badge,
      separator: item.separator,
      command: item.command,
    };

    if (item.children) {
      primeItem.items = item.children.map((child) => this.convertMenuItem(child, group));
    }

    return primeItem;
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
    this.router.navigate(['/platform/auth/security']);
  }

  goToPreferences(): void {
    this.userMenu?.hide();
    this.closeMobileMenu();
    void this.router.navigate(['/platform/auth/preferences']);
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

  private convertToMobileMenuItem(
    item: MenuItem,
    group: ModuleGroup = this.menuGroup(item),
  ): PrimeMenuItem {
    const primeItem: PrimeMenuItem = {
      styleClass: `cashly-module-${group}`,
      label: this.translations.t(item.label),
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
      primeItem.items = item.children.map((child) => this.convertToMobileMenuItem(child, group));
    }

    return primeItem;
  }
}
