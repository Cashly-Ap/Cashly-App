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
import { InputTextModule } from 'primeng/inputtext';
import {
  PermissionAction,
  PermissionMatrix,
  PermissionRegistry,
} from '../../../authorization/models/access.model';
import { AuthorizationService } from '../../../authorization/services/authorization.service';
import {
  BusinessModule,
  BUSINESS_MODULE_LABELS,
} from '../../../user/models/enums/business-module.enum';

export type PermissionPreset = 'none' | 'read' | 'custom' | 'all';

@Component({
  selector: 'app-permission-editor',
  standalone: true,
  imports: [TranslatePipe, FormsModule, ButtonModule, CheckboxModule, InputTextModule],
  templateUrl: './permission-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionEditorComponent {
  private readonly translations = inject(TranslationService);
  private readonly authorization = inject(AuthorizationService);
  readonly registry = input.required<PermissionRegistry[]>();
  readonly permissions = input.required<PermissionMatrix>();
  readonly protected = input(false);
  readonly disabled = input(false);
  readonly permissionsChange = output<PermissionMatrix>();
  readonly presetOptions: { value: PermissionPreset; label: string }[] = [
    { value: 'none', label: 'Sin acceso' },
    { value: 'read', label: 'Solo lectura' },
    { value: 'custom', label: 'Personalizar' },
    { value: 'all', label: 'Todo disponible' },
  ];
  readonly search = signal('');
  readonly expanded = signal<Partial<Record<BusinessModule, boolean>>>({});
  readonly labels = BUSINESS_MODULE_LABELS;
  readonly actionLabels: Record<PermissionAction, string> = {
    READ: 'Consultar',
    CREATE: 'Crear',
    UPDATE: 'Editar',
    DELETE: 'Eliminar',
    EXPORT: 'Exportar',
    IMPORT: 'Importar',
    EXECUTE: 'Ejecutar',
  };
  readonly descriptions: Record<PermissionAction, string> = {
    READ: 'Ver listados y detalles',
    CREATE: 'Añadir nuevos registros',
    UPDATE: 'Modificar registros existentes',
    DELETE: 'Borrar registros',
    EXPORT: 'Descargar datos e informes',
    IMPORT: 'Cargar datos desde archivos',
    EXECUTE: 'Realizar operaciones del módulo',
  };
  readonly filteredRegistry = computed(() => {
    const normalize = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('es');
    const term = normalize(this.search().trim());
    return this.registry().filter((entry) =>
      normalize(this.translations.t(this.labels[entry.module])).includes(term),
    );
  });
  readonly selectedCount = computed(
    () => this.registry().filter((entry) => this.selected(entry.module, 'READ')).length,
  );

  selected(module: BusinessModule, action: PermissionAction): boolean {
    return this.permissions()[module]?.includes(action) ?? false;
  }
  allowed(entry: PermissionRegistry, action: PermissionAction): boolean {
    const registered = this.registry().find((value) => value.module === entry.module);
    return (
      !!registered?.actions.includes(action) &&
      registered.actions.includes('READ') &&
      entry.actions.includes(action) &&
      this.authorization.can(entry.module, action) &&
      entry.actions.includes('READ') &&
      this.authorization.can(entry.module, 'READ')
    );
  }
  editable(entry: PermissionRegistry): boolean {
    return !this.disabled() && !this.protected() && this.allowed(entry, 'READ');
  }
  preset(entry: PermissionRegistry): PermissionPreset {
    const selected = entry.actions.filter((action) => this.selected(entry.module, action));
    if (!selected.length) return 'none';
    if (selected.length === 1 && selected[0] === 'READ') return 'read';
    if (selected.length === entry.actions.length) return 'all';
    return 'custom';
  }
  isExpanded(entry: PermissionRegistry): boolean {
    return this.expanded()[entry.module] ?? this.preset(entry) === 'custom';
  }
  setPreset(entry: PermissionRegistry, preset: PermissionPreset): void {
    if (!this.editable(entry)) return;
    if (preset === 'custom') {
      const expanded = !this.isExpanded(entry);
      this.expanded.update((value) => ({ ...value, [entry.module]: expanded }));
      return;
    }
    this.expanded.update((value) => ({ ...value, [entry.module]: false }));
    this.permissionsChange.emit(this.withPreset(this.permissions(), entry, preset));
  }
  applyAll(preset: 'none' | 'read' | 'all'): void {
    if (this.disabled() || this.protected()) return;
    let matrix = this.permissions();
    for (const entry of this.registry()) {
      if (this.editable(entry)) {
        matrix = this.withPreset(matrix, entry, preset);
        this.expanded.update((value) => ({ ...value, [entry.module]: false }));
      }
    }
    this.permissionsChange.emit(matrix);
  }
  canToggle(entry: PermissionRegistry, action: PermissionAction): boolean {
    return (
      this.editable(entry) &&
      this.allowed(entry, action) &&
      !(
        action === 'READ' &&
        this.selected(entry.module, 'READ') &&
        (this.permissions()[entry.module] ?? []).some((grant) => !this.allowed(entry, grant))
      )
    );
  }
  toggle(entry: PermissionRegistry, action: PermissionAction): void {
    if (!this.canToggle(entry, action)) return;
    let grants = [...(this.permissions()[entry.module] ?? [])];
    if (grants.includes(action)) {
      if (action === 'READ' && grants.some((value) => !this.allowed(entry, value))) return;
      grants = action === 'READ' ? [] : grants.filter((value) => value !== action);
    } else {
      grants.push(action);
      if (!grants.includes('READ')) grants.unshift('READ');
    }
    this.permissionsChange.emit({ ...this.permissions(), [entry.module]: grants });
  }
  private withPreset(
    matrix: PermissionMatrix,
    entry: PermissionRegistry,
    preset: 'none' | 'read' | 'all',
  ): PermissionMatrix {
    const retained = (matrix[entry.module] ?? []).filter((action) => !this.allowed(entry, action));
    const grants =
      preset === 'all'
        ? entry.actions.filter((action) => this.allowed(entry, action))
        : preset === 'read'
          ? ['READ' as const]
          : [];
    const next = [...new Set([...retained, ...grants])];
    if (next.length && !next.includes('READ')) next.unshift('READ');
    return { ...matrix, [entry.module]: next };
  }
}
