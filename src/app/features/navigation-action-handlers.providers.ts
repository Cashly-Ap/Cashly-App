import { Provider } from '@angular/core';
import { provideNavigationActionHandlers as receivables } from '@features/finance/treasury/receivables/actions/navigation.provider';
import { provideNavigationActionHandlers as invoices } from '@features/finance/billing/invoices/actions/navigation.provider';
import { provideNavigationActionHandlers as warehouses } from '@features/inventory/warehouses/actions/navigation.provider';

export const NAVIGATION_ACTION_HANDLER_PROVIDERS: Provider[] = [
  ...receivables(),
  ...invoices(),
  ...warehouses(),
];
