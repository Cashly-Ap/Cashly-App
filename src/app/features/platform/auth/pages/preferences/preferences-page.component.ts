import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Language } from '@core/i18n/language';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DetailsCardHeaderComponent } from '@shared/components/details';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import {
  ColorMode,
  ThemeMode,
  UserPreferencesService,
} from '@core/preferences/user-preferences.service';
import { KEYBOARD_ACTION_SHORTCUTS } from '@core/shortcuts/shortcut-reference';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { NotificationPreferencesCardComponent } from '@features/platform/notifications/components/notification-preferences-card/notification-preferences-card.component';

@Component({
  selector: 'app-preferences-page',
  standalone: true,
  imports: [
    PanelCardComponent,
    TranslatePipe,
    ButtonModule,
    DetailsCardHeaderComponent,
    PageHeaderComponent,
    NotificationPreferencesCardComponent,
  ],
  templateUrl: './preferences-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferencesPageComponent {
  readonly preferences = inject(UserPreferencesService);
  readonly shortcuts = KEYBOARD_ACTION_SHORTCUTS;
  readonly languages: { value: Language; label: string }[] = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
  ];
  readonly themes: { value: ThemeMode; label: string; icon: string; description: string }[] = [
    {
      value: 'light',
      label: 'Claro',
      icon: 'pi pi-sun',
      description: 'Superficies claras y texto oscuro.',
    },
    {
      value: 'dark',
      label: 'Oscuro',
      icon: 'pi pi-moon',
      description: 'Superficies oscuras y texto claro.',
    },
    {
      value: 'system',
      label: 'Del sistema',
      icon: 'pi pi-desktop',
      description: 'Sigue la apariencia de tu dispositivo.',
    },
  ];
  readonly colors: { value: ColorMode; label: string; description: string }[] = [
    {
      value: 'minimal',
      label: 'Minimalista',
      description: 'La apariencia actual: base neutra y colores para los estados.',
    },
    {
      value: 'informative',
      label: 'Informativo',
      description: 'Módulos agrupados por color, secciones con acentos y gráficos más coloridos.',
    },
  ];
}
