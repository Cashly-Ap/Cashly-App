import { TranslationService } from '@core/i18n/translation.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import {
  PermissionAction,
  PermissionMatrix,
  PermissionRegistry,
} from '../../../authorization/models/access.model';
import { PermissionCatalogModule } from '../../../permissions/models/permission-catalog.model';
import { MENU_AREA_ORDER } from '@core/layouts/config/menu-order.config';
import { AuthorizationService } from '../../../authorization/services/authorization.service';
import {
  BusinessModule,
  BUSINESS_MODULE_LABELS,
} from '../../../user/models/enums/business-module.enum';

export type PermissionPreset = 'none' | 'read' | 'custom' | 'all';

export interface PermissionRow {
  action: PermissionAction;
  labelKey: string;
  descriptionKey: string;
}

export interface GroupView {
  key: string;
  labelKey: string;
  permissions: PermissionRow[];
}

export interface PermissionParentGroup {
  parent: string;
  entries: PermissionRegistry[];
}

@Component({
  selector: 'app-permission-editor',
  standalone: true,
  imports: [
    TranslatePipe,
    FormsModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    PopoverModule,
    SelectModule,
  ],
  templateUrl: './permission-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionEditorComponent {
  private readonly parentOrder: readonly string[] = MENU_AREA_ORDER.map((area) => area.area);
  private readonly moduleOrder: ReadonlyMap<BusinessModule, number> = new Map(
    MENU_AREA_ORDER.flatMap((area) => area.modules).map((module, index) => [module, index]),
  );
  private readonly parentAliases: Record<string, string> = {
    Sales: 'Ventas',
    Purchases: 'Compras',
    Catalog: 'Catálogo',
    Inventory: 'Inventario',
    Finance: 'Finanzas',
    Contacts: 'Contactos',
    Analytics: 'Análisis',
    Platform: 'Plataforma',
  };
  private readonly translations = inject(TranslationService);
  private readonly authorization = inject(AuthorizationService);
  readonly registry = input.required<PermissionRegistry[]>();
  readonly catalog = input<PermissionCatalogModule[]>([]);
  readonly permissions = input.required<PermissionMatrix>();
  readonly protected = input(false);
  readonly disabled = input(false);
  readonly permissionsChange = output<PermissionMatrix>();
  readonly presetOptions: { value: PermissionPreset; label: string }[] = [
    { value: 'none', label: 'Sin acceso' },
    { value: 'read', label: 'Solo lectura' },
    { value: 'custom', label: 'Personalizar' },
    { value: 'all', label: 'Todo disponible' },
  ];
  readonly search = signal('');
  readonly parentFilter = signal('');
  readonly childFilter = signal('');
  readonly expanded = signal<Partial<Record<BusinessModule, boolean>>>({});
  readonly labels = BUSINESS_MODULE_LABELS;
  readonly actionLabels: Partial<Record<PermissionAction, string>> = {
    READ: 'platform.auth.permissionActionRead',
    CREATE: 'platform.auth.permissionActionCreate',
    UPDATE: 'platform.auth.permissionActionUpdate',
    DELETE: 'platform.auth.permissionActionDelete',
    EXPORT: 'platform.auth.permissionActionExport',
    IMPORT: 'platform.auth.permissionActionImport',
    EXECUTE: 'platform.auth.permissionActionExecute',
    CONFIRM: 'platform.auth.permissionActionConfirm',
     CANCEL: 'platform.auth.permissionActionCancel',
     DUPLICATE: 'platform.auth.permissionActionDuplicate',
     DETAILS: 'platform.auth.permissionActionDetails', BALANCE: 'platform.auth.permissionActionBalance', HISTORY: 'platform.auth.permissionActionHistory', OPEN: 'platform.auth.permissionActionOpen', CLOSE: 'platform.auth.permissionActionClose', REPORT: 'platform.auth.permissionActionReport', PARTIAL_PAYMENT: 'platform.auth.permissionActionPartialPayment', REFUND: 'platform.auth.permissionActionRefund', ADVANCE: 'platform.auth.permissionActionAdvance',
    CUSTOMER_BALANCE: 'platform.auth.permissionActionCustomerBalance', REPORT_QUOTES: 'platform.auth.permissionActionReportQuotes', REPORT_ORDERS: 'platform.auth.permissionActionReportOrders', REPORT_PURCHASES: 'platform.auth.permissionActionReportPurchases', REPORT_PRODUCTS: 'platform.auth.permissionActionReportProducts', REPORT_COMMERCIAL_CATALOG: 'platform.auth.permissionActionReportCommercialCatalog', REPORT_STOCK: 'platform.auth.permissionActionReportStock', REPORT_MOVEMENTS: 'platform.auth.permissionActionReportMovements', REPORT_INVOICES: 'platform.auth.permissionActionReportInvoices', REPORT_CASH_REGISTER: 'platform.auth.permissionActionReportCashRegister', REPORT_RECEIVABLES: 'platform.auth.permissionActionReportReceivables', CASH_HISTORY: 'platform.auth.permissionActionCashHistory', INVOICE_DUPLICATE: 'platform.auth.permissionActionInvoiceDuplicate', PAY_WITH_VALIDATION: 'platform.auth.permissionActionPayWithValidation', PAY_DIRECT: 'platform.auth.permissionActionPayDirect', PAY_ALL: 'platform.auth.permissionActionPayAll', PAY_PARTIAL: 'platform.auth.permissionActionPayPartial', APPROVE_PAYMENT: 'platform.auth.permissionActionApprovePayment', REJECT_PAYMENT: 'platform.auth.permissionActionRejectPayment',
  };
  readonly descriptions: Partial<Record<PermissionAction, string>> = {
    READ: 'platform.auth.viewListsAndDetails',
    CREATE: 'platform.auth.addNewRecords',
    UPDATE: 'platform.auth.editExistingRecords',
    DELETE: 'platform.auth.deleteRecords',
    EXPORT: 'platform.auth.downloadDataAndReports',
    IMPORT: 'platform.auth.uploadDataFromFiles',
    EXECUTE: 'platform.auth.performModuleOperations',
    CONFIRM: 'platform.auth.confirmModuleOperations',
     CANCEL: 'platform.auth.cancelModuleOperations',
     DUPLICATE: 'platform.auth.duplicateRecords', CUSTOMER_BALANCE: 'platform.auth.customerBalance', REPORT_QUOTES: 'platform.auth.reportQuotes', REPORT_ORDERS: 'platform.auth.reportOrders', REPORT_PURCHASES: 'platform.auth.reportPurchases', REPORT_PRODUCTS: 'platform.auth.reportProducts', REPORT_COMMERCIAL_CATALOG: 'platform.auth.reportCommercialCatalog', REPORT_STOCK: 'platform.auth.reportStock', REPORT_MOVEMENTS: 'platform.auth.reportMovements', REPORT_INVOICES: 'platform.auth.reportInvoices', REPORT_CASH_REGISTER: 'platform.auth.reportCashRegister', REPORT_RECEIVABLES: 'platform.auth.reportReceivables', CASH_HISTORY: 'platform.auth.cashHistory', INVOICE_DUPLICATE: 'platform.auth.invoiceDuplicate', PAY_WITH_VALIDATION: 'platform.auth.payWithValidation', PAY_DIRECT: 'platform.auth.payDirect', PAY_ALL: 'platform.auth.payAll', PAY_PARTIAL: 'platform.auth.payPartial', APPROVE_PAYMENT: 'platform.auth.approvePayment', REJECT_PAYMENT: 'platform.auth.rejectPayment',
     DETAILS: 'platform.auth.details', BALANCE: 'platform.auth.balance', HISTORY: 'platform.auth.history', OPEN: 'platform.auth.open', CLOSE: 'platform.auth.close', REPORT: 'platform.auth.report', PARTIAL_PAYMENT: 'platform.auth.partialPayment', REFUND: 'platform.auth.refund', ADVANCE: 'platform.auth.advance',
  };
  readonly moduleMetadata = computed(
    () => new Map(this.catalog().map((entry) => [entry.module, entry])),
  );
  readonly parentOptions = computed(() =>
    [...new Set(this.catalog().map((entry) => entry.parent ?? ''))]
      .filter(Boolean)
      .sort((left, right) => this.parentIndex(left) - this.parentIndex(right)),
  );
  readonly childOptions = computed(() =>
    this.catalog()
      .filter((entry) => !this.parentFilter() || entry.parent === this.parentFilter())
      .sort((left, right) => this.moduleIndex(left.module) - this.moduleIndex(right.module))
      .map((entry) => ({
        label: this.translations.t(this.labels[entry.module]),
        value: entry.module,
      })),
  );
  readonly filteredRegistry = computed(() => {
    const normalize = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('es');
    const term = normalize(this.search().trim());
    return [...this.registry()]
      .filter((entry) => normalize(this.translations.t(this.labels[entry.module])).includes(term))
      .filter(
        (entry) =>
          !this.parentFilter() ||
          this.moduleMetadata().get(entry.module)?.parent === this.parentFilter(),
      )
      .filter((entry) => !this.childFilter() || entry.module === this.childFilter())
      .sort((left, right) => {
        return this.moduleIndex(left.module) - this.moduleIndex(right.module);
      });
  });
  readonly groupedRegistry = computed(() => {
    const groups = new Map<string, PermissionRegistry[]>();
    for (const entry of this.filteredRegistry()) {
      const parent = this.moduleMetadata().get(entry.module)?.parent ?? 'General';
      groups.set(parent, [...(groups.get(parent) ?? []), entry]);
    }
    return [...groups.entries()]
      .sort(([left], [right]) => this.parentIndex(left) - this.parentIndex(right))
      .map(([parent, entries]) => ({
        parent,
        entries: entries.sort((left, right) => this.moduleIndex(left.module) - this.moduleIndex(right.module)),
      }));
  });
  readonly filterActive = computed(() => !!this.parentFilter() || !!this.childFilter());
  clearFilters(): void {
    this.parentFilter.set('');
    this.childFilter.set('');
  }
  readonly groupsByModule = computed(() => {
    const catalog = this.catalog();
    const result = new Map<BusinessModule, GroupView[]>();
    if (catalog.length) {
      for (const module of catalog) {
        result.set(
          module.module,
          module.groups.map((group) => ({
            key: group.key,
            labelKey: group.labelKey,
            permissions: group.permissions.map((permission) => ({
              action: permission.action,
              labelKey: permission.labelKey,
              descriptionKey: permission.descriptionKey,
            })),
          })),
        );
      }
      return result;
    }
    for (const entry of this.registry()) {
      result.set(entry.module, [
        {
          key: 'module',
          labelKey: this.labels[entry.module],
          permissions: entry.actions.map((action) => ({
            action,
            labelKey: this.actionLabels[action] ?? 'platform.auth.permissionActionRead',
            descriptionKey: this.descriptions[action] ?? 'platform.auth.viewListsAndDetails',
          })),
        },
      ]);
    }
    return result;
  });
  groupsFor(module: BusinessModule): GroupView[] {
    return (this.groupsByModule().get(module) ?? []).sort((left, right) => left.key.localeCompare(right.key));
  }

  private parentIndex(parent: string): number {
    const index = this.parentOrder.indexOf(this.parentAliases[parent] ?? parent);
    return index === -1 ? this.parentOrder.length : index;
  }

  private moduleIndex(module: BusinessModule): number {
    return this.moduleOrder.get(module) ?? this.moduleOrder.size;
  }

  showGroupTitle(entry: PermissionRegistry, group: GroupView): boolean {
    return (
      this.translations.t(group.labelKey) !== this.translations.t(this.labels[entry.module])
    );
  }

  readonly selectedCount = computed(
    () =>
      this.registry().filter((entry) =>
        entry.actions.some((action) => this.selected(entry.module, action)),
      ).length,
  );

  selected(module: BusinessModule, action: PermissionAction): boolean {
    return this.permissions()[module]?.includes(action) ?? false;
  }
  allowed(entry: PermissionRegistry, action: PermissionAction): boolean {
    const registered = this.registry().find((value) => value.module === entry.module);
    return (
      !!registered?.actions.includes(action) &&
      entry.actions.includes(action) &&
      this.authorization.can(entry.module, action) &&
      (action === 'READ' || this.authorization.can(entry.module, action))
    );
  }
  editable(entry: PermissionRegistry): boolean {
    return (
      !this.disabled() &&
      !this.protected() &&
      entry.actions.some((action) => this.allowed(entry, action))
    );
  }
  preset(entry: PermissionRegistry): PermissionPreset {
    const selected = entry.actions.filter((action) => this.selected(entry.module, action));
    if (!selected.length) return 'none';
    if (selected.length === 1 && selected[0] === 'READ') return 'read';
    if (selected.length === entry.actions.length) return 'all';
    return 'custom';
  }
  isExpanded(entry: PermissionRegistry): boolean {
    return this.expanded()[entry.module] ?? true;
  }
  setPreset(entry: PermissionRegistry, preset: PermissionPreset): void {
    if (!this.editable(entry)) return;
    if (preset === 'custom') {
      this.expanded.update((value) => ({ ...value, [entry.module]: true }));
      return;
    }
    this.expanded.update((value) => ({ ...value, [entry.module]: false }));
    const next = this.withPreset(this.permissions(), entry, preset);
    if (next !== this.permissions()) this.permissionsChange.emit(next);
  }
  applyAll(preset: 'none' | 'read' | 'all'): void {
    if (this.disabled() || this.protected()) return;
    let matrix = this.permissions();
    for (const entry of this.registry()) {
      if (this.editable(entry)) {
        matrix = this.withPreset(matrix, entry, preset);
        this.expanded.update((value) => ({ ...value, [entry.module]: false }));
      }
    }
    this.permissionsChange.emit(matrix);
  }
  canToggle(entry: PermissionRegistry, action: PermissionAction): boolean {
    return (
      this.editable(entry) &&
      this.allowed(entry, action) &&
      this.canGrantDependentAction(entry, action) &&
      !(
        action === 'READ' &&
        this.selected(entry.module, 'READ') &&
        (this.permissions()[entry.module] ?? []).some((grant) => !this.allowed(entry, grant))
      )
    );
  }
  toggle(entry: PermissionRegistry, action: PermissionAction): void {
    if (!this.canToggle(entry, action)) return;
    let grants = [...(this.permissions()[entry.module] ?? [])];
    if (grants.includes(action)) {
      if (action === 'READ' && grants.some((value) => !this.allowed(entry, value))) return;
      grants = action === 'READ' ? [] : grants.filter((value) => value !== action);
    } else {
      grants.push(action);
      if (action === 'PAY_WITH_VALIDATION') grants = grants.filter((value) => value !== 'PAY_DIRECT');
      if (action === 'PAY_DIRECT') grants = grants.filter((value) => value !== 'PAY_WITH_VALIDATION');
      if (entry.actions.includes('READ') && !grants.includes('READ')) grants.unshift('READ');
    }
    this.permissionsChange.emit({ ...this.permissions(), [entry.module]: grants });
  }
  private withPreset(
    matrix: PermissionMatrix,
    entry: PermissionRegistry,
    preset: 'none' | 'read' | 'all',
  ): PermissionMatrix {
    if (entry.actions.includes('READ') && !this.allowed(entry, 'READ')) return matrix;
    const retained = (matrix[entry.module] ?? []).filter((action) => !this.allowed(entry, action));
    const grants =
      preset === 'all'
        ? entry.actions.filter(
            (action) => this.allowed(entry, action) && this.canGrantDependentAction(entry, action),
          )
        : preset === 'read' && this.canGrantDependentAction(entry, 'READ')
          ? ['READ' as const]
          : [];
    let next = [...new Set([...retained, ...grants])];
    if (next.includes('PAY_WITH_VALIDATION')) next = next.filter((action) => action !== 'PAY_DIRECT');
    if (!entry.actions.includes('READ')) return matrix;
    if (entry.actions.includes('READ') && next.length && !next.includes('READ'))
      next.unshift('READ');
    return { ...matrix, [entry.module]: next };
  }

  private canGrantDependentAction(entry: PermissionRegistry, action: PermissionAction): boolean {
    if (action === 'READ') return entry.actions.includes('READ') && this.allowed(entry, 'READ');
    return entry.actions.includes('READ') && this.allowed(entry, 'READ');
  }
}
