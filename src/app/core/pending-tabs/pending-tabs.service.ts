import { Injectable, signal, computed } from '@angular/core';
import { PendingTab } from '@core/pending-tabs/models';
import { PENDING_TABS_STORAGE_KEY } from '@core/pending-tabs/constants';

@Injectable({ providedIn: 'root' })
export class PendingTabsService {
  private tabs = signal<PendingTab[]>([]);

  readonly allTabs = this.tabs.asReadonly();
  readonly tabCount = computed(() => this.tabs().length);
  readonly hasTabs = computed(() => this.tabs().length > 0);

  constructor() {
    this.loadFromStorage();
  }

  save<T>(
    id: string,
    title: string,
    route: string,
    formData: T,
    type: 'create' | 'edit',
    module: string,
  ): void {
    const tab: PendingTab<T> = {
      id,
      title,
      route,
      formData,
      type,
      module,
      timestamp: Date.now(),
    };

    const existingIndex = this.tabs().findIndex((t) => t.id === id);

    if (existingIndex !== -1) {
      this.tabs.update((tabs) => tabs.map((t, i) => (i === existingIndex ? tab : t)));
    } else {
      this.tabs.update((tabs) => [...tabs, tab]);
    }

    this.persist();
  }

  remove(tabId: string): void {
    this.tabs.update((tabs) => tabs.filter((t) => t.id !== tabId));
    this.persist();
  }

  removeAll(): void {
    this.tabs.set([]);
    this.persist();
  }

  get<T>(tabId: string): PendingTab<T> | undefined {
    return this.tabs().find((t) => t.id === tabId) as PendingTab<T> | undefined;
  }

  has(tabId: string): boolean {
    return this.tabs().some((t) => t.id === tabId);
  }

  getByModule(module: string): PendingTab[] {
    return this.tabs().filter((t) => t.module === module);
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(PENDING_TABS_STORAGE_KEY);
      if (stored) {
        this.tabs.set(JSON.parse(stored));
      }
    } catch {
      this.tabs.set([]);
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(PENDING_TABS_STORAGE_KEY, JSON.stringify(this.tabs()));
    } catch {
      console.error('Error saving pending tabs to storage');
    }
  }
}
