import { TranslationService } from '@core/i18n/translation.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { AppPermission } from '@features/platform/auth/permissions/app-permission';
import { PERMISSION_CATALOG } from '@features/platform/auth/permissions/permission-catalog';
import {
  CatalogArea,
  CatalogModule,
} from '@features/platform/auth/permissions/permission-catalog.types';
import {
  findPermissionModule,
  isRootPermission,
  replaceModulePermissions,
  rootPermission,
  togglePermission,
} from '@features/platform/auth/permissions/permission-dependencies';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';

export type PermissionPreset = 'none' | 'read' | 'custom' | 'all';

import { ListFilterComponent } from '@shared/components/list/list-filter/list-filter.component';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
@Component({
  selector: 'app-permission-editor',
  standalone: true,
  imports: [
    SearchFieldComponent,
    ListFilterComponent,
    TranslatePipe,
    FormsModule,
    ButtonModule,
    CheckboxModule,
    PopoverModule,
    SelectModule,
  ],
  templateUrl: './permission-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionEditorComponent {
  private readonly translations = inject(TranslationService);
  private readonly authorization = inject(AuthorizationService);

  readonly permissions = input.required<AppPermission[]>();
  readonly protected = input(false);
  readonly disabled = input(false);
  readonly permissionsChange = output<AppPermission[]>();

  readonly presetOptions: { value: PermissionPreset; labelKey: string }[] = [
    { value: 'none', labelKey: 'platform.auth.role.noAccess' },
    { value: 'read', labelKey: 'platform.auth.role.readOnly' },
    { value: 'custom', labelKey: 'platform.auth.role.customAccess' },
    { value: 'all', labelKey: 'platform.auth.role.allModuleActions' },
  ];

  readonly areas = PERMISSION_CATALOG as readonly CatalogArea[];
  readonly modules = this.areas.flatMap((area) =>
    area.sections.flatMap((section) => section.modules),
  );
  readonly search = signal('');
  readonly parentFilter = signal('');
  readonly childFilter = signal('');
  readonly expanded = signal<Record<string, boolean>>({});

  readonly allPermissions = computed(() =>
    this.areas.flatMap((area) =>
      area.sections.flatMap((section) =>
        section.modules.flatMap((module) =>
          module.permissions.map((permission) => permission.code),
        ),
      ),
    ),
  );

  readonly totalPermissions = computed(() => this.allPermissions().length);
  readonly selectedCount = computed(() => this.permissions().length);
  readonly filterActive = computed(() => !!this.parentFilter() || !!this.childFilter());

  readonly parentOptions = computed(() =>
    this.areas.map((area) => ({
      label: this.translations.t(area.areaKey),
      value: area.areaKey,
    })),
  );

  readonly childOptions = computed(() =>
    this.areas
      .filter((area) => !this.parentFilter() || area.areaKey === this.parentFilter())
      .flatMap((area) =>
        area.sections.flatMap((section) =>
          section.modules.map((module) => ({
            label: this.translations.t(module.moduleKey),
            value: module.moduleKey,
          })),
        ),
      ),
  );

  readonly allChildOptions = computed(() =>
    this.modules.map((module) => ({
      label: this.translations.t(module.moduleKey),
      value: module.moduleKey,
    })),
  );

  readonly widestParentLabel = computed(() =>
    this.widestLabel([
      ...this.parentOptions().map((option) => option.label),
      this.translations.t('platform.auth.role.parentModule'),
    ]),
  );

  readonly widestChildLabel = computed(() =>
    this.widestLabel([
      ...this.allChildOptions().map((option) => option.label),
      this.translations.t('platform.auth.role.childModule'),
    ]),
  );

  readonly filteredCatalog = computed<readonly CatalogArea[]>(() => {
    const term = this.normalize(this.search().trim());
    const parent = this.parentFilter();
    const child = this.childFilter();
    return this.areas
      .filter((area) => !parent || area.areaKey === parent)
      .map((area) => ({
        ...area,
        sections: area.sections
          .map((section) => ({
            ...section,
            modules: section.modules.filter(
              (module) =>
                (!child || module.moduleKey === child) &&
                (!term ||
                  this.normalize(this.translations.t(area.areaKey)).includes(term) ||
                  (section.sectionKey &&
                    this.normalize(this.translations.t(section.sectionKey)).includes(term)) ||
                  this.normalize(this.translations.t(module.moduleKey)).includes(term) ||
                  module.permissions.some((permission) =>
                    this.normalize(this.translations.t(permission.labelKey)).includes(term),
                  )),
            ),
          }))
          .filter((section) => section.modules.length > 0),
      }))
      .filter((area) => area.sections.length > 0);
  });

  clearFilters(): void {
    this.parentFilter.set('');
    this.childFilter.set('');
  }

  selected(code: AppPermission): boolean {
    return this.permissions().includes(code);
  }

  canToggle(code: AppPermission): boolean {
    if (this.disabled() || this.protected() || !this.authorization.can(code)) return false;
    const module = findPermissionModule(this.modules, code);
    const root = module ? rootPermission(module) : undefined;
    return !root || root === code || this.authorization.can(root);
  }

  allowed(code: AppPermission): boolean {
    return this.authorization.can(code);
  }

  editable(module: CatalogModule): boolean {
    const root = rootPermission(module);
    return (
      !this.disabled() &&
      !this.protected() &&
      (!root || this.authorization.can(root)) &&
      module.permissions.some((permission) => this.authorization.can(permission.code))
    );
  }

  preset(module: CatalogModule): PermissionPreset {
    const selected = module.permissions.filter((permission) => this.selected(permission.code));
    if (selected.length === 0) return 'none';
    if (selected.length === module.permissions.length) return 'all';
    if (selected.length === 1 && this.isViewCode(selected[0].code)) return 'read';
    return 'custom';
  }

  isExpanded(module: CatalogModule): boolean {
    return this.expanded()[module.moduleKey] ?? true;
  }

  setPreset(module: CatalogModule, preset: PermissionPreset): void {
    if (!this.editable(module)) return;
    if (preset === 'custom') {
      this.expanded.update((value) => ({ ...value, [module.moduleKey]: true }));
      return;
    }
    this.expanded.update((value) => ({ ...value, [module.moduleKey]: false }));
    const root = rootPermission(module);
    const canGrantRoot = !root || this.authorization.can(root);
    const selected = module.permissions
      .map((permission) => permission.code)
      .filter((code) => {
        if (preset === 'none' || !canGrantRoot) return false;
        if (preset === 'read') return isRootPermission(code);
        return this.authorization.can(code);
      });
    const next = replaceModulePermissions(this.permissions(), module, selected);
    this.permissionsChange.emit(next);
  }

  applyAll(preset: 'none' | 'read' | 'all'): void {
    if (this.disabled() || this.protected()) return;
    if (preset === 'none') {
      this.permissionsChange.emit([]);
      return;
    }
    const selected = this.modules.flatMap((module) => {
      const root = rootPermission(module);
      if (root && !this.authorization.can(root)) return [];
      return module.permissions
        .map((permission) => permission.code)
        .filter((code) => {
          if (preset === 'read') return isRootPermission(code);
          return this.authorization.can(code);
        });
    });
    this.permissionsChange.emit(selected);
  }

  toggle(code: AppPermission): void {
    if (!this.canToggle(code)) return;
    const current = this.permissions();
    const next = togglePermission(
      this.modules,
      current,
      code,
      !current.includes(code),
      (permission) => this.authorization.can(permission),
    );
    if (next.length === current.length && next.every((permission) => current.includes(permission)))
      return;
    this.permissionsChange.emit(next);
  }

  private isViewCode(code: AppPermission): boolean {
    return isRootPermission(code);
  }

  private widestLabel(labels: readonly string[]): string {
    return labels.reduce((widest, label) => (label.length > widest.length ? label : widest), '');
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es');
  }
}
