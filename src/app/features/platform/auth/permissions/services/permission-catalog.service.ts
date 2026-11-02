import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, forkJoin, map, Observable, tap, throwError } from 'rxjs';
import { Role } from '../../authorization/models/access.model';
import { PermissionAction } from '../../authorization/models/access.model';
import { PermissionCatalogArea, PermissionCatalogModule } from '../models/permission-catalog.model';

@Injectable({ providedIn: 'root' })
export class PermissionCatalogService {
  private readonly http = inject(HttpClient);
  private readonly catalogState = signal<PermissionCatalogModule[]>([]);
  private readonly rolesState = signal<Role[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal(false);

  readonly catalog = this.catalogState.asReadonly();
  readonly roles = this.rolesState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  loadCatalog(): Observable<PermissionCatalogModule[]> {
    return this.http.get<PermissionCatalogArea[] | PermissionCatalogModule[]>('/api/permissions/catalog').pipe(
      map((catalog) =>
        catalog.length > 0 && 'domains' in catalog[0]
          ? (catalog as PermissionCatalogArea[]).flatMap((area) =>
              area.domains.map((domain) => ({
                module: domain.module,
                parent: area.area,
                section: this.sectionFor(domain.module),
                sortOrder: domain.sortOrder,
                groups: [
                  {
                    key: 'module',
                    labelKey: this.moduleLabelKey(domain.module),
                    sortOrder: domain.sortOrder,
                  permissions: domain.permissions.map((permission) => ({
                    ...permission,
                    labelKey: this.actionLabelKey(permission.action),
                    descriptionKey: this.actionDescriptionKey(permission.action),
                  })),
                  },
                ],
              })),
            )
          : (catalog as PermissionCatalogModule[]),
      ),
    );
  }

  loadRoles(): Observable<Role[]> {
    return this.http.get<Role[]>('/api/roles');
  }

  load(): Observable<PermissionCatalogModule[]> {
    this.loadingState.set(true);
    this.errorState.set(false);
    return forkJoin({ catalog: this.loadCatalog(), roles: this.loadRoles() }).pipe(
      tap((result) => {
        this.catalogState.set(result.catalog);
        this.rolesState.set(result.roles);
      }),
      map((result) => result.catalog),
      catchError((failure: unknown) => {
        this.errorState.set(true);
        return throwError(() => failure);
      }),
      finalize(() => this.loadingState.set(false)),
    );
  }

  private sectionFor(module: string): string {
    if (module.startsWith('FINANCE_INVOICES') || module.startsWith('FINANCE_RETURNS') || module.includes('CREDIT_NOTES') || module.includes('DEBIT_NOTES')) return 'Billing';
    if (module.startsWith('FINANCE_')) return 'Treasury';
    if (module.startsWith('INVENTORY_')) return 'Warehouses';
    if (module.startsWith('CATALOG_')) return 'Catalog';
    if (module === 'CONTACTS_CUSTOMERS' || module === 'CONTACTS_SUPPLIERS') return 'Contacts';
    if (module.startsWith('SALES_')) return 'Sales';
    if (module.startsWith('PURCHASES_')) return 'Purchases';
    if (module === 'USERS' || module === 'ROLES' || module === 'DEPARTMENTS') return 'Platform';
    return '';
  }

  private actionLabelKey(action: PermissionAction): string {
    const keys: Record<PermissionAction, string> = {
      READ: 'platform.auth.permissionActionRead',
      DETAILS: 'platform.auth.permissionActionDetails',
      CREATE: 'platform.auth.permissionActionCreate',
      UPDATE: 'platform.auth.permissionActionUpdate',
      DELETE: 'platform.auth.permissionActionDelete',
      EXPORT: 'platform.auth.permissionActionExport',
      IMPORT: 'platform.auth.permissionActionImport',
      EXECUTE: 'platform.auth.permissionActionExecute',
      CONFIRM: 'platform.auth.permissionActionConfirm',
      CANCEL: 'platform.auth.permissionActionCancel',
      DUPLICATE: 'platform.auth.permissionActionDuplicate',
      CUSTOMER_BALANCE: 'platform.auth.permissionActionCustomerBalance',
      BALANCE: 'platform.auth.permissionActionBalance',
      HISTORY: 'platform.auth.permissionActionHistory',
      OPEN: 'platform.auth.permissionActionOpen',
      CLOSE: 'platform.auth.permissionActionClose',
      REPORT: 'platform.auth.permissionActionReport',
      REPORT_QUOTES: 'platform.auth.permissionActionReportQuotes',
      REPORT_ORDERS: 'platform.auth.permissionActionReportOrders',
      REPORT_PURCHASES: 'platform.auth.permissionActionReportPurchases',
      REPORT_PRODUCTS: 'platform.auth.permissionActionReportProducts',
      REPORT_COMMERCIAL_CATALOG: 'platform.auth.permissionActionReportCommercialCatalog',
      REPORT_STOCK: 'platform.auth.permissionActionReportStock',
      REPORT_MOVEMENTS: 'platform.auth.permissionActionReportMovements',
      REPORT_INVOICES: 'platform.auth.permissionActionReportInvoices',
      REPORT_CASH_REGISTER: 'platform.auth.permissionActionReportCashRegister',
      REPORT_RECEIVABLES: 'platform.auth.permissionActionReportReceivables',
      PAY_PARTIAL: 'platform.auth.permissionActionPayPartial',
      CASH_HISTORY: 'platform.auth.permissionActionCashHistory',
      INVOICE_DUPLICATE: 'platform.auth.permissionActionInvoiceDuplicate',
      STOCK: 'platform.auth.permissionActionStock',
      MOVEMENT_HISTORY: 'platform.auth.permissionActionMovementHistory',
      RECORD_ENTRY: 'platform.auth.permissionActionRecordEntry',
      RECORD_EXIT: 'platform.auth.permissionActionRecordExit',
      PAY_ALL: 'platform.auth.permissionActionPayAll',
      PARTIAL_PAYMENT: 'platform.auth.permissionActionPartialPayment',
      PAY_WITH_VALIDATION: 'platform.auth.permissionActionPayWithValidation',
      PAY_DIRECT: 'platform.auth.permissionActionPayDirect',
      REFUND: 'platform.auth.permissionActionRefund',
      ADVANCE: 'platform.auth.permissionActionAdvance',
      APPROVE_PAYMENT: 'platform.auth.permissionActionApprovePayment',
      REJECT_PAYMENT: 'platform.auth.permissionActionRejectPayment',
    };
    return keys[action] ?? 'platform.auth.permissionActionRead';
  }

  private actionDescriptionKey(action: PermissionAction): string {
    const labels: Record<PermissionAction, string> = {
      READ: 'platform.auth.viewListsAndDetails',
      DETAILS: 'platform.auth.viewListsAndDetails',
      CREATE: 'platform.auth.addNewRecords',
      UPDATE: 'platform.auth.editExistingRecords',
      DELETE: 'platform.auth.deleteRecords',
      EXPORT: 'platform.auth.downloadDataAndReports',
      IMPORT: 'platform.auth.uploadDataFromFiles',
      EXECUTE: 'platform.auth.performModuleOperations',
      CONFIRM: 'platform.auth.confirmModuleOperations',
      CANCEL: 'platform.auth.cancelModuleOperations',
      DUPLICATE: 'platform.auth.duplicateRecords',
      CUSTOMER_BALANCE: 'platform.auth.customerBalance',
      BALANCE: 'platform.auth.customerBalance',
      HISTORY: 'platform.auth.cashHistory',
      OPEN: 'platform.auth.permissionActionOpen',
      CLOSE: 'platform.auth.permissionActionClose',
      REPORT: 'platform.auth.permissionActionReport',
      REPORT_QUOTES: 'platform.auth.reportQuotes',
      REPORT_ORDERS: 'platform.auth.reportOrders',
      REPORT_PURCHASES: 'platform.auth.reportPurchases',
      REPORT_PRODUCTS: 'platform.auth.reportProducts',
      REPORT_COMMERCIAL_CATALOG: 'platform.auth.reportCommercialCatalog',
      REPORT_STOCK: 'platform.auth.reportStock',
      REPORT_MOVEMENTS: 'platform.auth.reportMovements',
      REPORT_INVOICES: 'platform.auth.reportInvoices',
      REPORT_CASH_REGISTER: 'platform.auth.reportCashRegister',
      REPORT_RECEIVABLES: 'platform.auth.reportReceivables',
      PAY_PARTIAL: 'platform.auth.payPartial',
      CASH_HISTORY: 'platform.auth.cashHistory',
      INVOICE_DUPLICATE: 'platform.auth.invoiceDuplicate',
      STOCK: 'platform.auth.permissionActionStock',
      MOVEMENT_HISTORY: 'platform.auth.permissionActionMovementHistory',
      RECORD_ENTRY: 'platform.auth.permissionActionRecordEntry',
      RECORD_EXIT: 'platform.auth.permissionActionRecordExit',
      PAY_ALL: 'platform.auth.permissionActionPayAll',
      PARTIAL_PAYMENT: 'platform.auth.permissionActionPartialPayment',
      PAY_WITH_VALIDATION: 'platform.auth.payWithValidation',
      PAY_DIRECT: 'platform.auth.payDirect',
      REFUND: 'platform.auth.permissionActionRefund',
      ADVANCE: 'platform.auth.permissionActionAdvance',
      APPROVE_PAYMENT: 'platform.auth.permissionActionApprovePayment',
      REJECT_PAYMENT: 'platform.auth.permissionActionRejectPayment',
    };
    return labels[action] ?? 'platform.auth.viewListsAndDetails';
  }

  private moduleLabelKey(module: string): string {
    const keys: Record<string, string> = {
      SALES_QUOTES: 'platform.auth.salesQuotes',
      SALES_ORDERS: 'platform.auth.salesOrders',
      PURCHASES: 'platform.auth.purchasesOrders',
      CATALOG_PRODUCTS: 'platform.auth.catalogProducts',
      CATALOG_CATEGORIES: 'platform.auth.catalogCategories',
      CATALOG_PRICES: 'platform.auth.catalogPrices',
      INVENTORY_WAREHOUSES: 'platform.auth.inventoryWarehouses',
      FINANCE_INVOICES: 'platform.auth.financeInvoices',
      FINANCE_RETURNS: 'platform.auth.financeReturns',
      FINANCE_CREDIT_NOTES: 'platform.auth.financeCreditNotes',
      FINANCE_DEBIT_NOTES: 'platform.auth.financeDebitNotes',
      FINANCE_CASH_REGISTER: 'platform.auth.financeCashRegister',
      FINANCE_RECEIVABLES: 'platform.auth.financeReceivables',
      FINANCE_PAYMENT_METHODS: 'platform.auth.financePaymentMethods',
      CONTACTS_CUSTOMERS: 'platform.auth.salesCustomers',
      CONTACTS_SUPPLIERS: 'platform.auth.purchasesSuppliers',
      DASHBOARD: 'platform.auth.dashboard',
      USERS: 'platform.auth.userManagement',
      ROLES: 'platform.auth.roles',
      DEPARTMENTS: 'platform.auth.departments',
    };
    return keys[module] ?? 'platform.auth.reports';
  }
}
