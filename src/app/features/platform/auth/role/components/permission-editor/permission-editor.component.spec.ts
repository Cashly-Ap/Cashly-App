import { LanguageService } from '@core/i18n/language.service';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PermissionEditorComponent } from '@features/platform/auth/role/components/permission-editor/permission-editor.component';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { AppPermission } from '@features/platform/auth/permissions/app-permission';

describe('Permission editor', () => {
  let fixture: ComponentFixture<PermissionEditorComponent>;
  let component: PermissionEditorComponent;
  const authorization = { can: vi.fn() };
  let emitted: AppPermission[][];

  beforeEach(() => {
    authorization.can.mockReturnValue(true);
    TestBed.configureTestingModule({
      imports: [PermissionEditorComponent],
      providers: [{ provide: AuthorizationService, useValue: authorization }],
    });
    fixture = TestBed.createComponent(PermissionEditorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('permissions', []);
    emitted = [];
    component.permissionsChange.subscribe((value) => {
      emitted.push(value);
      fixture.componentRef.setInput('permissions', value);
    });
  });

  it('renders the literal menu use cases with their translations', () => {
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Ventas');
    expect(text).toContain('Pedidos');
    expect(text).toContain('Ver pedidos');
    expect(text).toContain('Ver detalle de pedido');
    expect(text).toContain('Convertir a factura');
    expect(text).toContain('Cancelar pedido');
  });

  it('translates labels without changing permission codes', () => {
    fixture.detectChanges();
    TestBed.inject(LanguageService).setLanguage('en');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Sales');
    expect(text).toContain('Orders');
    expect(text).toContain('View orders');
    expect(component.allPermissions()).toContain('SALES_ORDERS_VIEW_LIST');
    TestBed.inject(LanguageService).setLanguage('es');
  });

  it('groups Finance into Billing and Treasury', () => {
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Facturación');
    expect(text).toContain('Tesorería');
    expect(component.allPermissions()).toContain('FINANCE_BILLING_INVOICES_VIEW_LIST');
    expect(component.allPermissions()).toContain('FINANCE_TREASURY_CASH_REGISTER_VIEW_LIST');
  });

  it('includes Company under Platform', () => {
    fixture.detectChanges();
    expect(component.allPermissions()).toContain('COMPANY_VIEW');
    expect(component.allPermissions()).toContain('COMPANY_EDIT');
    expect(fixture.nativeElement.textContent).toContain('Compañía');
    expect(fixture.nativeElement.textContent).toContain('Editar compañía');
  });

  it('filters by area and module', () => {
    component.parentFilter.set('navigation.labels.finance');
    expect(
      component
        .filteredCatalog()
        .flatMap((area) => area.sections.flatMap((section) => section.modules))
        .map((module) => module.moduleKey),
    ).toContain('navigation.labels.invoices');
    component.childFilter.set('navigation.labels.cashRegister');
    expect(
      component
        .filteredCatalog()
        .flatMap((area) => area.sections.flatMap((section) => section.modules))
        .map((module) => module.moduleKey),
    ).toEqual(['navigation.labels.cashRegister']);
  });

  it('selects and removes individual permissions', () => {
    component.toggle('SALES_ORDERS_CONFIRM');
    expect(emitted.at(-1)).toEqual(['SALES_ORDERS_CONFIRM']);
    component.toggle('SALES_ORDERS_CONFIRM');
    expect(emitted.at(-1)).toEqual([]);
  });

  it('applies module presets', () => {
    component.setPreset(
      { moduleKey: 'navigation.labels.orders', permissions: [
        { code: 'SALES_ORDERS_VIEW_LIST', labelKey: 'sales.orders.permissions.viewList' },
        { code: 'SALES_ORDERS_EDIT', labelKey: 'sales.orders.permissions.edit' },
        { code: 'SALES_ORDERS_CREATE', labelKey: 'sales.orders.permissions.create' },
      ] },
      'read',
    );
    expect(emitted.at(-1)).toEqual(['SALES_ORDERS_VIEW_LIST']);
    component.setPreset(
      { moduleKey: 'navigation.labels.orders', permissions: [
        { code: 'SALES_ORDERS_VIEW_LIST', labelKey: 'sales.orders.permissions.viewList' },
        { code: 'SALES_ORDERS_EDIT', labelKey: 'sales.orders.permissions.edit' },
        { code: 'SALES_ORDERS_CREATE', labelKey: 'sales.orders.permissions.create' },
      ] },
      'all',
    );
    expect(emitted.at(-1)).toEqual([
      'SALES_ORDERS_VIEW_LIST',
      'SALES_ORDERS_EDIT',
      'SALES_ORDERS_CREATE',
    ]);
  });

  it('applies global presets to every catalog permission', () => {
    component.applyAll('all');
    expect(emitted.at(-1)).toHaveLength(component.totalPermissions());
    component.applyAll('read');
    expect(emitted.at(-1)).toContain('SALES_ORDERS_VIEW_LIST');
    expect(emitted.at(-1)).not.toContain('SALES_ORDERS_EDIT');
    component.applyAll('none');
    expect(emitted.at(-1)).toEqual([]);
  });

  it('does not mutate when protected or disabled', () => {
    fixture.componentRef.setInput('protected', true);
    component.toggle('SALES_ORDERS_EDIT');
    component.applyAll('all');
    expect(emitted).toHaveLength(0);
    fixture.componentRef.setInput('protected', false);
    fixture.componentRef.setInput('disabled', true);
    component.toggle('SALES_ORDERS_EDIT');
    component.applyAll('all');
    expect(emitted).toHaveLength(0);
  });

  it('respects the actor delegation ceiling', () => {
    authorization.can.mockImplementation((code: AppPermission) => code === 'SALES_ORDERS_VIEW_LIST');
    component.toggle('SALES_ORDERS_EDIT');
    expect(emitted).toHaveLength(0);
    component.toggle('SALES_ORDERS_VIEW_LIST');
    expect(emitted.at(-1)).toEqual(['SALES_ORDERS_VIEW_LIST']);
  });
});
