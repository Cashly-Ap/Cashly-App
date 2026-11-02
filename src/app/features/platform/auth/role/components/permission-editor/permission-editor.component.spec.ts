import { LanguageService } from '@core/i18n/language.service';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PermissionEditorComponent } from './permission-editor.component';
import { AuthorizationService } from '../../../authorization/services/authorization.service';
import { PermissionMatrix, PermissionRegistry } from '../../../authorization/models/access.model';
import {
  BusinessModule,
  BUSINESS_MODULE_LABELS,
} from '../../../user/models/enums/business-module.enum';
import { MENU_AREA_ORDER } from '@core/layouts/config/menu-order.config';
import { buildMenuItems } from '@core/layouts/config/menu.config';
import { MenuItem } from '@core/layouts/models';

describe('Permission editor', () => {
  let fixture: ComponentFixture<PermissionEditorComponent>;
  let component: PermissionEditorComponent;
  const authorization = { can: vi.fn() };
  const catalog: PermissionRegistry = {
    module: BusinessModule.CATALOG_PRODUCTS,
    actions: ['READ', 'CREATE', 'UPDATE'],
  };
  const inventory: PermissionRegistry = {
    module: BusinessModule.INVENTORY_WAREHOUSES,
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
    expect(fixture.nativeElement.textContent).toContain('Productos');
    TestBed.inject(LanguageService).setLanguage('en');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Products');
    expect(fixture.nativeElement.textContent).toContain('Read-only');
    component.search.set('Warehouses');
    expect(component.filteredRegistry().map((entry) => entry.module)).toEqual([inventory.module]);
    component.search.set('');
    expect(component.permissions()).toEqual({ [catalog.module]: ['READ'] });
    expect(emitted).toHaveLength(0);
    TestBed.inject(LanguageService).setLanguage('es');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Productos');
  });
  it('groups catalog modules by parent and filters by parent and child', () => {
    fixture.componentRef.setInput('catalog', [
      { module: catalog.module, parent: 'Catálogo', sortOrder: 2, groups: [] },
      { module: inventory.module, parent: 'Inventario', sortOrder: 1, groups: [] },
    ]);
    expect(component.groupedRegistry().map((group) => group.parent)).toEqual(['Catálogo', 'Inventario']);
    component.parentFilter.set('Catálogo');
    expect(component.filteredRegistry().map((entry) => entry.module)).toEqual([catalog.module]);
    component.childFilter.set(inventory.module);
    expect(component.filteredRegistry()).toEqual([]);
    component.clearFilters();
    component.childFilter.set(inventory.module);
    expect(component.filteredRegistry().map((entry) => entry.module)).toEqual([inventory.module]);
  });

  it('keeps platform last and groups customers and suppliers under contacts', () => {
    fixture.componentRef.setInput('catalog', [
      { module: BusinessModule.USERS, parent: 'Platform', sortOrder: 1, groups: [] },
      { module: BusinessModule.CONTACTS_CUSTOMERS, parent: 'Contacts', sortOrder: 2, groups: [] },
      { module: BusinessModule.CONTACTS_SUPPLIERS, parent: 'Contacts', sortOrder: 1, groups: [] },
    ]);
    fixture.componentRef.setInput('registry', [
      { module: BusinessModule.USERS, actions: ['READ'] },
      { module: BusinessModule.CONTACTS_CUSTOMERS, actions: ['READ'] },
      { module: BusinessModule.CONTACTS_SUPPLIERS, actions: ['READ'] },
    ]);
    expect(component.groupedRegistry().map((group) => group.parent)).toEqual(['Contacts', 'Platform']);
    expect(component.groupedRegistry()[0].entries.map((entry) => entry.module)).toEqual([
      BusinessModule.CONTACTS_CUSTOMERS,
      BusinessModule.CONTACTS_SUPPLIERS,
    ]);
  });

  it('orders areas and modules exactly like the navbar, ignoring backend sortOrder', () => {
    const navbarOrder = MENU_AREA_ORDER.map((area) => ({ area: area.area, modules: [...area.modules] }));
    const registryAll: PermissionRegistry[] = MENU_AREA_ORDER.flatMap((area) => area.modules).map(
      (module) => ({ module, actions: ['READ'] }),
    ).reverse();
    fixture.componentRef.setInput('registry', registryAll);
    fixture.componentRef.setInput(
      'catalog',
      MENU_AREA_ORDER.flatMap((area, areaIndex) =>
        area.modules.map((module, moduleIndex) => ({
          module,
          parent: area.area,
          sortOrder: 100 - areaIndex * 10 - moduleIndex,
          groups: [],
        })),
      ),
    );
    expect(component.groupedRegistry().map((group) => group.parent)).toEqual(
      navbarOrder.map((area) => area.area),
    );
    expect(
      component.groupedRegistry().map((group) => group.entries.map((entry) => entry.module)),
    ).toEqual(navbarOrder.map((area) => area.modules));
    expect(component.childOptions().map((option) => option.value)).toEqual(
      navbarOrder.flatMap((area) => area.modules),
    );
  });

  it('derives the same area and module order from the navbar menu', () => {
    const menu = buildMenuItems({
      openListAction: vi.fn(),
      openCustomerEditPicker: vi.fn(),
      openCustomerBalancePicker: vi.fn(),
      openCatalogModal: vi.fn(),
      openCommercialCatalogModal: vi.fn(),
      openStockModal: vi.fn(),
      openMovementsModal: vi.fn(),
      openOrdersPdfModal: vi.fn(),
      openInvoicesPdfModal: vi.fn(),
      openQuotesPdfModal: vi.fn(),
      openAccountsReceivablePdfModal: vi.fn(),
      openCashRegisterModal: vi.fn(),
      openPurchasesPdfModal: vi.fn(),
    });
    const crossAreaAction = (item: MenuItem) =>
      !item.routerLink && ['CREATE', 'CONFIRM', 'CANCEL'].includes(item.requiredAction ?? '');
    const collect = (items: MenuItem[]): BusinessModule[] =>
      items.flatMap((item) => [
        ...(item.requiredModule && !crossAreaAction(item) ? [item.requiredModule] : []),
        ...collect(item.children ?? []),
      ]);
    const navbarModules = menu.map((area) => [...new Set(collect([area]))]);
    expect(menu.map((area) => area.label)).toEqual(MENU_AREA_ORDER.map((area) => area.area));
    expect(navbarModules).toEqual(MENU_AREA_ORDER.map((area) => area.modules));
  });

  it('shows area titles in sentence case without uppercase styling', () => {
    fixture.componentRef.setInput('catalog', [
      { module: catalog.module, parent: 'Catálogo', sortOrder: 1, groups: [] },
    ]);
    fixture.detectChanges();
    const heading = fixture.nativeElement.querySelector('h3');
    expect(heading.textContent.trim()).toBe('Catálogo');
    expect(heading.className).not.toContain('uppercase');
    expect(fixture.nativeElement.innerHTML).not.toMatch(/uppercase|text-transform/);
  });

  it('hides an internal group heading that repeats the module name', () => {
    fixture.componentRef.setInput('catalog', [
      {
        module: BusinessModule.INVENTORY_WAREHOUSES,
        parent: 'Inventario',
        sortOrder: 1,
        groups: [
          {
            key: 'module',
            labelKey: BUSINESS_MODULE_LABELS[BusinessModule.INVENTORY_WAREHOUSES],
            permissions: [{ action: 'READ', labelKey: 'platform.auth.permissionActionRead', descriptionKey: 'platform.auth.viewListsAndDetails' }],
          },
        ],
      },
    ]);
    fixture.componentRef.setInput('registry', [
      { module: BusinessModule.INVENTORY_WAREHOUSES, actions: ['READ'] },
    ]);
    fixture.detectChanges();
    const section = fixture.nativeElement.querySelector('section');
    expect(section.querySelectorAll('h4')).toHaveLength(0);
    expect(section.textContent).toContain('Ver');
  });

  it('keeps internal group headings that differ from the module name', () => {
    fixture.componentRef.setInput('catalog', [
      {
        module: BusinessModule.INVENTORY_WAREHOUSES,
        parent: 'Inventario',
        sortOrder: 1,
        groups: [
          {
            key: 'stock',
            labelKey: 'platform.auth.permissionActionRead',
            permissions: [{ action: 'READ', labelKey: 'platform.auth.permissionActionRead', descriptionKey: 'platform.auth.viewListsAndDetails' }],
          },
        ],
      },
    ]);
    fixture.componentRef.setInput('registry', [
      { module: BusinessModule.INVENTORY_WAREHOUSES, actions: ['READ'] },
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('section h4')).not.toBeNull();
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
  it('always shows the detailed permissions without mutating them', () => {
    fixture.componentRef.setInput('permissions', { [catalog.module]: ['READ', 'CREATE'] });
    expect(component.isExpanded(catalog)).toBe(true);
    component.setPreset(catalog, 'custom');
    expect(component.isExpanded(catalog)).toBe(true);
    fixture.detectChanges();
    const customButton = fixture.nativeElement.querySelector(
      '[aria-label="Nivel de acceso a Productos"] button[aria-expanded]',
    );
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
    component.search.set('Productos');
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
    expect(fixture.nativeElement.querySelector('[aria-label="Productos: Exportar"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Productos: Crear"]')).not.toBeNull();
  });
});
