import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, RedirectFunction, Router, Routes } from '@angular/router';
import { describe, it, expect } from 'vitest';
import { WAREHOUSE_ROUTES } from '@features/inventory/warehouses/routing/warehouse.routes';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

@Component({ selector: 'app-routing-stub', template: '' })
class RoutingStubComponent {}

const buildNavigableRoutes = (): Routes => {
  const children = WAREHOUSE_ROUTES[0].children ?? [];

  return [
    {
      path: 'inventory',
      children: [
        {
          path: 'warehouses',
          children: children.map((child) =>
            child.redirectTo
              ? { path: child.path, title: child.title, redirectTo: child.redirectTo }
              : { path: child.path, title: child.title, component: RoutingStubComponent },
          ),
        },
      ],
    },
  ];
};

const matchedChildPath = (router: Router): string | undefined =>
  router.routerState.snapshot.root.children[0]?.children[0]?.children[0]?.routeConfig?.path;

describe('WAREHOUSE_ROUTES', () => {
  it('should define routes array', () => {
    expect(Array.isArray(WAREHOUSE_ROUTES)).toBe(true);
  });

  it('should have a parent route with guards', () => {
    const parent = WAREHOUSE_ROUTES[0];
    expect(parent.path).toBe('');
    expect(parent.canActivate).toBeDefined();
    expect(parent.canActivate).toHaveLength(2);
  });

  it('should have INVENTORY module data', () => {
    const parent = WAREHOUSE_ROUTES[0];
    expect(parent.data?.module).toBe(BusinessModule.INVENTORY);
  });

  it('should have 8 child routes', () => {
    const children = WAREHOUSE_ROUTES[0].children;
    expect(children).toHaveLength(8);
  });

  it('should have list route at empty path', () => {
    const listRoute = WAREHOUSE_ROUTES[0].children?.[0];
    expect(listRoute?.path).toBe('');
    expect(listRoute?.title).toBe('Almacenes');
    expect(listRoute?.loadComponent).toBeDefined();
  });

  it('should have new route', () => {
    const newRoute = WAREHOUSE_ROUTES[0].children?.[1];
    expect(newRoute?.path).toBe('new');
    expect(newRoute?.title).toBe('Nuevo Almacén');
    expect(newRoute?.loadComponent).toBeDefined();
  });

  it('should have details route with :id param', () => {
    const detailsRoute = WAREHOUSE_ROUTES[0].children?.find((route) => route.path === ':id');
    expect(detailsRoute?.path).toBe(':id');
    expect(detailsRoute?.title).toBe('Detalles de Almacén');
    expect(detailsRoute?.loadComponent).toBeDefined();
  });

  it('should have edit route with :id/edit param', () => {
    const editRoute = WAREHOUSE_ROUTES[0].children?.find((route) => route.path === ':id/edit');
    expect(editRoute?.path).toBe(':id/edit');
    expect(editRoute?.title).toBe('Editar Almacén');
    expect(editRoute?.loadComponent).toBeDefined();
  });

  it('resolves global stock before the warehouse id route', () => {
    const children = WAREHOUSE_ROUTES[0].children ?? [];
    expect(children.findIndex((route) => route.path === 'stock')).toBeLessThan(
      children.findIndex((route) => route.path === ':id'),
    );
    expect(children.find((route) => route.path === 'stock')?.loadComponent).toBeDefined();
  });

  it('should have dedicated stock and movements routes', () => {
    const children = WAREHOUSE_ROUTES[0].children;
    const legacyMovements = children?.find((route) => route.path === ':id/movements');

    expect(children?.find((route) => route.path === ':id/stock')?.path).toBe(':id/stock');
    expect(typeof children?.find((route) => route.path === ':id/stock')?.redirectTo).toBe(
      'function',
    );
    expect(children?.find((route) => route.path === ':id/stock')?.loadComponent).toBeUndefined();
    expect(legacyMovements?.path).toBe(':id/movements');
    expect(typeof legacyMovements?.redirectTo).toBe('function');
    expect(legacyMovements?.loadComponent).toBeUndefined();
  });

  it('resolves the consolidated movements view before the warehouse id route', () => {
    const children = WAREHOUSE_ROUTES[0].children ?? [];
    const movements = children.find((route) => route.path === 'movements');
    expect(movements?.loadComponent).toBeDefined();
    expect(movements?.title).toBe('Movimientos de Almacén');
    expect(children.findIndex((route) => route.path === 'movements')).toBeLessThan(
      children.findIndex((route) => route.path === ':id'),
    );
  });

  it('opens /inventory/warehouses/movements without requiring a warehouse id', async () => {
    const children = WAREHOUSE_ROUTES[0].children ?? [];
    const movements = children.find((route) => route.path === 'movements');

    expect(movements?.path).toBe('movements');
    expect(movements?.redirectTo).toBeUndefined();
    expect(movements?.loadComponent).toBeDefined();
    const component = await movements?.loadComponent!();
    expect(component.name).toBe('WarehouseMovementsPageComponent');
  });

  it('redirects old warehouse stock links to the single stock screen with its filter', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const redirect = WAREHOUSE_ROUTES[0].children?.find((route) => route.path === ':id/stock')
      ?.redirectTo as RedirectFunction;
    const result = TestBed.runInInjectionContext(() =>
      redirect({
        params: { id: 'wh-001' },
        queryParams: { source: 'warehouse' },
      } as Parameters<RedirectFunction>[0]),
    );
    expect(TestBed.inject(Router).serializeUrl(result as ReturnType<Router['createUrlTree']>)).toBe(
      '/inventory/warehouses/stock?source=warehouse&warehouseId=wh-001',
    );
    TestBed.resetTestingModule();
  });

  it('redirects legacy warehouse movement links to the consolidated view with its filter', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const redirect = WAREHOUSE_ROUTES[0].children?.find((route) => route.path === ':id/movements')
      ?.redirectTo as RedirectFunction;
    const result = TestBed.runInInjectionContext(() =>
      redirect({
        params: { id: 'wh-001' },
        queryParams: { source: 'warehouse' },
      } as Parameters<RedirectFunction>[0]),
    );
    expect(TestBed.inject(Router).serializeUrl(result as ReturnType<Router['createUrlTree']>)).toBe(
      '/inventory/warehouses/movements?source=warehouse&warehouseId=wh-001',
    );
    TestBed.resetTestingModule();
  });

  it('declares the legacy movements redirect before the warehouse id route', () => {
    const children = WAREHOUSE_ROUTES[0].children ?? [];
    expect(children.findIndex((route) => route.path === ':id/movements')).toBeLessThan(
      children.findIndex((route) => route.path === ':id'),
    );
  });

  it('navigates the legacy /inventory/warehouses/:id/movements URL to the filtered view', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(buildNavigableRoutes())] });
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/inventory/warehouses/wh-001/movements?source=warehouse');

    expect(router.url).toBe('/inventory/warehouses/movements?source=warehouse&warehouseId=wh-001');
    expect(matchedChildPath(router)).toBe('movements');
    TestBed.resetTestingModule();
  });

  it('navigates /inventory/warehouses/movements without a warehouse id', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(buildNavigableRoutes())] });
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/inventory/warehouses/movements');

    expect(router.url).toBe('/inventory/warehouses/movements');
    expect(matchedChildPath(router)).toBe('movements');
    TestBed.resetTestingModule();
  });

  it('should lazy load list component', async () => {
    const listRoute = WAREHOUSE_ROUTES[0].children?.[0];
    const mod = await listRoute?.loadComponent!();
    expect(typeof mod).toBe('function');
    expect(mod.name).toContain('WarehousesListPageComponent');
  });

  it('should lazy load form component for new', async () => {
    const newRoute = WAREHOUSE_ROUTES[0].children?.[1];
    const mod = await newRoute?.loadComponent!();
    expect(typeof mod).toBe('function');
    expect(mod.name).toContain('WarehousesFormPageComponent');
  });

  it('should lazy load details component', async () => {
    const detailsRoute = WAREHOUSE_ROUTES[0].children?.find((route) => route.path === ':id');
    const mod = await detailsRoute?.loadComponent!();
    expect(typeof mod).toBe('function');
    expect(mod.name).toContain('WarehousesDetailsPageComponent');
  });

  it('should lazy load form component for edit', async () => {
    const editRoute = WAREHOUSE_ROUTES[0].children?.find((route) => route.path === ':id/edit');
    const mod = await editRoute?.loadComponent!();
    expect(typeof mod).toBe('function');
    expect(mod.name).toContain('WarehousesFormPageComponent');
  });
});
