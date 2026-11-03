import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { RolesPageComponent } from '@features/platform/auth/role/pages/roles-page.component';
import { AccessManagementService } from '@features/platform/auth/authorization/services/access-management.service';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';

describe('Role permissions', () => {
  const service = { roles: vi.fn(), saveRole: vi.fn(), delete: vi.fn() };
  const authorization = { can: vi.fn() };
  const messages = { add: vi.fn() };
  let component: RolesPageComponent;

  const role = (permissions: string[] = []) => ({
    id: 'r',
    name: 'Reader',
    description: '',
    active: true,
    version: 4,
    systemKey: null,
    permissions,
  });

  beforeEach(() => {
    service.roles.mockReturnValue(of([]));
    authorization.can.mockReturnValue(true);
    service.saveRole.mockReset();
    service.delete.mockReset();
    messages.add.mockReset();
    TestBed.configureTestingModule({
      imports: [RolesPageComponent],
      providers: [
        provideRouter([]),
        { provide: AccessManagementService, useValue: service },
        { provide: AuthorizationService, useValue: authorization },
        { provide: MessageService, useValue: messages },
        { provide: DeleteDialogService, useValue: { open: vi.fn() } },
        ConfirmationService,
      ],
    });
    component = TestBed.createComponent(RolesPageComponent).componentInstance;
  });

  it('toggles independent permissions', () => {
    component.create();
    component.toggle('SALES_ORDERS_VIEW_LIST');
    component.toggle('SALES_ORDERS_VIEW_DETAIL');
    expect(component.selected('SALES_ORDERS_VIEW_LIST')).toBe(true);
    expect(component.selected('SALES_ORDERS_VIEW_DETAIL')).toBe(true);
    component.toggle('SALES_ORDERS_VIEW_LIST');
    expect(component.selected('SALES_ORDERS_VIEW_LIST')).toBe(false);
    expect(component.selected('SALES_ORDERS_VIEW_DETAIL')).toBe(true);
  });

  it('gives the immutable administrator every catalog permission', () => {
    component.edit({
      id: 'system',
      name: 'Administrator',
      description: '',
      active: true,
      version: 0,
      systemKey: 'SYSTEM_ADMIN',
      permissions: [],
    });
    expect(component.selected('SALES_ORDERS_VIEW_LIST')).toBe(true);
    expect(component.selected('COMPANY_EDIT')).toBe(true);
    component.toggle('SALES_ORDERS_VIEW_LIST');
    expect(component.selected('SALES_ORDERS_VIEW_LIST')).toBe(true);
  });

  it('rejects nondelegable and busy permission changes', () => {
    component.create();
    authorization.can.mockImplementation((code: string) => code !== 'SALES_ORDERS_EDIT');
    component.toggle('SALES_ORDERS_EDIT');
    expect(component.editing()?.permissions).toEqual([]);
    authorization.can.mockReturnValue(true);
    component.busy.set(true);
    component.toggle('SALES_ORDERS_VIEW_LIST');
    component.updatePermissions(['SALES_ORDERS_VIEW_LIST']);
    expect(component.editing()?.permissions).toEqual([]);
  });

  it('rejects a protected role save', () => {
    component.edit({
      id: 'system',
      name: 'Administrator',
      description: '',
      active: true,
      version: 0,
      systemKey: 'SYSTEM_ADMIN',
      permissions: [],
    });
    component.save();
    expect(service.saveRole).not.toHaveBeenCalled();
  });

  it('sends the selected permission codes with the optimistic version', () => {
    component.edit(role(['SALES_ORDERS_VIEW_LIST']));
    component.toggle('COMPANY_EDIT');
    service.saveRole.mockReturnValue(of({ ...role(), id: 'r' }));
    component.save();
    expect(service.saveRole).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'r',
        version: 4,
        permissions: ['SALES_ORDERS_VIEW_LIST', 'COMPANY_EDIT'],
      }),
    );
  });

  it('preserves the editor and reports a conflict', () => {
    component.edit(role(['SALES_ORDERS_VIEW_LIST']));
    service.saveRole.mockReturnValue(throwError(() => ({ status: 409 })));
    component.save();
    expect(component.editing()?.id).toBe('r');
    expect(component.busy()).toBe(false);
    expect(messages.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });

  it('does not submit without mutation permission', () => {
    component.create();
    component.editing()!.name = 'New role';
    authorization.can.mockReturnValue(false);
    component.save();
    expect(service.saveRole).not.toHaveBeenCalled();
  });

  it('exposes Company permissions in the catalog', () => {
    expect(component.catalogAreas.some((area) => area.areaKey === 'navigation.labels.platform')).toBe(
      true,
    );
    expect(component.allPermissionCodes).toContain('COMPANY_VIEW');
    expect(component.allPermissionCodes).toContain('COMPANY_EDIT');
  });
});
