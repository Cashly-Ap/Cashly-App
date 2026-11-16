import { TranslatePipe } from '@core/i18n/translate.pipe';
import { TranslationService } from '@core/i18n/translation.service';
import { Language } from '@core/i18n/language';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import {
  DetailsCardHeaderComponent,
  DetailsInfoFieldComponent,
  DetailsInfoGridComponent,
} from '@shared/components/details';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import {
  ColorMode,
  ThemeMode,
  UserPreferencesService,
} from '@core/preferences/user-preferences.service';
import { KEYBOARD_ACTION_SHORTCUTS } from '@core/shortcuts/shortcut-reference';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import {
  FormActionsComponent,
  FormContainerComponent,
  FormHeaderComponent,
  SelectInputComponent,
} from '@core/forms/components';
import { NotificationPreferencesCardComponent } from '@features/platform/notifications/components/notification-preferences-card/notification-preferences-card.component';
import { NotificationPreferencesService } from '@features/platform/notifications/services/state/notification-preferences.service';

type PreferencesView = 'display' | 'form';

interface LanguageOption {
  value: Language;
  labelKey: string;
}

interface ThemeOption {
  value: ThemeMode;
  labelKey: string;
  descriptionKey: string;
  icon: string;
}

interface ColorOption {
  value: ColorMode;
  labelKey: string;
  descriptionKey: string;
}

@Component({
  selector: 'app-preferences-page',
  standalone: true,
  imports: [
    PanelCardComponent,
    TranslatePipe,
    ButtonModule,
    TabsModule,
    ToggleSwitchModule,
    ReactiveFormsModule,
    SelectInputComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    PageHeaderComponent,
    FormActionsComponent,
    FormContainerComponent,
    FormHeaderComponent,
    NotificationPreferencesCardComponent,
  ],
  templateUrl: './preferences-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferencesPageComponent {
  private readonly translations = inject(TranslationService);
  private readonly messages = inject(MessageService);
  readonly preferences = inject(UserPreferencesService);
  readonly notifications = inject(NotificationPreferencesService);
  readonly shortcuts = KEYBOARD_ACTION_SHORTCUTS;
  readonly view = signal<PreferencesView>('display');
  readonly hasChanges = signal(false);
  private pendingSave = false;
  readonly form = new FormGroup({
    language: new FormControl<Language>('es', { nonNullable: true }),
    themeMode: new FormControl<ThemeMode>('system', { nonNullable: true }),
    colorMode: new FormControl<ColorMode>('minimal', { nonNullable: true }),
    showShortcutHints: new FormControl<boolean>(true, { nonNullable: true }),
    shortcutsEnabled: new FormControl<boolean>(false, { nonNullable: true }),
  });
  readonly activeTab = signal<string>('general');
  readonly languages: readonly LanguageOption[] = [
    { value: 'es', labelKey: 'shared.language.spanish' },
    { value: 'en', labelKey: 'shared.language.english' },
  ];
  readonly themes: readonly ThemeOption[] = [
    {
      value: 'light',
      labelKey: 'auth.profile.light',
      descriptionKey: 'auth.profile.light.surfaces.and.dark.text',
      icon: 'pi pi-sun',
    },
    {
      value: 'dark',
      labelKey: 'auth.profile.dark',
      descriptionKey: 'auth.profile.dark.surfaces.and.light.text',
      icon: 'pi pi-moon',
    },
    {
      value: 'system',
      labelKey: 'auth.profile.system',
      descriptionKey: 'auth.profile.follows.your.device.appearance',
      icon: 'pi pi-desktop',
    },
  ];
  readonly colors: readonly ColorOption[] = [
    {
      value: 'minimal',
      labelKey: 'auth.profile.minimal',
      descriptionKey: 'auth.profile.neutral.base.with.colors.for.statuses',
    },
    {
      value: 'informative',
      labelKey: 'auth.profile.informative',
      descriptionKey:
        'auth.profile.modules.grouped.by.color.accented.sections.and.more.colorful.charts',
    },
  ];

  readonly languageOptions = computed(() =>
    this.languages.map((language) => ({
      label: this.translations.t(language.labelKey),
      value: language.value,
    })),
  );
  readonly themeOptions = computed(() =>
    this.themes.map((theme) => ({
      label: this.translations.t(theme.labelKey),
      value: theme.value,
    })),
  );
  readonly colorOptions = computed(() =>
    this.colors.map((color) => ({
      label: this.translations.t(color.labelKey),
      value: color.value,
    })),
  );
  readonly shortcutHintOptions = computed(() => [
    { label: this.translations.t('shared.active'), value: true },
    { label: this.translations.t('shared.inactive'), value: false },
  ]);
  readonly canEdit = computed(
    () => !this.preferences.loading() && !this.preferences.saving() && this.preferences.ready(),
  );
  readonly languageLabel = computed(() =>
    this.translations.t(
      this.preferences.language() === 'en' ? 'shared.language.english' : 'shared.language.spanish',
    ),
  );
  readonly themeLabel = computed(() =>
    this.translations.t(
      this.themes.find((theme) => theme.value === this.preferences.themeMode())?.labelKey ??
        this.themes[0].labelKey,
    ),
  );
  readonly colorLabel = computed(() =>
    this.translations.t(
      this.colors.find((color) => color.value === this.preferences.colorMode())?.labelKey ??
        this.colors[0].labelKey,
    ),
  );
  readonly shortcutsLabel = computed(() => this.statusLabel(this.preferences.shortcutsEnabled()));
  readonly shortcutHintsLabel = computed(() =>
    this.statusLabel(this.preferences.showShortcutHints()),
  );
  readonly notificationsLabel = computed(() => this.statusLabel(this.notifications.enabled()));
  readonly enabledNotificationModules = computed(
    () => this.notifications.modules().filter((module) => module.enabled).length,
  );
  readonly notificationModulesLabel = computed(
    () => `${this.enabledNotificationModules()} / ${this.notifications.modules().length}`,
  );

  constructor() {
    effect(() => {
      const values = {
        language: this.preferences.language(),
        themeMode: this.preferences.themeMode(),
        colorMode: this.preferences.colorMode(),
        showShortcutHints: this.preferences.showShortcutHints(),
        shortcutsEnabled: this.preferences.shortcutsEnabled(),
      };
      untracked(() => this.form.patchValue(values, { emitEvent: false }));
    });
    this.form.valueChanges.subscribe(() => this.hasChanges.set(true));
    effect(() => {
      const saving = this.preferences.saving();
      const error = this.preferences.error();
      if (!this.pendingSave || saving) return;
      untracked(() => {
        this.pendingSave = false;
        if (error) return;
        this.messages.add({
          severity: 'success',
          summary: this.translations.t('auth.profile.preferences.saved.summary'),
          detail: this.translations.t('auth.profile.preferences.saved.detail'),
        });
        this.closeForm();
      });
    });
  }

  save(): void {
    if (!this.canEdit() || !this.hasChanges()) return;
    this.pendingSave = true;
    this.preferences.apply(this.form.getRawValue());
  }

  openForm(): void {
    if (!this.canEdit()) return;
    this.activeTab.set('general');
    this.hasChanges.set(false);
    this.view.set('form');
  }

  closeForm(): void {
    this.view.set('display');
  }

  private statusLabel(active: boolean): string {
    return this.translations.t(active ? 'shared.active' : 'shared.inactive');
  }
}
