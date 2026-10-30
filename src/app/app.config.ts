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
    DialogService,
  ],
};
