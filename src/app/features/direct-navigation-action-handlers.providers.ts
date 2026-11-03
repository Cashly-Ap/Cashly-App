import { Provider } from '@angular/core';
import { provideDirectNavigationActionHandlers as cashRegister } from '@features/finance/treasury/cash-register/actions/navigation.provider';

export const DIRECT_NAVIGATION_ACTION_HANDLER_PROVIDERS: Provider[] = [
  ...cashRegister(),
];
