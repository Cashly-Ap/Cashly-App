import { provideRouter, Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { RolesPageComponent } from './roles-page.component';
import { AccessManagementService } from '../../authorization/services/access-management.service';
import { AuthorizationService } from '../../authorization/services/authorization.service';
import { BusinessModule } from '../../user/models/enums/business-module.enum';

describe('Role permission matrix', () => {
  const service = { roles: vi.fn(), registry: vi.fn(), saveRole: vi.fn(), delete: vi.fn() };
  const authorization = { can: vi.fn() };
  const messages = { add: vi.fn() };
  let component: RolesPageComponent;
  beforeEach(() => {
    service.roles.mockReturnValue(of([]));
    service.registry.mockReturnValue(
      of([{ module: BusinessModule.CATALOG, actions: ['READ', 'CREATE', 'UPDATE'] }]),
    );
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
        ConfirmationService,
      ],
    });
    component = TestBed.createComponent(RolesPageComponent).componentInstance;
  });
  it('automatically includes READ and clears dependent actions when READ is removed', () => {
    component.create();
    component.toggle(BusinessModule.CATALOG, 'CREATE');
    expect(component.selected(BusinessModule.CATALOG, 'READ')).toBe(true);
    expect(component.selected(BusinessModule.CATALOG, 'CREATE')).toBe(true);
    component.toggle(BusinessModule.CATALOG, 'READ');
    expect(component.selected(BusinessModule.CATALOG, 'CREATE')).toBe(false);
  });
  it('displays registry-provided effective privileges for the immutable administrator', () => {
    component.edit({
      id: 'system',
      name: 'Administrator',
      description: '',
      active: true,
      version: 0,
      systemKey: 'SYSTEM_ADMIN',
      permissions: {},
    });
    expect(component.selected(BusinessModule.CATALOG, 'READ')).toBe(true);
    expect(component.selected(BusinessModule.CATALOG, 'CREATE')).toBe(true);
    expect(component.selected(BusinessModule.CATALOG, 'IMPORT')).toBe(false);
    component.toggle(BusinessModule.CATALOG, 'READ');
    expect(component.selected(BusinessModule.CATALOG, 'READ')).toBe(true);
  });
  it('rejects unsupported, nondelegable and busy permission changes', () => {
    component.create();
    component.toggle(BusinessModule.CATALOG, 'IMPORT');
    expect(component.editing()?.permissions).toEqual({});
    authorization.can.mockImplementation((_module, action) => action !== 'CREATE');
    component.toggle(BusinessModule.CATALOG, 'CREATE');
    expect(component.editing()?.permissions).toEqual({});
    authorization.can.mockReturnValue(true);
    component.busy.set(true);
    component.toggle(BusinessModule.CATALOG, 'READ');
    component.updatePermissions({ [BusinessModule.CATALOG]: ['READ'] });
    expect(component.editing()?.permissions).toEqual({});
  });
  it('rejects a protected role save', () => {
    component.edit({
      id: 'system',
      name: 'Administrator',
      description: '',
      active: true,
      version: 0,
      systemKey: 'SYSTEM_ADMIN',
      permissions: {},
    });
    component.save();
    expect(service.saveRole).not.toHaveBeenCalled();
  });
  it('does not grant an action when READ is unsupported or outside actor access', () => {
    component.create();
    component.registry.set([{ module: BusinessModule.CATALOG, actions: ['CREATE'] }]);
    component.toggle(BusinessModule.CATALOG, 'CREATE');
    expect(component.editing()?.permissions).toEqual({});
    component.registry.set([{ module: BusinessModule.CATALOG, actions: ['READ', 'CREATE'] }]);
    authorization.can.mockImplementation((_module, action) => action !== 'READ');
    component.toggle(BusinessModule.CATALOG, 'CREATE');
    expect(component.editing()?.permissions).toEqual({});
  });
  it('sends optimistic version and preserves the editor on conflict', () => {
    component.edit({
      id: 'r',
      name: 'Reader',
      description: '',
      active: true,
      version: 4,
      systemKey: null,
      permissions: { [BusinessModule.CATALOG]: ['READ'] },
    });
    service.saveRole.mockReturnValue(throwError(() => ({ status: 409 })));
    component.save();
    expect(service.saveRole).toHaveBeenCalledWith(expect.objectContaining({ id: 'r', version: 4 }));
    expect(component.editing()?.id).toBe('r');
    expect(component.busy()).toBe(false);
    expect(messages.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });
  it('does not submit a role after the actor loses its mutation permission', () => {
    component.create();
    component.editing()!.name = 'New role';
    authorization.can.mockReturnValue(false);
    component.save();
    expect(service.saveRole).not.toHaveBeenCalled();
  });
  it('submits profile fields and the edited matrix together while preserving the version', () => {
    component.edit({
      id: 'r',
      name: 'Reader',
      description: '',
      active: true,
      version: 4,
      systemKey: null,
      permissions: { [BusinessModule.CATALOG]: ['READ'] },
    });
    component.form.patchValue({ name: '  Catalog manager  ', description: 'Catalog access' });
    component.toggle(BusinessModule.CATALOG, 'CREATE');
    service.saveRole.mockReturnValue(throwError(() => ({ status: 409 })));
    component.submit();
    expect(service.saveRole).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'r',
        version: 4,
        name: 'Catalog manager',
        description: 'Catalog access',
        permissions: { [BusinessModule.CATALOG]: ['READ', 'CREATE'] },
      }),
    );
    expect(component.form.controls.name.value).toBe('  Catalog manager  ');
    expect(component.editing()?.version).toBe(4);
  });
  it('rejects an invalid general tab even when the permissions tab is complete', () => {
    component.create();
    component.toggle(BusinessModule.CATALOG, 'CREATE');
    component.form.controls.name.setValue('   ');
    component.submit();
    expect(service.saveRole).not.toHaveBeenCalled();
    expect(component.form.controls.name.touched).toBe(true);
  });

  it('does not open deletion confirmation without DELETE', () => {
    vi.spyOn(TestBed.inject(AuthorizationService), 'can').mockReturnValue(false);
    const confirm = vi.spyOn(TestBed.inject(ConfirmationService), 'confirm');
    component.remove({ id: 'blocked', name: 'Blocked', active: true });
    expect(confirm).not.toHaveBeenCalled();
  });

  it('rechecks DELETE when accepting an already open confirmation', () => {
    const confirm = vi.spyOn(TestBed.inject(ConfirmationService), 'confirm');
    component.remove({ id: 'blocked', name: 'Blocked', active: true });
    vi.spyOn(TestBed.inject(AuthorizationService), 'can').mockReturnValue(false);
    const accept = confirm.mock.calls[0][0].accept;
    expect(accept).toBeDefined();
    accept?.();
    expect(service.delete).not.toHaveBeenCalled();
  });
  it.each([false, true])('opens the saved detail after create or update (editing=%s)', (editing) => {

    service.saveRole.mockReturnValue(of({ id: 'saved-id' }));
    component.editing.set({ name: 'Saved record', ...(editing ? { id: 'saved-id' } : {}) });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.save();
    expect(navigate).toHaveBeenCalledWith(['/platform/roles', 'saved-id']);
  });

});
