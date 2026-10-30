import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router, convertToParamMap } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DepartmentsPageComponent } from './departments-page.component';
import { AccessManagementService } from '../../authorization/services/access-management.service';
import { AuthorizationService } from '../../authorization/services/authorization.service';

const department = {
  id: 'd',
  name: 'Support',
  description: 'Customer support',
  active: true,
  version: 3,
};

describe('Department management navigation and form', () => {
  const service = { departments: vi.fn(), saveDepartment: vi.fn(), delete: vi.fn() };
  const snapshot = { data: { view: 'list' }, paramMap: convertToParamMap({}) };
  let component: DepartmentsPageComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    snapshot.data = { view: 'list' };
    snapshot.paramMap = convertToParamMap({});
    service.departments.mockReturnValue(of([department]));
    TestBed.configureTestingModule({
      imports: [DepartmentsPageComponent],
      providers: [
        provideRouter([]),
        MessageService,
        ConfirmationService,
        { provide: ActivatedRoute, useValue: { snapshot } },
        { provide: AccessManagementService, useValue: service },
        { provide: AuthorizationService, useValue: { can: () => true } },
      ],
    });
  });

  function createComponent() {
    component = TestBed.createComponent(DepartmentsPageComponent).componentInstance;
    return component;
  }

  it('opens a read-only detail route without presenting an edit form', () => {
    snapshot.data = { view: 'detail' };
    snapshot.paramMap = convertToParamMap({ id: 'd' });
    createComponent();
    expect(component.view()).toBe('detail');
    expect(component.editing()?.name).toBe('Support');
    expect(service.saveDepartment).not.toHaveBeenCalled();
  });

  it('navigates list actions to distinct detail and edit URLs', () => {
    createComponent();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.actionsFor(department)[0].command();
    expect(navigate).toHaveBeenCalledWith(['/platform/departments', 'd']);
    component.actionsFor(department)[1].command();
    expect(navigate).toHaveBeenCalledWith(['/platform/departments', 'd', 'edit']);
  });

  it('retains entered fields and version when a concurrent update conflicts', () => {
    snapshot.data = { view: 'form' };
    snapshot.paramMap = convertToParamMap({ id: 'd' });
    createComponent();
    service.saveDepartment.mockReturnValue(throwError(() => ({ status: 409 })));
    component.form.patchValue({ name: '  Operations  ', description: 'Updated' });
    component.submit();
    expect(service.saveDepartment).toHaveBeenCalledWith({
      id: 'd',
      name: 'Operations',
      description: 'Updated',
      active: true,
      version: 3,
    });
    expect(component.form.controls.name.value).toBe('  Operations  ');
    expect(component.editing()?.version).toBe(3);
    expect(component.busy()).toBe(false);
  });

  it('does not submit an empty department name', () => {
    snapshot.data = { view: 'form' };
    createComponent();
    component.form.controls.name.setValue('   ');
    component.submit();
    expect(service.saveDepartment).not.toHaveBeenCalled();
    expect(component.form.controls.name.touched).toBe(true);
  });

  it('does not open deletion confirmation without DELETE', () => {
    createComponent();
    vi.spyOn(TestBed.inject(AuthorizationService), 'can').mockReturnValue(false);
    const confirm = vi.spyOn(TestBed.inject(ConfirmationService), 'confirm');
    component.remove({ id: 'blocked', name: 'Blocked', active: true });
    expect(confirm).not.toHaveBeenCalled();
  });

  it('rechecks DELETE when accepting an already open confirmation', () => {
    createComponent();
    const confirm = vi.spyOn(TestBed.inject(ConfirmationService), 'confirm');
    component.remove({ id: 'blocked', name: 'Blocked', active: true });
    vi.spyOn(TestBed.inject(AuthorizationService), 'can').mockReturnValue(false);
    const accept = confirm.mock.calls[0][0].accept;
    expect(accept).toBeDefined();
    accept?.();
    expect(service.delete).not.toHaveBeenCalled();
  });
  it.each([false, true])(
    'opens the saved detail after create or update (editing=%s)',
    (editing) => {
      createComponent();
      service.saveDepartment.mockReturnValue(of({ id: 'saved-id' }));
      component.editing.set({ name: 'Saved record', ...(editing ? { id: 'saved-id' } : {}) });
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      component.save();
      expect(navigate).toHaveBeenCalledWith(['/platform/departments', 'saved-id']);
    },
  );
});
