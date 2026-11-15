import { LanguageService } from '@core/i18n/language.service';
import { UserPreferencesService } from '@core/preferences/user-preferences.service';
import { NavigationHistoryService } from '@core/navigation/navigation-history.service';
import { ThemeService } from '@core/theme/components/theme-toggle/theme.service';
import { Component, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { PdfViewerDialogComponent } from '@core/pdf-viewer';
import { NotificationPreferencesService } from '@features/platform/notifications/services/state/notification-preferences.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, PdfViewerDialogComponent],
  template: `
    <p-toast
      position="top-right"
      [life]="5000"
      [baseZIndex]="10000"
      [preventOpenDuplicates]="true"
      styleClass="cashly-toast"
    ></p-toast>
    <router-outlet></router-outlet>
    <app-pdf-viewer-dialog />
  `,
})
export class App {
  private readonly preferences = inject(UserPreferencesService);
  private readonly language = inject(LanguageService);

  constructor() {
    effect(() => this.language.setLanguage(this.preferences.language()));
  }

  private readonly theme = inject(ThemeService);
  private readonly navigationHistory = inject(NavigationHistoryService);
  private readonly notificationPreferences = inject(NotificationPreferencesService);
}
