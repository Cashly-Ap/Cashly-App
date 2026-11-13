import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { CompanyPermission } from '@features/platform/company/permissions';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';

interface NotificationDestination {
  collection: string;
  module: BusinessModule | null;
  permissionCode?: string;
}

const DASHBOARD_ROUTE = '/analytics/dashboard';
const RECEIVABLES_ROUTE = '/finance/treasury/receivables';

const DESTINATIONS: Record<string, NotificationDestination> = {
  QUOTE: { collection: '/sales/quotes', module: BusinessModule.SALES_QUOTES },
  ORDER: { collection: '/sales/orders', module: BusinessModule.SALES_ORDERS },
  PURCHASE: { collection: '/procurement/purchases', module: BusinessModule.PURCHASES },
  PRODUCT: { collection: '/catalog/products', module: BusinessModule.CATALOG_PRODUCTS },
  CATEGORY: { collection: '/catalog/categories', module: BusinessModule.CATALOG_CATEGORIES },
  PRICE_TYPE: { collection: '/catalog/price-types', module: BusinessModule.CATALOG_PRICES },
  WAREHOUSE: { collection: '/inventory/warehouses', module: BusinessModule.INVENTORY_WAREHOUSES },
  INVOICE: { collection: '/finance/billing/invoices', module: BusinessModule.FINANCE_INVOICES },
  RETURN: { collection: '/finance/billing/returns', module: BusinessModule.FINANCE_RETURNS },
  CREDIT_NOTE: {
    collection: '/finance/billing/credit-notes',
    module: BusinessModule.FINANCE_CREDIT_NOTES,
  },
  DEBIT_NOTE: {
    collection: '/finance/billing/debit-notes',
    module: BusinessModule.FINANCE_DEBIT_NOTES,
  },
  CASH_REGISTER: {
    collection: '/finance/treasury/cash-register',
    module: BusinessModule.FINANCE_CASH_REGISTER,
  },
  EXPENSE: {
    collection: '/finance/treasury/expenses',
    module: BusinessModule.FINANCE_EXPENSES,
  },
  RECEIVABLE: { collection: RECEIVABLES_ROUTE, module: BusinessModule.FINANCE_RECEIVABLES },
  PAYMENT: { collection: RECEIVABLES_ROUTE, module: BusinessModule.FINANCE_RECEIVABLES },
  PAYMENT_METHOD: {
    collection: '/finance/treasury/payment-methods',
    module: BusinessModule.FINANCE_PAYMENT_METHODS,
  },
  CUSTOMER: { collection: '/partners/customers', module: BusinessModule.CONTACTS_CUSTOMERS },
  SUPPLIER: { collection: '/partners/suppliers', module: BusinessModule.CONTACTS_SUPPLIERS },
  USER: { collection: '/platform/users', module: BusinessModule.USERS },
  ROLE: { collection: '/platform/roles', module: BusinessModule.ROLES },
  DEPARTMENT: { collection: '/platform/departments', module: BusinessModule.DEPARTMENTS },
  COMPANY: {
    collection: '/platform/company',
    module: null,
    permissionCode: CompanyPermission.VIEW,
  },
};

@Injectable({ providedIn: 'root' })
export class NotificationDestinationResolver {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  async navigate(referenceType: string | null, referenceId: string | null): Promise<void> {
    const destination = referenceType ? DESTINATIONS[referenceType] : undefined;
    if (!destination) return;

    if (!this.canAccess(destination)) {
      await this.navigateToRoute(DASHBOARD_ROUTE);
      return;
    }

    if (referenceType === 'PAYMENT' || referenceType === 'RECEIVABLE') {
      await this.navigateToReceivables(referenceId);
      return;
    }

    if (!referenceId) {
      await this.navigateToCollection(destination.collection);
      return;
    }

    try {
      const navigated = await this.router.navigate([destination.collection, referenceId]);
      if (!navigated) await this.navigateToCollection(destination.collection);
    } catch {
      await this.navigateToCollection(destination.collection);
    }
  }

  private canAccess(destination: NotificationDestination): boolean {
    if (destination.permissionCode) {
      return this.auth.hasPermissionCode(destination.permissionCode);
    }
    return destination.module ? this.auth.hasPermission(destination.module, 'READ') : true;
  }

  private async navigateToCollection(collection: string): Promise<void> {
    await this.navigateToRoute(collection);
  }

  private async navigateToReceivables(resourceId: string | null): Promise<void> {
    const queryParams: Record<string, string> = resourceId
      ? { tab: 'pending', focus: resourceId }
      : { tab: 'pending' };
    await this.navigateToRoute(RECEIVABLES_ROUTE, queryParams);
  }

  private async navigateToRoute(
    route: string,
    queryParams?: Record<string, string>,
  ): Promise<void> {
    try {
      if (queryParams) {
        await this.router.navigate([route], { queryParams });
        return;
      }
      await this.router.navigate([route]);
    } catch {
      return;
    }
  }
}
