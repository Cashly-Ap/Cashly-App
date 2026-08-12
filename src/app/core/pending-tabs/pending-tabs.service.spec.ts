import { TestBed } from '@angular/core/testing';
import { PendingTabsService } from '@core/pending-tabs/pending-tabs.service';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { PENDING_TABS_STORAGE_KEY } from '@core/pending-tabs/constants';

describe('PendingTabsService', () => {
  let service: PendingTabsService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [PendingTabsService],
    });

    service = TestBed.inject(PendingTabsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load tabs from storage on initialization', () => {
    const storedTabs = [
      {
        id: '1',
        title: 'Stored Tab',
        route: '/test',
        formData: {},
        type: 'create' as const,
        module: 'customers',
        timestamp: Date.now(),
      },
    ];
    localStorage.setItem(PENDING_TABS_STORAGE_KEY, JSON.stringify(storedTabs));

    const newService = new PendingTabsService();

    expect(newService.allTabs()).toHaveLength(1);
    expect(newService.allTabs()[0].title).toBe('Stored Tab');
  });

  describe('computed signals', () => {
    it('should have correct tabCount', () => {
      expect(service.tabCount()).toBe(0);

      service.save('1', 'Test Tab', '/test', {}, 'create', 'customers');

      expect(service.tabCount()).toBe(1);
    });

    it('should have correct hasTabs', () => {
      expect(service.hasTabs()).toBe(false);

      service.save('1', 'Test Tab', '/test', {}, 'create', 'customers');

      expect(service.hasTabs()).toBe(true);
    });
  });

  describe('save', () => {
    it('should add a new tab', () => {
      service.save('1', 'Test Tab', '/test', {}, 'create', 'customers');

      expect(service.allTabs()).toHaveLength(1);
      expect(service.allTabs()[0].id).toBe('1');
    });

    it('should persist to localStorage', () => {
      service.save('1', 'Test Tab', '/test', {}, 'create', 'customers');

      const stored = localStorage.getItem(PENDING_TABS_STORAGE_KEY);
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toHaveLength(1);
    });

    it('should update existing tab with same id', () => {
      service.save('1', 'Test Tab', '/test', { name: 'Old' }, 'create', 'customers');
      service.save('1', 'Test Tab Updated', '/test', { name: 'New' }, 'create', 'customers');

      expect(service.allTabs()).toHaveLength(1);
      expect(service.allTabs()[0].title).toBe('Test Tab Updated');
    });

    it('should update timestamp when updating existing tab', () => {
      service.save('1', 'Test Tab', '/test', {}, 'create', 'customers');
      const originalTimestamp = service.allTabs()[0].timestamp;

      vi.spyOn(Date, 'now').mockReturnValue(originalTimestamp + 1000);

      service.save('1', 'Test Tab', '/test', {}, 'create', 'customers');

      expect(service.allTabs()[0].timestamp).toBeGreaterThan(originalTimestamp);
    });

    it('should store route as string', () => {
      service.save('1', 'Test Tab', '/test?foo=bar', {}, 'create', 'customers');

      expect(service.allTabs()[0].route).toBe('/test?foo=bar');
    });
  });

  describe('remove', () => {
    it('should remove a tab by id', () => {
      service.save('1', 'Test Tab', '/test', {}, 'create', 'customers');

      expect(service.allTabs()).toHaveLength(1);

      service.remove('1');

      expect(service.allTabs()).toHaveLength(0);
    });

    it('should persist after removal', () => {
      service.save('1', 'Test Tab', '/test', {}, 'create', 'customers');
      service.remove('1');

      const stored = localStorage.getItem(PENDING_TABS_STORAGE_KEY);
      expect(JSON.parse(stored!)).toHaveLength(0);
    });

    it('should do nothing if tab id does not exist', () => {
      service.save('1', 'Test Tab', '/test', {}, 'create', 'customers');

      service.remove('non-existent');

      expect(service.allTabs()).toHaveLength(1);
    });
  });

  describe('removeAll', () => {
    it('should remove all tabs', () => {
      service.save('1', 'Test Tab 1', '/test1', {}, 'create', 'customers');
      service.save('2', 'Test Tab 2', '/test2', {}, 'edit', 'customers');

      expect(service.allTabs()).toHaveLength(2);

      service.removeAll();

      expect(service.allTabs()).toHaveLength(0);
    });

    it('should persist after clearing', () => {
      service.save('1', 'Test Tab', '/test', {}, 'create', 'customers');
      service.removeAll();

      const stored = localStorage.getItem(PENDING_TABS_STORAGE_KEY);
      expect(JSON.parse(stored!)).toHaveLength(0);
    });
  });

  describe('get', () => {
    it('should return a tab by id', () => {
      service.save('1', 'Test Tab', '/test', { name: 'John' }, 'create', 'customers');

      const result = service.get('1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
      expect(result?.formData).toEqual({ name: 'John' });
    });

    it('should return undefined if tab does not exist', () => {
      const result = service.get('non-existent');

      expect(result).toBeUndefined();
    });

    it('should return typed formData', () => {
      interface TestFormData {
        name: string;
        age: number;
      }

      service.save('1', 'Test Tab', '/test', { name: 'John', age: 30 }, 'create', 'customers');

      const result = service.get<TestFormData>('1');

      expect(result?.formData.name).toBe('John');
      expect(result?.formData.age).toBe(30);
    });
  });

  describe('has', () => {
    it('should return true if tab exists', () => {
      service.save('1', 'Test Tab', '/test', {}, 'create', 'customers');

      expect(service.has('1')).toBe(true);
    });

    it('should return false if tab does not exist', () => {
      expect(service.has('non-existent')).toBe(false);
    });
  });

  describe('getByModule', () => {
    it('should return tabs filtered by module', () => {
      service.save('1', 'Customer Tab', '/customers/1', {}, 'create', 'customers');
      service.save('2', 'Another Customer Tab', '/customers/2', {}, 'edit', 'customers');
      service.save('3', 'Warehouse Tab', '/warehouses/3', {}, 'create', 'warehouses');

      const customerTabs = service.getByModule('customers');

      expect(customerTabs).toHaveLength(2);
      expect(customerTabs.every((tab) => tab.module === 'customers')).toBe(true);
    });

    it('should return empty array if no tabs match module', () => {
      service.save('1', 'Customer Tab', '/customers/1', {}, 'create', 'customers');

      const result = service.getByModule('other-module');

      expect(result).toHaveLength(0);
    });
  });

  describe('storage error handling', () => {
    it('should handle localStorage parse errors gracefully', () => {
      localStorage.setItem(PENDING_TABS_STORAGE_KEY, 'invalid json');

      const newService = new PendingTabsService();

      expect(newService.allTabs()).toHaveLength(0);
    });
  });
});
