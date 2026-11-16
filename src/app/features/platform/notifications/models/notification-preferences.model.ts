export interface NotificationModulePreference {
  module: string;
  labelKey: string;
  enabled: boolean;
}

export interface NotificationPreferences {
  enabled: boolean;
  modules: NotificationModulePreference[];
}

export interface NotificationPreferencesUpdate {
  enabled: boolean;
  modules: { module: string; enabled: boolean }[];
}
