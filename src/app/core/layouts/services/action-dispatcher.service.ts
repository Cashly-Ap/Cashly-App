import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from '@core/layouts/models';
import { ListNavigationService } from '@shared/components/list/list-navigation.service';
import { LookupItem } from '@core/layouts/models/lookup-definition.model';
import { MessageService } from 'primeng/api';
import { ActionDialogService } from '@shared/services/action-dialog.service';
import { NavigationActionService } from '@shared/services/navigation-action.service';
import { DirectNavigationActionService } from '@shared/services/direct-navigation-action.service';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';
import { CancelDialogService } from '@shared/services/cancel-dialog.service';
import { PdfActionService } from '@shared/services/pdf-action.service';
import { AuditTrailDialogService } from '@shared/services/audit-trail-dialog.service';
import { AuditEntityType } from '@features/platform/audit/models';

const RECORD_PATH_SEGMENTS: Record<string, readonly string[]> = {
  'Ver detalle': [],
  Editar: ['edit'],
};

const AUDIT_ENTITY_BY_ROUTE: Record<string, AuditEntityType> = {
  '/sales/quotes': 'QUOTE',
  '/sales/orders': 'ORDER',
  '/procurement/purchases': 'PURCHASE',
  '/catalog/products': 'PRODUCT',
  '/catalog/categories': 'CATEGORY',
  '/catalog/price-types': 'PRICE_TYPE',
  '/inventory/warehouses': 'WAREHOUSE',
  '/finance/billing/invoices': 'INVOICE',
  '/finance/billing/returns': 'RETURN',
  '/finance/billing/credit-notes': 'CREDIT_NOTE',
  '/finance/billing/debit-notes': 'DEBIT_NOTE',
  '/finance/treasury/payment-methods': 'PAYMENT_METHOD',
  '/partners/customers': 'CUSTOMER',
  '/partners/suppliers': 'SUPPLIER',
  '/platform/users': 'USER',
  '/platform/roles': 'ROLE',
  '/platform/departments': 'DEPARTMENT',
};
import { LookupDefinitionRegistry } from '@shared/services/lookup-definition.registry';

export interface ActionDispatchContext {
  route: string;
  label: string;
  record: LookupItem;
  queryParams?: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class ActionDispatcherService {
  private readonly router = inject(Router);
  private readonly navigation = inject(ListNavigationService);
  private readonly messages = inject(MessageService);
  private readonly actionDialogs = inject(ActionDialogService);
  private readonly navigationActions = inject(NavigationActionService);
  private readonly directActions = inject(DirectNavigationActionService);
  private readonly deletion = inject(DeleteDialogService);
  private readonly cancellation = inject(CancelDialogService);
  private readonly pdfActions = inject(PdfActionService);
  private readonly lookups = inject(LookupDefinitionRegistry);
  private readonly auditDialog = inject(AuditTrailDialogService);

  dispatchDestination(destination: MenuItem, queryParams?: Record<string, string>): void {
    if (!destination.routerLink) return;
    void this.router.navigate([destination.routerLink], { queryParams });
  }

  dispatchDirect(route: string, label: string): boolean {
    return this.directActions.execute(this.resource(route), label);
  }

  dispatchRecord(context: ActionDispatchContext): boolean {
    const { route, label, record, queryParams } = context;
    const resource = this.resource(route);
    if (label === 'Historial') {
      const entityType = AUDIT_ENTITY_BY_ROUTE[route];
      if (!entityType) return false;
      this.auditDialog.open({
        entityType,
        entityId: record.id,
        label: record.label,
      });
      return true;
    }
    if (label === 'Eliminar') {
      this.deletion.open(resource, record.id, record.label);
      return true;
    }
    if (label === 'Cancelar') {
      this.cancellation.open(resource, record.id, record.label);
      return true;
    }
    if (this.navigation.executeRecordAction(route, label, record.id)) return true;
    if (this.actionDialogs.open(resource, label, record.id)) return true;
    if (label === 'Descargar PDF') {
      this.pdfActions.open(resource, record.id, record.label);
      return true;
    }
    const definition = this.lookups.find(route);
    const recordRoute = definition
      ? label === 'Ver detalle'
        ? definition.recordRoutes.detail(record.id)
        : label === 'Editar'
          ? definition.recordRoutes.edit(record.id)
          : undefined
      : undefined;
    if (recordRoute) {
      void this.router.navigate([...recordRoute], { queryParams });
      return true;
    }
    if (this.navigationActions.execute(resource, label, record)) return true;
    this.messages.add({
      severity: 'warn',
      summary: label,
      detail: 'core.layouts.actionNotAvailable',
      life: 4000,
    });
    return false;
  }

  private resource(route: string): string {
    return route.split('/').filter(Boolean).at(-1) ?? '';
  }
}
