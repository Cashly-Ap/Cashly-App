import { TestBed } from '@angular/core/testing';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NavigationHistoryService } from './navigation-history.service';

describe('NavigationHistoryService', () => {
  let events: Subject<NavigationStart | NavigationEnd>;
  let router: {
    url: string;
    events: Subject<NavigationStart | NavigationEnd>;
    navigate: ReturnType<typeof vi.fn>;
    navigateByUrl: ReturnType<typeof vi.fn>;
  };
  let history: NavigationHistoryService;
  function visit(url: string, popstate = false) {
    events.next(new NavigationStart(1, url, popstate ? 'popstate' : 'imperative'));
    router.url = url;
    events.next(new NavigationEnd(1, url, url));
  }
  beforeEach(() => {
    TestBed.resetTestingModule();
    events = new Subject();
    router = {
      url: '/analytics/dashboard',
      events,
      navigate: vi.fn(),
      navigateByUrl: vi.fn().mockResolvedValue(true),
    };
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: router }] });
    history = TestBed.inject(NavigationHistoryService);
  });
  it('returns to the actual origin including its filters instead of the module list', () => {
    visit('/catalog/products?search=tools');
    visit('/partners/customers/customer-1/balance');
    history.back(['/partners/customers']);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/catalog/products?search=tools', {
      replaceUrl: true,
    });
  });
  it('skips the internal lookup and request cleanup before a navbar edit', () => {
    visit('/sales/orders?navAction=Editar&navRecord=order-1');
    visit('/sales/orders');
    visit('/sales/orders/order-1/edit');
    history.back(['/sales/orders']);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/analytics/dashboard', { replaceUrl: true });
  });
  it('can return from an action that leaves its destination list visible', () => {
    visit('/sales/orders?navAction=Confirmar');
    visit('/sales/orders');
    history.back();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/analytics/dashboard', { replaceUrl: true });
  });
  it('consumes return history without bouncing between the same pages', () => {
    visit('/catalog/products');
    visit('/catalog/products/product-1');
    history.back();
    visit('/catalog/products');
    history.back();
    expect(router.navigateByUrl).toHaveBeenLastCalledWith('/analytics/dashboard', {
      replaceUrl: true,
    });
  });
  it('keeps browser back navigation aligned with the application history', () => {
    visit('/catalog/products');
    visit('/catalog/products/product-1');
    visit('/catalog/products', true);
    history.back();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/analytics/dashboard', { replaceUrl: true });
  });
  it('uses a safe fallback only when entered directly without an origin', () => {
    TestBed.resetTestingModule();
    router.url = '/catalog/products/product-1/edit';
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: router }] });
    TestBed.inject(NavigationHistoryService).back(['/catalog/products']);
    expect(router.navigate).toHaveBeenCalledWith(['/catalog/products']);
  });
});
