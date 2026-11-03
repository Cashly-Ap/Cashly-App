import { provideTranslatedConfirmation, provideTranslatedMessages } from '@core/i18n/translated-feedback.service';
import { languageInterceptor } from '@core/i18n/language.interceptor';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { routes } from '@app/app.routes';
import { authInterceptor } from '@features/platform/auth/interceptors/auth.interceptor';
import { CashlyPreset } from '@core/theme/presets';
import { DELETE_HANDLER_PROVIDERS } from '@features/delete-handlers.providers';
import { CANCEL_HANDLER_PROVIDERS } from '@features/cancel-handlers.providers';
import { PDF_HANDLER_PROVIDERS } from '@features/pdf-handlers.providers';
import { ACTION_DIALOG_HANDLER_PROVIDERS } from '@features/action-dialog-handlers.providers';
import { NAVIGATION_ACTION_HANDLER_PROVIDERS } from '@features/navigation-action-handlers.providers';
import { DIRECT_NAVIGATION_ACTION_HANDLER_PROVIDERS } from '@features/direct-navigation-action-handlers.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([languageInterceptor, authInterceptor])),
    providePrimeNG({
      theme: {
        preset: CashlyPreset,
        options: {
          darkModeSelector: '.my-app-dark',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
    }),
    provideCharts(withDefaultRegisterables()),
    provideTranslatedMessages(),
    provideTranslatedConfirmation(),
    ...DELETE_HANDLER_PROVIDERS,
    ...CANCEL_HANDLER_PROVIDERS,
    ...PDF_HANDLER_PROVIDERS,
    ...ACTION_DIALOG_HANDLER_PROVIDERS,
    ...NAVIGATION_ACTION_HANDLER_PROVIDERS,
    ...DIRECT_NAVIGATION_ACTION_HANDLER_PROVIDERS,
    DialogService,
  ],
};
