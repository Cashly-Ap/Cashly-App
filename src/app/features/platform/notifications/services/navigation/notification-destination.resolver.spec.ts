import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NotificationDestinationResolver } from '@features/platform/notifications/services/navigation/notification-destination.resolver';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

describe('NotificationDestinationResolver', () => {
  let resolver: NotificationDestinationResolver;
  let router: Router;
  let auth: {
    hasPermission: ReturnType<typeof vi.fn>;
    hasPermissionCode: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    auth = {
      hasPermission: vi.fn().mockReturnValue(true),
      hasPermissionCode: vi.fn().mockReturnValue(true),
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
    resolver = TestBed.inject(NotificationDestinationResolver);
    router = TestBed.inject(Router);
  });

  it.each([
    ['QUOTE', 'quote-1', ['/sales/quotes', 'quote-1'], BusinessModule.SALES_QUOTES],
    ['ORDER', 'order-1', ['/sales/orders', 'order-1'], BusinessModule.SALES_ORDERS],
    ['PURCHASE', 'purchase-1', ['/procurement/purchases', 'purchase-1'], BusinessModule.PURCHASES],
    ['PRODUCT', 'product-1', ['/catalog/products', 'product-1'], BusinessModule.CATALOG_PRODUCTS],
    [
      'CATEGORY',
      'category-1',
      ['/catalog/categories', 'category-1'],
      BusinessModule.CATALOG_CATEGORIES,
    ],
    ['PRICE_TYPE', 'price-1', ['/catalog/price-types', 'price-1'], BusinessModule.CATALOG_PRICES],
    [
      'WAREHOUSE',
      'warehouse-1',
      ['/inventory/warehouses', 'warehouse-1'],
      BusinessModule.INVENTORY_WAREHOUSES,
    ],
    [
      'INVOICE',
      'invoice-1',
      ['/finance/billing/invoices', 'invoice-1'],
      BusinessModule.FINANCE_INVOICES,
    ],
    [
      'RETURN',
      'return-1',
      ['/finance/billing/returns', 'return-1'],
      BusinessModule.FINANCE_RETURNS,
    ],
    [
      'CREDIT_NOTE',
      'credit-1',
      ['/finance/billing/credit-notes', 'credit-1'],
      BusinessModule.FINANCE_CREDIT_NOTES,
    ],
    [
      'DEBIT_NOTE',
      'debit-1',
      ['/finance/billing/debit-notes', 'debit-1'],
      BusinessModule.FINANCE_DEBIT_NOTES,
    ],
    [
      'CASH_REGISTER',
      'cash-1',
      ['/finance/treasury/cash-register', 'cash-1'],
      BusinessModule.FINANCE_CASH_REGISTER,
    ],
    [
      'PAYMENT_METHOD',
      'method-1',
      ['/finance/treasury/payment-methods', 'method-1'],
      BusinessModule.FINANCE_PAYMENT_METHODS,
    ],
    [
      'CUSTOMER',
      'customer-1',
      ['/partners/customers', 'customer-1'],
      BusinessModule.CONTACTS_CUSTOMERS,
    ],
    [
      'SUPPLIER',
      'supplier-1',
      ['/partners/suppliers', 'supplier-1'],
      BusinessModule.CONTACTS_SUPPLIERS,
    ],
    ['USER', 'user-1', ['/platform/users', 'user-1'], BusinessModule.USERS],
    ['ROLE', 'role-1', ['/platform/roles', 'role-1'], BusinessModule.ROLES],
    [
      'DEPARTMENT',
      'department-1',
      ['/platform/departments', 'department-1'],
      BusinessModule.DEPARTMENTS,
    ],
  ])(
    'should navigate a %s reference to its detail route',
    async (referenceType, referenceId, commands, module) => {
      const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      await resolver.navigate(referenceType, referenceId);

      expect(auth.hasPermission).toHaveBeenCalledWith(module, 'READ');
      expect(navigate).toHaveBeenCalledWith(commands);
    },
  );

  it.each([
    ['PAYMENT', 'payment-1', { tab: 'pending', focus: 'payment-1' }],
    ['RECEIVABLE', 'receivable-1', { tab: 'pending', focus: 'receivable-1' }],
  ])(
    'should open receivables for a %s reference',
    async (referenceType, referenceId, queryParams) => {
      const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      await resolver.navigate(referenceType, referenceId);

      expect(navigate).toHaveBeenCalledWith(['/finance/treasury/receivables'], { queryParams });
    },
  );

  it('should navigate a company reference to the company page', async () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await resolver.navigate('COMPANY', null);

    expect(auth.hasPermissionCode).toHaveBeenCalledWith('COMPANY_VIEW');
    expect(navigate).toHaveBeenCalledWith(['/platform/company']);
  });

  it.each([
    ['PAYMENT', null, ['/finance/treasury/receivables'], { queryParams: { tab: 'pending' } }],
    ['QUOTE', null, ['/sales/quotes'], undefined],
    ['ORDER', null, ['/sales/orders'], undefined],
  ])(
    'should fall back to the collection when the id is absent',
    async (referenceType, referenceId, commands, extras) => {
      const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      await resolver.navigate(referenceType, referenceId);

      expect(navigate).toHaveBeenCalledWith(commands, ...(extras ? [extras] : []));
    },
  );

  it('should fall back to the collection when detail navigation is rejected', async () => {
    const navigate = vi
      .spyOn(router, 'navigate')
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    await resolver.navigate('ORDER', 'order-1');

    expect(navigate).toHaveBeenNthCalledWith(1, ['/sales/orders', 'order-1']);
    expect(navigate).toHaveBeenNthCalledWith(2, ['/sales/orders']);
  });

  it('should fall back to the dashboard when the user cannot read the module', async () => {
    auth.hasPermission.mockReturnValue(false);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await resolver.navigate('INVOICE', 'invoice-1');

    expect(navigate).toHaveBeenCalledWith(['/analytics/dashboard']);
  });

  it('should fall back to the dashboard when the user cannot view the company', async () => {
    auth.hasPermissionCode.mockReturnValue(false);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await resolver.navigate('COMPANY', null);

    expect(navigate).toHaveBeenCalledWith(['/analytics/dashboard']);
  });

  it('should not navigate for an unknown reference type', async () => {
    const navigate = vi.spyOn(router, 'navigate');

    await resolver.navigate('UNKNOWN_TYPE', 'id-1');

    expect(navigate).not.toHaveBeenCalled();
  });
});
