import { Provider } from '@angular/core';
import { DELETE_HANDLER_PROVIDERS } from '@core/navigation/providers/delete-handlers.providers';
import { CANCEL_HANDLER_PROVIDERS } from '@core/navigation/providers/cancel-handlers.providers';
import { PDF_HANDLER_PROVIDERS } from '@core/navigation/providers/pdf-handlers.providers';
import { ACTION_DIALOG_HANDLER_PROVIDERS } from '@core/navigation/providers/action-dialog-handlers.providers';
import { NAVIGATION_ACTION_HANDLER_PROVIDERS } from '@core/navigation/providers/navigation-action-handlers.providers';
import { DIRECT_NAVIGATION_ACTION_HANDLER_PROVIDERS } from '@core/navigation/providers/direct-navigation-action-handlers.providers';
import { LOOKUP_DEFINITION_PROVIDERS } from '@core/navigation/providers/lookup-definitions.providers';
import { REPORT_ACTION_HANDLER_PROVIDERS } from '@core/navigation/providers/report-action-handlers.providers';
import { GLOBAL_DIALOG_HOST_PROVIDERS } from '@core/navigation/providers/global-dialog-hosts.providers';

export function provideNavigation(): Provider[] {
  return [
    ...DELETE_HANDLER_PROVIDERS,
    ...CANCEL_HANDLER_PROVIDERS,
    ...PDF_HANDLER_PROVIDERS,
    ...ACTION_DIALOG_HANDLER_PROVIDERS,
    ...NAVIGATION_ACTION_HANDLER_PROVIDERS,
    ...DIRECT_NAVIGATION_ACTION_HANDLER_PROVIDERS,
    ...LOOKUP_DEFINITION_PROVIDERS,
    ...REPORT_ACTION_HANDLER_PROVIDERS,
    ...GLOBAL_DIALOG_HOST_PROVIDERS,
  ];
}
