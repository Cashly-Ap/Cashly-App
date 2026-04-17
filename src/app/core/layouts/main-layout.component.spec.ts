import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { MainLayoutComponent } from './main-layout.component';
import { AuthService } from '@features/auth/services';
import { ThemeService } from '@core/theme/components/theme-toggle/theme.service';
import { MessageService } from 'primeng/api';
import { PdfViewerService } from '@core/pdf-viewer/services';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let authServiceMock: {
    currentUser: ReturnType<typeof signal>;
    clearAuthState: ReturnType<typeof vi.fn>;
    getUserType: ReturnType<typeof vi.fn>;
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

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ThemeService, useValue: themeServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: PdfViewerService, useValue: pdfViewerServiceMock },
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
    it('should be a fixed string pointing to Parsun.png', () => {
      expect(component.logoSrc).toBe('/Parsun.png');
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

      expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/configuration']);
      expect(component.userMenu.hide).toHaveBeenCalled();
    });

    it('should logout and navigate to login', () => {
      component.userMenu = { hide: vi.fn() } as unknown as typeof component.userMenu;
      component.logout();

      expect(authServiceMock.clearAuthState).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
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
      component['scrollSubscription'] = { unsubscribe: unsubscribeSpy } as unknown as typeof component['scrollSubscription'];

      component.ngOnDestroy();

      expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('should handle destroy when no subscription exists', () => {
      component['scrollSubscription'] = undefined;

      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});
