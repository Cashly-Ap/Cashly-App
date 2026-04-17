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
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router, RouterLink, RouterModule, NavigationStart } from '@angular/router';
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
import { AuthService } from '@features/auth/services';
import { UserType } from '@features/auth/models';
import { ThemeToggleComponent } from '@core/theme/components';
import { PendingTabsDropdownComponent } from '@core/pending-tabs/components';
import { fromEvent, Subscription, filter } from 'rxjs';
export type ContentMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full' | 'none';

@Component({
  selector: 'app-main-layout',
  standalone: true,
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
  private scrollSubscription?: Subscription;
  private routerSubscription?: Subscription;

  maxWidth = input<ContentMaxWidth>('7xl');

  currentUser = this.authService.currentUser;

  logoSrc = '/Parsun.png';

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
  }

  private buildMenuItems(userType: UserType): MenuItem[] {
    const user = this.authService.currentUser();
    const role = (user?.role || user?.type) as UserType;
    return this.filterMenuByRole(buildMenuItems(), role);
  }

  private filterMenuByRole(items: MenuItem[], userType: UserType): MenuItem[] {
    return items
      .filter((item) => {
        if (!item.allowedRoles) {
          return true;
        }
        return item.allowedRoles.includes(userType);
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

