import { routes as applicationRoutes } from '@app/app.routes';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { PermissionAction } from '@features/platform/auth/authorization/models/access.model';
import { CATEGORY_ROUTES } from '@features/catalog/categories/routing/category.routes';
import { PRICE_TYPE_ROUTES } from '@features/catalog/price-types/routing/price-type.routes';
import { PRODUCT_ROUTES } from '@features/catalog/products/routing/product.routes';
import { CREDIT_NOTE_ROUTES } from '@features/finance/billing/credit-notes/routing/credit-notes.routes';
import { DEBIT_NOTE_ROUTES } from '@features/finance/billing/debit-notes/routing/debit-notes.routes';
import { INVOICE_ROUTES } from '@features/finance/billing/invoices/routing/invoices.routes';
import { RETURN_ROUTES } from '@features/finance/billing/returns/routing/returns.routes';
import { CASH_REGISTER_ROUTES } from '@features/finance/treasury/cash-register/routing/cash-register.routes';
import { PAYMENT_METHOD_ROUTES } from '@features/finance/treasury/payment-methods/routing/payment-methods.routes';
import { RECEIVABLES_ROUTES } from '@features/finance/treasury/receivables/routing/receivables.routes';
import { WAREHOUSE_ROUTES } from '@features/inventory/warehouses/routing/warehouse.routes';
import { CUSTOMER_ROUTES } from '@features/partners/customers/routing/customer.routes';
import { SUPPLIER_ROUTES } from '@features/partners/suppliers/routing/supplier.routes';
import { DEPARTMENTS_ROUTES } from '@features/platform/auth/department/routing/departments.routes';
import { ROLES_ROUTES } from '@features/platform/auth/role/routing/roles.routes';
import { USER_ROUTES } from '@features/platform/auth/user/routing/users.routes';
import { PURCHASE_ROUTES } from '@features/procurement/purchases/routing/purchase.routes';
import { ORDER_ROUTES } from '@features/sales/orders/routing/orders.routes';
import { QUOTE_ROUTES } from '@features/sales/quotes/routing/quotes.routes';

@Component({ standalone: true, template: 'Authorized page' })
class AuthorizedPage {}

@Component({ standalone: true, template: 'Denied page' })
class DeniedPage {}

const analytics = applicationRoutes
  .find((route) => route.children)
  ?.children?.find((route) => route.path === 'analytics');
const dashboard = analytics?.children?.find((route) => route.path === 'dashboard');
const modules: Routes[] = [
  [{ path: '', data: dashboard?.data, children: [{ ...dashboard, path: '' }] }],
  CATEGORY_ROUTES,
  PRICE_TYPE_ROUTES,
  PRODUCT_ROUTES,
  CREDIT_NOTE_ROUTES,
  DEBIT_NOTE_ROUTES,
  INVOICE_ROUTES,
  RETURN_ROUTES,
  CASH_REGISTER_ROUTES,
  PAYMENT_METHOD_ROUTES,
  RECEIVABLES_ROUTES,
  WAREHOUSE_ROUTES,
  CUSTOMER_ROUTES,
  SUPPLIER_ROUTES,
  DEPARTMENTS_ROUTES,
  ROLES_ROUTES,
  USER_ROUTES,
  PURCHASE_ROUTES,
  ORDER_ROUTES,
  QUOTE_ROUTES,
];

function guardedRoutes(source: Routes): Routes {
  return source.map((route) => {
    const { loadComponent, loadChildren, children, ...guarded } = route;
    return {
      ...guarded,
      ...(loadComponent ? { component: AuthorizedPage } : {}),
      ...(children ? { children: guardedRoutes(children) } : {}),
    };
  });
}

const cases = modules.flatMap((moduleRoutes) => {
  const parent = moduleRoutes[0];
  return (parent.children ?? [])
    .filter((route) => route.loadComponent)
    .map((route) => ({
      module: parent.data?.['module'] as BusinessModule,
      path: route.path ?? '',
      source: moduleRoutes,
      action: (route.data?.['action'] ??
        (route.path === 'new'
          ? 'CREATE'
          : route.path?.includes('edit')
            ? 'UPDATE'
            : 'READ')) as PermissionAction,
    }));
});

async function navigate(source: Routes, path: string): Promise<string> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: 'protected', children: guardedRoutes(source) },
        { path: 'platform/auth/configuration', component: DeniedPage },
      ]),
      { provide: AuthService, useValue: auth },
    ],
  });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl('/protected' + (path ? '/' + path.replace(':id', 'record-1') : ''));
  return TestBed.inject(Router).url;
}

const auth = {
  isAuthenticated: vi.fn(() => true),
  ensureAccess: vi.fn(() => of({})),
  hasPermission: vi.fn<(module: BusinessModule, action: PermissionAction) => boolean>(),
};

beforeEach(() => {
  vi.clearAllMocks();
  auth.hasPermission.mockReturnValue(false);
});

describe('real business route permission enforcement', () => {
  it.each(cases)('blocks direct $module /$path without permissions', async ({ source, path }) => {
    expect(await navigate(source, path)).toBe('/platform/auth/configuration');
  });

  it.each(cases.filter(({ action }) => action !== 'READ'))(
    'blocks direct $module /$path for a read-only role',
    async ({ source, path }) => {
      auth.hasPermission.mockImplementation((module, action) => action === 'READ');
      expect(await navigate(source, path)).toBe('/platform/auth/configuration');
    },
  );

  it.each(cases.filter(({ action }) => action === 'READ'))(
    'allows direct $module /$path for a role with the required read grants',
    async ({ source, path }) => {
      auth.hasPermission.mockImplementation((module, action) => action === 'READ');
      expect(await navigate(source, path)).toBe(
        '/protected' + (path ? '/' + path.replace(':id', 'record-1') : ''),
      );
    },
  );
});

describe('inventory reports are modal actions', () => {
  it('does not register a separate reports page in analytics', () => {
    expect(analytics?.children?.some((route) => route.path === 'reports')).toBe(false);
  });
});
