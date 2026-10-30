import { LanguageService } from '@core/i18n/language.service';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PermissionEditorComponent } from './permission-editor.component';
import { AuthorizationService } from '../../../authorization/services/authorization.service';
import { PermissionMatrix, PermissionRegistry } from '../../../authorization/models/access.model';
import { BusinessModule } from '../../../user/models/enums/business-module.enum';

describe('Permission editor', () => {
  let fixture: ComponentFixture<PermissionEditorComponent>;
  let component: PermissionEditorComponent;
  const authorization = { can: vi.fn() };
  const catalog: PermissionRegistry = {
    module: BusinessModule.CATALOG,
    actions: ['READ', 'CREATE', 'UPDATE'],
  };
  const inventory: PermissionRegistry = {
    module: BusinessModule.INVENTORY,
    actions: ['READ', 'EXECUTE'],
  };
  let emitted: PermissionMatrix[];
  beforeEach(() => {
    authorization.can.mockReturnValue(true);
    TestBed.configureTestingModule({
      imports: [PermissionEditorComponent],
      providers: [{ provide: AuthorizationService, useValue: authorization }],
    });
    fixture = TestBed.createComponent(PermissionEditorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('registry', [catalog, inventory]);
    fixture.componentRef.setInput('permissions', {});
    emitted = [];
    component.permissionsChange.subscribe((value) => {
      emitted.push(value);
      fixture.componentRef.setInput('permissions', value);
    });
  });
  it('switches permission labels and search language without changing permission codes', () => {
    fixture.componentRef.setInput('permissions', { [catalog.module]: ['READ'] });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Catálogo');
    TestBed.inject(LanguageService).setLanguage('en');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Catalog');
    expect(fixture.nativeElement.textContent).toContain('Read-only');
    component.search.set('Inventory');
    expect(component.filteredRegistry().map((entry) => entry.module)).toEqual([inventory.module]);
    component.search.set('');
    expect(component.permissions()).toEqual({ [catalog.module]: ['READ'] });
    expect(emitted).toHaveLength(0);
    TestBed.inject(LanguageService).setLanguage('es');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Catálogo');
  });

  it('applies module presets while preserving other modules', () => {
    fixture.componentRef.setInput('permissions', { [inventory.module]: ['READ', 'EXECUTE'] });
    component.setPreset(catalog, 'read');
    expect(emitted.at(-1)).toEqual({
      [catalog.module]: ['READ'],
      [inventory.module]: ['READ', 'EXECUTE'],
    });
    component.setPreset(catalog, 'all');
    expect(component.preset(catalog)).toBe('all');
    component.setPreset(catalog, 'none');
    expect(component.preset(catalog)).toBe('none');
  });
  it('opens custom controls without changing access and enforces READ dependencies', () => {
    component.setPreset(catalog, 'custom');
    expect(emitted).toHaveLength(0);
    expect(component.expanded()[catalog.module]).toBe(true);
    component.toggle(catalog, 'CREATE');
    expect(emitted.at(-1)?.[catalog.module]).toEqual(['READ', 'CREATE']);
    component.toggle(catalog, 'READ');
    expect(emitted.at(-1)?.[catalog.module]).toEqual([]);
  });
  it('opens existing custom grants and allows collapse and reopen without mutation', () => {
    fixture.componentRef.setInput('permissions', { [catalog.module]: ['READ', 'CREATE'] });
    expect(component.isExpanded(catalog)).toBe(true);
    component.setPreset(catalog, 'custom');
    expect(component.isExpanded(catalog)).toBe(false);
    fixture.detectChanges();
    const customButton = fixture.nativeElement.querySelector(
      '[aria-label="Nivel de acceso a Catálogo"] button[aria-expanded]',
    );
    expect(customButton.getAttribute('aria-expanded')).toBe('false');
    component.setPreset(catalog, 'custom');
    expect(component.isExpanded(catalog)).toBe(true);
    fixture.detectChanges();
    expect(customButton.getAttribute('aria-expanded')).toBe('true');
    expect(emitted).toHaveLength(0);
  });
  it.each(['none', 'read', 'all'] as const)(
    'collapses custom controls when selecting %s',
    (preset) => {
      component.setPreset(catalog, 'custom');
      expect(component.isExpanded(catalog)).toBe(true);
      component.setPreset(catalog, preset);
      expect(component.isExpanded(catalog)).toBe(false);
      expect(component.preset(catalog)).toBe(preset);
    },
  );
  it('collapses controls for global presets even if retained grants remain custom', () => {
    fixture.componentRef.setInput('permissions', { [catalog.module]: ['READ', 'CREATE'] });
    authorization.can.mockImplementation((_module, action) => action !== 'CREATE');
    expect(component.isExpanded(catalog)).toBe(true);
    component.applyAll('read');
    expect(component.preset(catalog)).toBe('custom');
    expect(component.isExpanded(catalog)).toBe(false);
  });
  it('applies global presets to every module even when search hides modules', () => {
    component.search.set('Catalogo');
    expect(component.filteredRegistry()).toHaveLength(1);
    component.applyAll('all');
    expect(emitted.at(-1)).toEqual({
      [catalog.module]: catalog.actions,
      [inventory.module]: inventory.actions,
    });
    component.applyAll('read');
    expect(emitted.at(-1)).toEqual({ [catalog.module]: ['READ'], [inventory.module]: ['READ'] });
    component.applyAll('none');
    expect(emitted.at(-1)).toEqual({ [catalog.module]: [], [inventory.module]: [] });
  });
  it('ignores unsupported actions and respects the delegation ceiling', () => {
    authorization.can.mockImplementation((_module, action) => action === 'READ');
    component.toggle(catalog, 'EXPORT');
    component.toggle(catalog, 'CREATE');
    expect(emitted).toHaveLength(0);
    component.applyAll('all');
    expect(emitted.at(-1)?.[catalog.module]).toEqual(['READ']);
  });
  it('preserves inaccessible grants and cannot remove their READ prerequisite', () => {
    fixture.componentRef.setInput('permissions', { [catalog.module]: ['READ', 'UPDATE'] });
    authorization.can.mockImplementation((_module, action) => action !== 'UPDATE');
    component.setPreset(catalog, 'none');
    expect(emitted.at(-1)?.[catalog.module]).toEqual(['READ', 'UPDATE']);
    expect(component.canToggle(catalog, 'READ')).toBe(false);
    const count = emitted.length;
    component.toggle(catalog, 'READ');
    expect(emitted).toHaveLength(count);
  });
  it.each(['protected', 'disabled'])('does not mutate when %s', (input) => {
    fixture.componentRef.setInput(input, true);
    component.setPreset(catalog, 'all');
    component.applyAll('all');
    component.toggle(catalog, 'READ');
    expect(emitted).toHaveLength(0);
  });
  it('refuses grants when READ is unavailable in registry or actor access', () => {
    const noRead: PermissionRegistry = { ...catalog, actions: ['CREATE'] };
    fixture.componentRef.setInput('registry', [noRead]);
    component.setPreset(noRead, 'all');
    component.toggle(noRead, 'CREATE');
    component.applyAll('all');
    expect(emitted.at(-1)).toEqual({});
    fixture.componentRef.setInput('registry', [catalog]);
    authorization.can.mockImplementation((_module, action) => action !== 'READ');
    component.toggle(catalog, 'CREATE');
    component.setPreset(catalog, 'all');
    expect(emitted).toHaveLength(1);
  });
  it('renders only supported custom actions with accessible labels', () => {
    component.setPreset(catalog, 'custom');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Crear');
    expect(fixture.nativeElement.querySelector('[aria-label="Catálogo: Exportar"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Catálogo: Crear"]')).not.toBeNull();
  });
});
