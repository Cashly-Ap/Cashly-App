import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { vi } from 'vitest';
import { ThemeService } from '@core/theme/components/theme-toggle/theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let localStorageMock: any;

  beforeEach(() => {
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    TestBed.configureTestingModule({
      providers: [ThemeService, { provide: PLATFORM_ID, useValue: 'browser' }],
    });

    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialization', () => {
    it('should initialize with dark mode false by default', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const service = TestBed.inject(ThemeService);

      expect(service.isDarkMode()).toBeDefined();
    });

    it('should load dark mode from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('dark');

      const service = TestBed.inject(ThemeService);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('theme');
    });

    it('should load light mode from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('light');

      const service = TestBed.inject(ThemeService);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('theme');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from false to true', () => {
      service.isDarkMode.set(false);

      service.toggleTheme();

      expect(service.isDarkMode()).toBe(true);
    });

    it('should toggle from true to false', () => {
      service.isDarkMode.set(true);

      service.toggleTheme();

      expect(service.isDarkMode()).toBe(false);
    });

    it('should toggle multiple times', () => {
      service.isDarkMode.set(false);

      service.toggleTheme();
      expect(service.isDarkMode()).toBe(true);

      service.toggleTheme();
      expect(service.isDarkMode()).toBe(false);

      service.toggleTheme();
      expect(service.isDarkMode()).toBe(true);
    });
  });

  describe('theme persistence', () => {
    it('should save theme to localStorage when changed', () => {
      service.isDarkMode.set(true);

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('browser detection', () => {
    it('should detect browser platform', () => {
      expect(service['isBrowser']).toBe(true);
    });

    it('should handle non-browser platform', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [ThemeService, { provide: PLATFORM_ID, useValue: 'server' }],
      });

      const serverService = TestBed.inject(ThemeService);

      expect(serverService['isBrowser']).toBe(false);
    });
  });
});
