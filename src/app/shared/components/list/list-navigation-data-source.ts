import { Injector } from '@angular/core';
import { Observable, forkJoin, map, throwError } from 'rxjs';
import { ProductApiService } from '@features/catalog/products/services/api/product-api.service';
import { CategoryApiService } from '@features/catalog/categories/services/api/category-api.service';
import { PriceTypeApiService } from '@features/catalog/price-types/services/api/price-type-api.service';
import { WarehouseApiService } from '@features/inventory/warehouses/services/api/warehouse-api.service';
import { CustomerApiService } from '@features/partners/customers/services/api/customer-api.service';
import { SupplierApiService } from '@features/partners/suppliers/services/api/supplier-api.service';
import { UserApiService } from '@features/platform/auth/user/services/api/user-api.service';
import { AccessManagementService } from '@features/platform/auth/authorization/services/access-management.service';
import { OrderApiService } from '@features/sales/orders/services/api/order-api.service';
import { QuoteApiService } from '@features/sales/quotes/services/api/quote-api.service';
import { PurchaseApiService } from '@features/procurement/purchases/services/api/purchase-api.service';
import { InvoiceApiService } from '@features/finance/billing/invoices/services/api/invoice-api.service';
import { ReturnApiService } from '@features/finance/billing/returns/services/api/return-api.service';
import { CreditNoteApiService } from '@features/finance/billing/credit-notes/services/api/credit-note-api.service';
import { DebitNoteApiService } from '@features/finance/billing/debit-notes/services/api/debit-note-api.service';
import { PaymentMethodApiService } from '@features/finance/treasury/payment-methods/services/api/payment-method-api.service';
import { ReceivablesApiService } from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import { InvoiceStatus } from '@features/finance/billing/invoices/models/enums/invoice-status.enum';
import { PurchaseStatus } from '@features/procurement/purchases/models/enums/purchase-status.enum';
import { documentListAction } from '@shared/models/document-list-action';
import type { LookupFilterValueMap } from '@core/layouts/config/list-navigation-filters';

export interface NavigationLookupItem {
  id: string;
  label: string;
  description: string;
}

export interface NavigationLookupResult {
  items: NavigationLookupItem[];
  total: number;
}

function description(...parts: (string | number | null | undefined)[]): string {
  return parts.filter((part) => part !== null && part !== undefined && part !== '').join(' · ');
}

function booleanFilter(value: string | undefined): boolean | undefined {
  if (value === undefined || value === '') return undefined;
  return value === 'true';
}

function textFilter(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function statusKey(status: string | null | undefined): string {
  const keys: Record<string, string> = {
    DRAFT: 'navigation.options.draft',
    CONFIRMED: 'navigation.options.confirmed',
    CANCELLED: 'navigation.options.cancelled',
    INVOICED: 'navigation.options.invoiced',
    CONVERTED_TO_ORDER: 'navigation.options.convertedToOrder',
    CONVERTED_TO_INVOICE: 'navigation.options.convertedToInvoice',
    PENDING_PAYMENT: 'navigation.options.pendingPayment',
    PARTIALLY_PAID: 'navigation.options.partiallyPaid',
    PAID: 'navigation.options.paid',
    FULLY_RETURNED: 'navigation.options.fullyReturned',
  };
  return keys[status ?? ''] ?? status ?? '';
}

function pageResult<T>(
  response: { content: T[]; totalElements: number },
  toItem: (item: T) => NavigationLookupItem,
): NavigationLookupResult {
  return { items: response.content.map(toItem), total: response.totalElements };
}

function arrayResult<T>(
  records: readonly T[],
  toItem: (record: T) => NavigationLookupItem,
  search: string,
  page: number,
  size: number,
): NavigationLookupResult {
  const term = search.trim().toLocaleLowerCase();
  const items = records
    .map(toItem)
    .filter((item) => `${item.label} ${item.description}`.toLocaleLowerCase().includes(term));
  return { items: items.slice(page * size, (page + 1) * size), total: items.length };
}

export function loadNavigationLookup(
  injector: Injector,
  route: string,
  label: string,
  search: string,
  page: number,
  size: number,
  filterValues: LookupFilterValueMap = {},
): Observable<NavigationLookupResult> {
  const filters = { search: search.trim() || undefined, page, size };
  const active = booleanFilter(filterValues['active']);
  const action = documentListAction(label);
  switch (route) {
    case '/catalog/products':
      return injector
        .get(ProductApiService)
        .getAll({
          ...filters,
          active,
          composite: booleanFilter(filterValues['composite']),
          categoryId: textFilter(filterValues['categoryId']),
        })
        .pipe(
          map((response) =>
            pageResult(response, (item) => ({
              id: item.id,
              label: item.name,
              description: description(item.code, item.categoryName),
            })),
          ),
        );
    case '/catalog/categories':
      return injector
        .get(CategoryApiService)
        .getAll({ ...filters, active })
        .pipe(
          map((response) =>
            pageResult(response, (item) => ({
              id: item.id,
              label: item.name,
              description: item.description ?? '',
            })),
          ),
        );
    case '/catalog/price-types':
      return injector
        .get(PriceTypeApiService)
        .getAll({ ...filters, active })
        .pipe(
          map((response) =>
            pageResult(response, (item) => ({
              id: item.id,
              label: item.name,
              description: item.active ? 'Activo' : 'Inactivo',
            })),
          ),
        );
    case '/inventory/warehouses':
      return injector
        .get(WarehouseApiService)
        .getAll({ ...filters, active })
        .pipe(
          map((response) =>
            pageResult(response, (item) => ({
              id: item.id,
              label: item.name,
              description: description(item.state, item.municipality),
            })),
          ),
        );
    case '/partners/customers':
      return injector
        .get(CustomerApiService)
        .getAll({
          ...filters,
          type: textFilter(filterValues['type']),
          active,
          state: textFilter(filterValues['state']),
          municipality: textFilter(filterValues['municipality']),
        })
        .pipe(
          map((response) =>
            pageResult(response, (item) => ({
              id: item.id,
              label: item.legalName,
              description: description(`#${item.code}`, item.rif),
            })),
          ),
        );
    case '/partners/suppliers':
      return injector
        .get(SupplierApiService)
        .getAll({
          ...filters,
          type: textFilter(filterValues['type']),
          active,
          state: textFilter(filterValues['state']),
          municipality: textFilter(filterValues['municipality']),
        })
        .pipe(
          map((response) =>
            pageResult(response, (item) => ({
              id: item.id,
              label: item.legalName,
              description: description(`#${item.code}`, item.rif),
            })),
          ),
        );
    case '/platform/users':
      return injector
        .get(UserApiService)
        .getAll({ ...filters, role: textFilter(filterValues['role']), active })
        .pipe(
          map((response) =>
            pageResult(response, (item) => ({
              id: item.id,
              label: item.userName,
              description: item.email,
            })),
          ),
        );
    case '/platform/roles':
      return injector
        .get(AccessManagementService)
        .roles(action === 'EDIT' ? 'EDIT' : undefined)
        .pipe(
          map((items) =>
            arrayResult(
              items,
              (item) => ({ id: item.id, label: item.name, description: item.description ?? '' }),
              search,
              page,
              size,
            ),
          ),
        );
    case '/platform/departments':
      return injector
        .get(AccessManagementService)
        .departments()
        .pipe(
          map((items) =>
            arrayResult(
              items,
              (item) => ({ id: item.id, label: item.name, description: item.description ?? '' }),
              search,
              page,
              size,
            ),
          ),
        );
    case '/sales/orders':
      return injector
        .get(OrderApiService)
        .getAll({
          search: filters.search,
          action,
          ...(!action ? { status: filterValues['status'] || 'ALL' } : {}),
        })
        .pipe(
          map((items) =>
            arrayResult(
              items,
              (item) => ({
                id: item.id,
                label: item.orderNumber,
                description: description(item.customerAlias, statusKey(item.status)),
              }),
              search,
              page,
              size,
            ),
          ),
        );
    case '/sales/quotes':
      return injector
        .get(QuoteApiService)
        .getAll({
          search: filters.search,
          action,
          ...(!action ? { status: filterValues['status'] || 'ALL' } : {}),
        })
        .pipe(
          map((items) =>
            arrayResult(
              items,
              (item) => ({
                id: item.id,
                label: item.quoteNumber,
                description: description(item.customerName, statusKey(item.status)),
              }),
              search,
              page,
              size,
            ),
          ),
        );
    case '/procurement/purchases': {
      const api = injector.get(PurchaseApiService);
      const status = textFilter(filterValues['status']);
      const request = action
        ? api.getAll({ search: filters.search, action })
        : status
          ? api.getAll({ search: filters.search, status })
          : forkJoin(
              Object.values(PurchaseStatus).map((status) =>
                api.getAll({ search: filters.search, status }),
              ),
            ).pipe(
              map((pages) =>
                pages.flat().sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
              ),
            );
      return request.pipe(
        map((items) =>
          arrayResult(
            items,
            (item) => ({
              id: item.id,
              label: item.purchaseNumber,
              description: description(item.supplierName, statusKey(item.status)),
            }),
            search,
            page,
            size,
          ),
        ),
      );
    }
    case '/finance/billing/invoices': {
      const invoiceStatus = textFilter(filterValues['status']);
      const statuses =
        !invoiceStatus || invoiceStatus === 'ALL'
          ? Object.values(InvoiceStatus)
          : [invoiceStatus];
      const returnStatus = textFilter(filterValues['returnStatus']);
      const dueStatus = textFilter(filterValues['dueStatus']);
      return injector
        .get(InvoiceApiService)
        .getAll({
          search: filters.search,
          action,
          ...(!action ? { statuses } : {}),
          paymentType: textFilter(filterValues['paymentType']),
          dueStatus: dueStatus as 'OVERDUE' | 'CURRENT' | undefined,
          returnStatus: returnStatus ? [returnStatus] : undefined,
        })
        .pipe(
          map((items) =>
            arrayResult(
              items,
              (item) => ({
                id: item.id,
                label: item.invoiceNumber,
                description: description(item.customerName, statusKey(item.status)),
              }),
              '',
              page,
              size,
            ),
          ),
        );
    }
    case '/finance/billing/returns':
      return injector
        .get(ReturnApiService)
        .getAll({ search: filters.search })
        .pipe(
          map((items) =>
            arrayResult(
              items,
              (item) => ({
                id: item.id,
                label: item.returnNumber,
                description: description(item.customerName, item.invoiceNumber),
              }),
              search,
              page,
              size,
            ),
          ),
        );
    case '/finance/billing/credit-notes':
      return injector
        .get(CreditNoteApiService)
        .getAll()
        .pipe(
          map((items) =>
            arrayResult(
              items,
              (item) => ({
                id: item.id,
                label: item.noteNumber,
                description: description(item.customerName, item.invoiceNumber),
              }),
              search,
              page,
              size,
            ),
          ),
        );
    case '/finance/billing/debit-notes':
      return injector
        .get(DebitNoteApiService)
        .getAll({ search: filters.search })
        .pipe(
          map((items) =>
            arrayResult(
              items,
              (item) => ({
                id: item.id,
                label: item.noteNumber,
                description: description(item.customerName, item.invoiceNumber),
              }),
              search,
              page,
              size,
            ),
          ),
        );
    case '/finance/treasury/payment-methods':
      return injector
        .get(PaymentMethodApiService)
        .getAll({ ...filters, active })
        .pipe(
          map((response) =>
            pageResult(response, (item) => ({
              id: item.id,
              label: item.name,
              description: description(item.code, item.description),
            })),
          ),
        );
    case '/finance/treasury/receivables': {
      const api = injector.get(ReceivablesApiService);
      if (label === 'Aprobar pago' || label === 'Rechazar pago') {
        return api.listPendingPayments(label === 'Aprobar pago' ? 'APPROVE' : 'REJECT').pipe(
          map((items) =>
            arrayResult(
              items,
              (item) => ({
                id: item.id,
                label: item.paymentNumber,
                description: description(
                  item.customerName,
                  item.invoiceNumber,
                  item.referenceNumber,
                ),
              }),
              search,
              page,
              size,
            ),
          ),
        );
      }
      const debtAction =
        label === 'Pagar todo'
          ? 'PAY_ALL'
          : label === 'Pago parcial'
            ? 'PAY_PARTIAL'
            : label === 'Reintegro'
              ? 'REFUND'
              : undefined;
      return api.searchCustomersWithDebt({ ...filters, action: debtAction }).pipe(
        map((response) =>
          pageResult(response, (item) => ({
            id: item.customerId,
            label: item.customerName,
            description: item.customerRif,
          })),
        ),
      );
    }
    default:
      return throwError(() => new Error('No hay un buscador disponible para esta sección.'));
  }
}
