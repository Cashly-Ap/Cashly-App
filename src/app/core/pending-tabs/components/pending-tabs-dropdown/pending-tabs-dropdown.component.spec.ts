import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PendingTabsDropdownComponent } from '@core/pending-tabs/components/pending-tabs-dropdown/pending-tabs-dropdown.component';
import { PendingTabsService } from '@core/pending-tabs/pending-tabs.service';
import { PendingTab } from '@core/pending-tabs/models';
import { Router } from '@angular/router';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { signal, WritableSignal } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('PendingTabsDropdownComponent', () => {
  let component: PendingTabsDropdownComponent;
  let fixture: ComponentFixture<PendingTabsDropdownComponent>;
  let tabsSignal: WritableSignal<PendingTab[]>;
  let tabCountSignal: WritableSignal<number>;
  let pendingTabsServiceMock: {
    allTabs: WritableSignal<PendingTab[]>;
    tabCount: WritableSignal<number>;
    remove: ReturnType<typeof vi.fn>;
    removeAll: ReturnType<typeof vi.fn>;
  };
  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
    navigateByUrl: ReturnType<typeof vi.fn>;
    url: string;
  };

  let grants: WritableSignal<string[]>;
  const authMock = { hasPermission: vi.fn() };

  const createMockTab = (overrides: Partial<PendingTab> = {}): PendingTab => ({
    id: '1',
    title: 'Test Tab',
    route: '/partners/customers/new?id=1',
    formData: { name: 'Test' },
    type: 'create',
    module: 'customers',
    timestamp: Date.now(),
    ...overrides,
  });

  beforeEach(async () => {
    grants = signal(['SALES:CREATE', 'SALES:UPDATE']);
    authMock.hasPermission.mockImplementation((module, action) =>
      grants().includes(`${module}:${action}`),
    );
    const mockTab = createMockTab();

    tabsSignal = signal<PendingTab[]>([mockTab]);
    tabCountSignal = signal<number>(1);

    pendingTabsServiceMock = {
      allTabs: tabsSignal,
      tabCount: tabCountSignal,
      remove: vi.fn(),
      removeAll: vi.fn(),
    };

    routerMock = {
      navigate: vi.fn().mockResolvedValue(true),
      navigateByUrl: vi.fn().mockResolvedValue(true),
      url: '/analytics/dashboard',
    };

    await TestBed.configureTestingModule({
      imports: [PendingTabsDropdownComponent],
      providers: [
        { provide: PendingTabsService, useValue: pendingTabsServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingTabsDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose tabs from PendingTabsService', () => {
    expect(component.tabs()).toHaveLength(1);
    expect(component.tabs()[0].title).toBe('Test Tab');
  });

  it('should expose pendingTabsCount from PendingTabsService', () => {
    expect(component.pendingTabsCount()).toBe(1);
  });

  describe('role visibility', () => {
    it('hides pending drafts from denied modules', () => {
      tabsSignal.set([
        createMockTab(),
        createMockTab({ id: 'users', route: '/platform/users/new', module: 'users' }),
      ]);
      expect(component.tabs().map((tab) => tab.id)).toEqual(['1']);
    });

    it('counts only visible pending drafts', () => {
      tabCountSignal.set(2);
      tabsSignal.set([
        createMockTab(),
        createMockTab({ id: 'users', route: '/platform/users/new', module: 'users' }),
      ]);
      expect(component.pendingTabsCount()).toBe(1);
    });

    it('does not expose edit drafts to a role allowed only to create', () => {
      grants.set(['SALES:CREATE']);
      tabsSignal.set([
        createMockTab(),
        createMockTab({ id: 'edit', type: 'edit', route: '/partners/customers/record-1/edit' }),
      ]);
      expect(component.tabs().map((tab) => tab.id)).toEqual(['1']);
    });

    it('does not expose create drafts to a role allowed only to update', () => {
      grants.set(['SALES:UPDATE']);
      expect(component.tabs()).toEqual([]);
    });

    it('hides drafts without a recognized route owner', () => {
      tabsSignal.set([createMockTab({ route: '/unknown/new' })]);
      expect(component.tabs()).toEqual([]);
    });

    it('reacts to revoked grants without removing stored drafts', () => {
      component.tabs();
      grants.set([]);
      expect(component.tabs()).toEqual([]);
    });

    it('keeps stored drafts when permissions are revoked', () => {
      grants.set([]);
      component.tabs();
      expect(tabsSignal()).toHaveLength(1);
    });

    it('restores draft visibility when permissions return', () => {
      grants.set([]);
      component.tabs();
      grants.set(['SALES:CREATE']);
      expect(component.tabs()).toHaveLength(1);
    });

    it('rechecks revoked permission before navigation', () => {
      const tab = createMockTab();
      component.tabsMenu = { hide: vi.fn() } as unknown as typeof component.tabsMenu;
      component.tabs();
      grants.set([]);
      component.goToTab(tab);
      expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
    });

    it('checks the route owner instead of trusting the draft module label', () => {
      tabsSignal.set([createMockTab({ route: '/platform/users/new', module: 'customers' })]);
      expect(component.tabs()).toEqual([]);
    });
  });

  describe('goToTab', () => {
    it('should navigate to tab route', async () => {
      const tab = createMockTab({ route: '/partners/customers/create?tabId=123' });
      component.tabsMenu = {
        hide: vi.fn(),
        overlayVisible: false,
      } as unknown as typeof component.tabsMenu;

      component.goToTab(tab);

      await vi.waitFor(() => {
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(
          '/partners/customers/create?tabId=123',
        );
      });
    });

    it('should reload current route if already on the target route', async () => {
      routerMock.url = '/partners/customers/new?id=1';
      const tab = createMockTab({ route: '/partners/customers/new?id=1' });
      component.tabsMenu = {
        hide: vi.fn(),
        overlayVisible: false,
      } as unknown as typeof component.tabsMenu;

      component.goToTab(tab);

      await vi.waitFor(() => {
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/', {
          skipLocationChange: true,
        });
      });
    });

    it('rechecks permission after the asynchronous route reload', async () => {
      const tab = createMockTab();
      routerMock.url = tab.route;
      routerMock.navigateByUrl.mockImplementation(() => {
        grants.set([]);
        return Promise.resolve(true);
      });
      component.tabsMenu = { hide: vi.fn() } as unknown as typeof component.tabsMenu;
      component.goToTab(tab);
      await Promise.resolve();
      expect(routerMock.navigateByUrl).not.toHaveBeenCalledWith(tab.route);
    });

    it('should hide tabs menu after navigation', () => {
      const tab = createMockTab();
      const hideSpy = vi.fn();
      component.tabsMenu = {
        hide: hideSpy,
        overlayVisible: false,
      } as unknown as typeof component.tabsMenu;

      component.goToTab(tab);

      expect(hideSpy).toHaveBeenCalled();
    });
  });

  describe('removeTab', () => {
    it('should call remove on PendingTabsService', () => {
      component.removeTab('1');

      expect(pendingTabsServiceMock.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('clearAllTabs', () => {
    it('should call removeAll on PendingTabsService', () => {
      component.tabsMenu = {
        hide: vi.fn(),
        overlayVisible: false,
      } as unknown as typeof component.tabsMenu;

      component.clearAllTabs();

      expect(pendingTabsServiceMock.removeAll).toHaveBeenCalled();
    });

    it('should hide tabs menu', () => {
      const hideSpy = vi.fn();
      component.tabsMenu = {
        hide: hideSpy,
        overlayVisible: false,
      } as unknown as typeof component.tabsMenu;

      component.clearAllTabs();

      expect(hideSpy).toHaveBeenCalled();
    });
  });

  describe('getTypeLabel', () => {
    it('should return "Crear" for create type', () => {
      expect(component.getTypeLabel('create')).toBe('Crear');
    });

    it('should return "Editar" for edit type', () => {
      expect(component.getTypeLabel('edit')).toBe('Editar');
    });
  });

  describe('getTypeClass', () => {
    it('should return green classes for create type', () => {
      const result = component.getTypeClass('create');
      expect(result).toContain('bg-green');
      expect(result).toContain('text-green');
    });

    it('should return blue classes for edit type', () => {
      const result = component.getTypeClass('edit');
      expect(result).toContain('bg-blue');
      expect(result).toContain('text-blue');
    });
  });

  describe('getModuleLabel', () => {
    it('should return module label from MODULE_LABELS', () => {
      const result = component.getModuleLabel('customers');
      expect(result).toBeTruthy();
    });
  });

  describe('formatTimestamp', () => {
    it('should return "Hace un momento" for recent timestamps', () => {
      const now = Date.now();
      expect(component.formatTimestamp(now)).toBe('Hace un momento');
    });

    it('should return minutes for timestamps less than 1 hour old', () => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      expect(component.formatTimestamp(fiveMinutesAgo)).toBe('Hace 5 min');
    });

    it('should return hours for timestamps less than 24 hours old', () => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      expect(component.formatTimestamp(twoHoursAgo)).toBe('Hace 2 h');
    });

    it('should return days for timestamps 24 hours or older', () => {
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
      expect(component.formatTimestamp(threeDaysAgo)).toBe('Hace 3 días');
    });
  });

  describe('lifecycle hooks', () => {
    it('should subscribe to scroll events on init', () => {
      expect(component['subscriptions']).toBeDefined();
      expect(component['subscriptions'].closed).toBe(false);
    });

    it('should unsubscribe from scroll events on destroy', () => {
      const unsubscribeSpy = vi.spyOn(component['subscriptions'], 'unsubscribe');

      component.ngOnDestroy();

      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });
});
