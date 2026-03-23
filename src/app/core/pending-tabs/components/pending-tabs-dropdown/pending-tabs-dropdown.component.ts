import {
  Component,
  ViewChild,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { PendingTabsService } from '@core/pending-tabs/pending-tabs.service';
import { PendingTab } from '@core/pending-tabs/models';
import { MODULE_LABELS } from '@core/pending-tabs/constants';
import { fromEvent, interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-pending-tabs-dropdown',
  standalone: true,
  imports: [CommonModule, ButtonModule, Popover, TooltipModule],
  templateUrl: './pending-tabs-dropdown.component.html',
})
export class PendingTabsDropdownComponent implements OnInit, OnDestroy {
  @ViewChild('tabsMenu') tabsMenu!: Popover;

  private pendingTabsService = inject(PendingTabsService);
  private router = inject(Router);
  private subscriptions = new Subscription();

  private now = signal(Date.now());

  tabs = this.pendingTabsService.allTabs;
  pendingTabsCount = this.pendingTabsService.tabCount;

  tabsWithTime = computed(() =>
    this.tabs().map((tab) => ({
      ...tab,
      timeLabel: this.computeTimeLabel(tab.timestamp, this.now()),
    })),
  );

  private computeTimeLabel(timestamp: number, now: number): string {
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    return `Hace ${days} días`;
  }

  formatTimestamp(timestamp: number): string {
    return this.computeTimeLabel(timestamp, Date.now());
  }

  ngOnInit(): void {
    this.subscriptions.add(
      fromEvent(window, 'scroll').subscribe(() => {
        if (this.tabsMenu?.overlayVisible) {
          this.tabsMenu.hide();
        }
      }),
    );

    this.subscriptions.add(
      interval(30000).subscribe(() => this.now.set(Date.now())),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleTabsMenu(event: Event): void {
    this.now.set(Date.now());
    this.tabsMenu.toggle(event);
  }

  goToTab(tab: PendingTab): void {
    const currentUrl = this.router.url.split('?')[0];

    if (currentUrl === tab.route.split('?')[0]) {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigateByUrl(tab.route);
      });
    } else {
      this.router.navigateByUrl(tab.route);
    }

    this.tabsMenu.hide();
  }

  removeTab(tabId: string): void {
    this.pendingTabsService.remove(tabId);
  }

  clearAllTabs(): void {
    this.pendingTabsService.removeAll();
    this.tabsMenu.hide();
  }

  getTypeLabel(type: 'create' | 'edit'): string {
    return type === 'create' ? 'Crear' : 'Editar';
  }

  getTypeClass(type: 'create' | 'edit'): string {
    if (type === 'create') {
      return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    }
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
  }

  getModuleLabel(module: string): string {
    return MODULE_LABELS[module] || module;
  }
}
