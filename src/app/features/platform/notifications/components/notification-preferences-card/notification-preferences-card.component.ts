import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { TranslationService } from '@core/i18n/translation.service';
import { DetailsCardHeaderComponent } from '@shared/components/details';
import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { PERMISSION_CATALOG } from '@features/platform/auth/permissions/permission-catalog';
import { NotificationPreferencesService } from '@features/platform/notifications/services/state/notification-preferences.service';
import { NotificationModulePreference } from '@features/platform/notifications/models/notification-preferences.model';
import {
  ListFilterChange,
  ListFilterComponent,
  ListFilterField,
  ListFilterOption,
} from '@shared/components/list/list-filter/list-filter.component';

interface GroupedModule extends NotificationModulePreference {
  labelKey: string;
}

interface CatalogModule {
  moduleKey: string;
}

interface CatalogSection {
  sectionKey: string | null;
  modules: CatalogModule[];
}

interface CatalogArea {
  areaKey: string;
  sections: CatalogSection[];
}

interface NotificationSection {
  sectionKey: string | null;
  modules: GroupedModule[];
}

interface NotificationArea {
  areaKey: string;
  sections: NotificationSection[];
}

const BUSINESS_MODULE_BY_CATALOG_KEY: Readonly<Record<string, string[]>> = {
  'navigation.labels.quotes': ['SALES_QUOTES'],
  'navigation.labels.orders': ['SALES_ORDERS'],
  'navigation.labels.purchases': ['PURCHASES', 'PURCHASE'],
  'navigation.labels.products': ['CATALOG_PRODUCTS', 'PRODUCT'],
  'navigation.labels.categories': ['CATALOG_CATEGORIES', 'CATEGORY'],
  'navigation.labels.priceTypes': ['CATALOG_PRICES', 'PRICE_TYPE'],
  'navigation.labels.warehouses': ['INVENTORY_WAREHOUSES', 'WAREHOUSE'],
  'navigation.labels.invoices': ['FINANCE_BILLING_INVOICES', 'FINANCE_INVOICES', 'INVOICE'],
  'navigation.labels.returns': ['FINANCE_BILLING_RETURNS', 'FINANCE_RETURNS', 'RETURN'],
  'navigation.labels.creditNotes': [
    'FINANCE_BILLING_CREDIT_NOTES',
    'FINANCE_CREDIT_NOTES',
    'CREDIT_NOTE',
  ],
  'navigation.labels.debitNotes': [
    'FINANCE_BILLING_DEBIT_NOTES',
    'FINANCE_DEBIT_NOTES',
    'DEBIT_NOTE',
  ],
  'navigation.labels.cashRegister': [
    'FINANCE_TREASURY_CASH_REGISTER',
    'FINANCE_CASH_REGISTER',
    'CASH_REGISTER',
  ],
  'navigation.labels.expenses': ['FINANCE_TREASURY_EXPENSES', 'EXPENSE'],
  'navigation.labels.accountsReceivable': [
    'FINANCE_TREASURY_RECEIVABLES',
    'FINANCE_RECEIVABLES',
    'RECEIVABLE',
  ],
  'navigation.labels.accountsPayable': ['FINANCE_TREASURY_PAYABLES', 'FINANCE_PAYABLES', 'PAYABLE'],
  'navigation.labels.paymentMethods': [
    'FINANCE_TREASURY_PAYMENT_METHODS',
    'FINANCE_PAYMENT_METHODS',
    'PAYMENT_METHOD',
  ],
  'navigation.labels.customers': ['CONTACTS_CUSTOMERS', 'CUSTOMER'],
  'navigation.labels.suppliers': ['CONTACTS_SUPPLIERS', 'SUPPLIER'],
  'navigation.labels.dashboard': ['DASHBOARD'],
  'navigation.labels.users': ['USERS', 'USER'],
  'navigation.labels.roles': ['ROLES', 'ROLE'],
  'navigation.labels.departments': ['DEPARTMENTS', 'DEPARTMENT'],
  'navigation.labels.company': ['COMPANY'],
  'navigation.labels.auditTrail': ['AUDIT_TRAIL', 'AUDIT'],
};

const ALIASES: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(BUSINESS_MODULE_BY_CATALOG_KEY).flatMap(([catalogKey, businessModules]) =>
    businessModules.map((businessModule) => [businessModule, catalogKey]),
  ),
);

const LABEL_KEYS: Readonly<Record<string, string>> = {
  'finance billing credit notes': 'navigation.labels.creditNotes',
  'finance billing debit notes': 'navigation.labels.debitNotes',
  'finance billing invoices': 'navigation.labels.invoices',
  'finance billing returns': 'navigation.labels.returns',
  'finance treasury cash register': 'navigation.labels.cashRegister',
  'finance treasury payment methods': 'navigation.labels.paymentMethods',
  'finance treasury receivables': 'navigation.labels.accountsReceivable',
  'finance treasury expenses': 'navigation.labels.expenses',
  'finance treasury payables': 'navigation.labels.accountsPayable',
  'audit trail': 'navigation.labels.auditTrail',
  categories: 'navigation.labels.categories',
  'price types': 'navigation.labels.priceTypes',
  products: 'navigation.labels.products',
  company: 'navigation.labels.company',
  customers: 'navigation.labels.customers',
  suppliers: 'navigation.labels.suppliers',
  departments: 'navigation.labels.departments',
  purchases: 'navigation.labels.purchases',
  roles: 'navigation.labels.roles',
  orders: 'navigation.labels.orders',
  quotes: 'navigation.labels.quotes',
  invoices: 'navigation.labels.invoices',
  returns: 'navigation.labels.returns',
  'credit notes': 'navigation.labels.creditNotes',
  'debit notes': 'navigation.labels.debitNotes',
  'cash register': 'navigation.labels.cashRegister',
  receivables: 'navigation.labels.accountsReceivable',
  warehouses: 'navigation.labels.warehouses',
  users: 'navigation.labels.users',
};

@Component({
  selector: 'app-notification-preferences-card',
  standalone: true,
  imports: [
    ButtonModule,
    FormsModule,
    SelectModule,
    TranslateOptionsPipe,
    TranslatePipe,
    DetailsCardHeaderComponent,
    PanelCardComponent,
    ListFilterComponent,
    NgTemplateOutlet,
  ],
  templateUrl: './notification-preferences-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationPreferencesCardComponent {
  readonly embedded = input(false);
  readonly preferences = inject(NotificationPreferencesService);
  private readonly translations = inject(TranslationService);
  readonly selectedArea = signal<string | null>(null);
  readonly selectedModule = signal<string | null>(null);

  readonly catalog = computed<NotificationArea[]>(() => {
    const modules = this.preferences.modules().map((module) => ({
      ...module,
      labelKey: this.moduleLabelKey(module),
    }));
    const catalog = PERMISSION_CATALOG as unknown as CatalogArea[];
    return catalog
      .map((area) => ({
        ...area,
        sections: area.sections
          .map((section) => ({
            sectionKey: section.sectionKey,
            modules: this.sectionModules(section, modules),
          }))
          .filter((section) => section.modules.length > 0),
      }))
      .filter((area) => area.sections.length > 0);
  });

  readonly areaOptions = computed<readonly ListFilterOption[]>(() =>
    this.catalog().map((area) => ({ labelKey: area.areaKey, value: area.areaKey })),
  );

  readonly moduleOptions = computed<readonly ListFilterOption[]>(() => {
    const selectedArea = this.selectedArea();
    const areas = this.catalog().filter((area) => !selectedArea || area.areaKey === selectedArea);
    const modules = areas.flatMap((area) => area.sections.flatMap((section) => section.modules));
    return [...new Map(modules.map((module) => [module.labelKey, module.labelKey]))].map(
      ([value, labelKey]) => ({ value, labelKey }),
    );
  });

  readonly allModuleOptions = computed<readonly ListFilterOption[]>(() => {
    const modules = this.catalog().flatMap((area) =>
      area.sections.flatMap((section) => section.modules),
    );
    return [...new Map(modules.map((module) => [module.labelKey, module.labelKey]))].map(
      ([value, labelKey]) => ({ value, labelKey }),
    );
  });

  readonly filterFields = computed<readonly ListFilterField[]>(() => [
    {
      key: 'area',
      labelKey: 'platform.notifications.filters.module',
      type: 'select',
      value: this.selectedArea() ?? '',
      options: this.areaOptions(),
    },
    {
      key: 'module',
      labelKey: 'platform.notifications.filters.submodule',
      type: 'select',
      value: this.selectedModule() ?? '',
      options: this.moduleOptions(),
    },
  ]);

  readonly filteredCatalog = computed<NotificationArea[]>(() => {
    const selectedArea = this.selectedArea();
    const selectedModule = this.selectedModule();
    return this.catalog()
      .filter((area) => !selectedArea || area.areaKey === selectedArea)
      .map((area) => ({
        ...area,
        sections: area.sections
          .map((section) => ({
            ...section,
            modules: section.modules.filter(
              (module) => !selectedModule || module.labelKey === selectedModule,
            ),
          }))
          .filter((section) => section.modules.length > 0),
      }))
      .filter((area) => area.sections.length > 0);
  });

  readonly activeFilterCount = computed(
    () => Number(Boolean(this.selectedArea())) + Number(Boolean(this.selectedModule())),
  );

  selectOptions(field: ListFilterField): { label: string; value: string }[] {
    return (field.options ?? []).map((option) => ({ label: option.labelKey, value: option.value }));
  }

  widestLabel(field: ListFilterField): string {
    const options = field.key === 'module' ? this.allModuleOptions() : (field.options ?? []);
    return options
      .map((option) => this.translations.t(option.labelKey))
      .reduce((widest, label) => (label.length > widest.length ? label : widest), '');
  }

  onFilterChange(change: ListFilterChange): void {
    if (change.key === 'area') {
      this.setArea(change.value || null);
      return;
    }
    if (change.key === 'module') {
      this.selectedModule.set(change.value || null);
    }
  }

  setArea(area: string | null): void {
    this.selectedArea.set(area);
    if (
      this.selectedModule() &&
      !this.moduleOptions().some((option) => option.value === this.selectedModule())
    ) {
      this.selectedModule.set(null);
    }
  }

  clearFilters(): void {
    this.selectedArea.set(null);
    this.selectedModule.set(null);
  }

  private sectionModules(
    section: CatalogSection,
    modules: readonly GroupedModule[],
  ): GroupedModule[] {
    const byModule = new Map(modules.map((module) => [module.module, module]));
    return section.modules.flatMap((catalogModule) =>
      (BUSINESS_MODULE_BY_CATALOG_KEY[catalogModule.moduleKey] ?? [])
        .map((module) => byModule.get(module))
        .filter((module): module is GroupedModule => module !== undefined),
    );
  }

  private moduleLabelKey(module: NotificationModulePreference): string {
    return ALIASES[module.module] ?? LABEL_KEYS[module.labelKey.toLowerCase()] ?? module.labelKey;
  }
}
