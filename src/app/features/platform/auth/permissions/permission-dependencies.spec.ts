import { describe, expect, it } from 'vitest';
import { AppPermission } from '@features/platform/auth/permissions/app-permission';
import { CatalogModule } from '@features/platform/auth/permissions/permission-catalog.types';
import {
  normalizePermissionSelection,
  replaceModulePermissions,
  togglePermission,
} from '@features/platform/auth/permissions/permission-dependencies';

const orders: CatalogModule = {
  moduleKey: 'navigation.labels.orders',
  permissions: [
    { code: 'SALES_ORDERS_VIEW_LIST', labelKey: 'viewList' },
    { code: 'SALES_ORDERS_VIEW_DETAIL', labelKey: 'viewDetail' },
    { code: 'SALES_ORDERS_EDIT', labelKey: 'edit' },
    { code: 'SALES_ORDERS_CREATE', labelKey: 'create' },
  ],
};

const invoices: CatalogModule = {
  moduleKey: 'navigation.labels.invoices',
  permissions: [
    { code: 'FINANCE_BILLING_INVOICES_VIEW_LIST', labelKey: 'viewList' },
    { code: 'FINANCE_BILLING_INVOICES_CREATE', labelKey: 'create' },
  ],
};

const modules = [orders, invoices];

describe('permission dependencies', () => {
  it('adds the module root when a child permission is selected', () => {
    expect(togglePermission(modules, [], 'SALES_ORDERS_CREATE', true)).toEqual([
      'SALES_ORDERS_VIEW_LIST',
      'SALES_ORDERS_CREATE',
    ]);
  });

  it('keeps the root when a child permission is removed', () => {
    expect(
      togglePermission(
        modules,
        ['SALES_ORDERS_VIEW_LIST', 'SALES_ORDERS_EDIT'],
        'SALES_ORDERS_EDIT',
        false,
      ),
    ).toEqual(['SALES_ORDERS_VIEW_LIST']);
  });

  it('clears every permission of the module when the root is removed', () => {
    expect(
      togglePermission(
        modules,
        [
          'SALES_ORDERS_VIEW_LIST',
          'SALES_ORDERS_VIEW_DETAIL',
          'SALES_ORDERS_EDIT',
          'FINANCE_BILLING_INVOICES_VIEW_LIST',
        ],
        'SALES_ORDERS_VIEW_LIST',
        false,
      ),
    ).toEqual(['FINANCE_BILLING_INVOICES_VIEW_LIST']);
  });

  it('keeps the detail permission optional', () => {
    expect(
      togglePermission(
        modules,
        ['SALES_ORDERS_VIEW_LIST', 'SALES_ORDERS_VIEW_DETAIL', 'SALES_ORDERS_EDIT'],
        'SALES_ORDERS_VIEW_DETAIL',
        false,
      ),
    ).toEqual(['SALES_ORDERS_VIEW_LIST', 'SALES_ORDERS_EDIT']);
  });

  it('does not add a root the actor cannot grant', () => {
    expect(
      togglePermission(modules, [], 'SALES_ORDERS_CREATE', true, (code) => {
        return code === 'SALES_ORDERS_CREATE';
      }),
    ).toEqual([]);
  });

  it('normalizes existing selections with orphan children', () => {
    expect(
      normalizePermissionSelection(modules, [
        'SALES_ORDERS_EDIT',
        'FINANCE_BILLING_INVOICES_CREATE',
      ]),
    ).toEqual([
      'SALES_ORDERS_EDIT',
      'FINANCE_BILLING_INVOICES_CREATE',
      'SALES_ORDERS_VIEW_LIST',
      'FINANCE_BILLING_INVOICES_VIEW_LIST',
    ]);
  });

  it('replaces only the permissions of the selected module', () => {
    const selected: AppPermission[] = [
      'SALES_ORDERS_VIEW_LIST',
      'SALES_ORDERS_EDIT',
      'FINANCE_BILLING_INVOICES_VIEW_LIST',
    ];
    expect(
      replaceModulePermissions(selected, orders, ['SALES_ORDERS_VIEW_LIST', 'SALES_ORDERS_CREATE']),
    ).toEqual([
      'FINANCE_BILLING_INVOICES_VIEW_LIST',
      'SALES_ORDERS_VIEW_LIST',
      'SALES_ORDERS_CREATE',
    ]);
  });
});
