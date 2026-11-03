import { Provider } from '@angular/core';
import { DELETE_HANDLER_PROVIDERS } from '@features/delete-handlers.providers';
import { CANCEL_HANDLER_PROVIDERS } from '@features/cancel-handlers.providers';
import { PDF_HANDLER_PROVIDERS } from '@features/pdf-handlers.providers';
import { ACTION_DIALOG_HANDLER_PROVIDERS } from '@features/action-dialog-handlers.providers';
import { NAVIGATION_ACTION_HANDLER_PROVIDERS } from '@features/navigation-action-handlers.providers';
import { DIRECT_NAVIGATION_ACTION_HANDLER_PROVIDERS } from '@features/direct-navigation-action-handlers.providers';
import { LOOKUP_DEFINITION_PROVIDERS } from '@features/lookup-definitions.providers';
import { REPORT_ACTION_HANDLER_PROVIDERS } from '@features/report-action-handlers.providers';
import { GLOBAL_DIALOG_HOST_PROVIDERS } from '@features/global-dialog-hosts.providers';

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
