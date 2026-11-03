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
    return !this.disabled() && !this.protected() && this.authorization.can(code);
  }

  allowed(code: AppPermission): boolean {
    return this.authorization.can(code);
  }

  editable(module: CatalogModule): boolean {
    return (
      !this.disabled() &&
      !this.protected() &&
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
    const next = new Set(this.permissions());
    for (const permission of module.permissions) next.delete(permission.code);
    if (preset === 'all') {
      for (const permission of module.permissions) {
        if (this.authorization.can(permission.code)) next.add(permission.code);
      }
    }
    if (preset === 'read') {
      const view = this.viewCode(module);
      if (view && this.authorization.can(view)) next.add(view);
    }
    this.permissionsChange.emit([...next]);
  }

  applyAll(preset: 'none' | 'read' | 'all'): void {
    if (this.disabled() || this.protected()) return;
    const next = new Set(this.permissions());
    for (const code of this.allPermissions()) next.delete(code);
    if (preset === 'all') {
      for (const code of this.allPermissions()) {
        if (this.authorization.can(code)) next.add(code);
      }
    }
    if (preset === 'read') {
      for (const area of this.areas) {
        for (const section of area.sections) {
          for (const module of section.modules) {
            const view = this.viewCode(module);
            if (view && this.authorization.can(view)) next.add(view);
          }
        }
      }
    }
    this.permissionsChange.emit([...next]);
  }

  toggle(code: AppPermission): void {
    if (!this.canToggle(code)) return;
    const next = new Set(this.permissions());
    if (next.has(code)) next.delete(code);
    else next.add(code);
    this.permissionsChange.emit([...next]);
  }

  private viewCode(module: CatalogModule): AppPermission | undefined {
    return module.permissions.find((permission) => this.isViewCode(permission.code))?.code;
  }

  private isViewCode(code: AppPermission): boolean {
    return code.endsWith('_VIEW_LIST') || code === 'DASHBOARD_VIEW' || code === 'COMPANY_VIEW';
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es');
  }
}
