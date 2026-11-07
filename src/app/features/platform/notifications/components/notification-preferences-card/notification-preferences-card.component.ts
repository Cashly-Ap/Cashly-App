import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { DetailsCardHeaderComponent } from '@shared/components/details';
import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { PERMISSION_CATALOG } from '@features/platform/auth/permissions/permission-catalog';
import { NotificationPreferencesService } from '@features/platform/notifications/services/state/notification-preferences.service';
import { NotificationModulePreference } from '@features/platform/notifications/models/notification-preferences.model';

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
  'navigation.labels.accountsReceivable': [
    'FINANCE_TREASURY_RECEIVABLES',
    'FINANCE_RECEIVABLES',
    'RECEIVABLE',
  ],
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
  imports: [ButtonModule, TranslatePipe, DetailsCardHeaderComponent, PanelCardComponent],
  templateUrl: './notification-preferences-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationPreferencesCardComponent {
  readonly preferences = inject(NotificationPreferencesService);

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
