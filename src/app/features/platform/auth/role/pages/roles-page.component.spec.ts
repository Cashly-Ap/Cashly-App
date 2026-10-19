import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { RolesPageComponent } from './roles-page.component';
import { AccessManagementService } from '../../authorization/services/access-management.service';
import { AuthorizationService } from '../../authorization/services/authorization.service';
import { BusinessModule } from '../../user/models/enums/business-module.enum';

describe('Role permission matrix', () => {
  const service = { roles: vi.fn(), registry: vi.fn(), saveRole: vi.fn() };
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
});
