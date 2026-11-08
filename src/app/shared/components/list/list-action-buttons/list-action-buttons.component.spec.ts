import { signal } from '@angular/core';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListActionButtonsComponent } from '@shared/components/list/list-action-buttons/list-action-buttons.component';

describe('ListActionButtonsComponent', () => {
  let component: ListActionButtonsComponent;
  let fixture: ComponentFixture<ListActionButtonsComponent>;

  let events: Subject<NavigationEnd>;
  const allowed = signal(true);
  const can = vi.fn();

  beforeEach(() => {
    events = new Subject<NavigationEnd>();
    allowed.set(true);
    can.mockImplementation(() => allowed());
    TestBed.configureTestingModule({
      imports: [ListActionButtonsComponent],
      providers: [
        { provide: Router, useValue: { url: '/catalog/products', events } },
        { provide: AuthorizationService, useValue: { can } },
      ],
    });

    fixture = TestBed.createComponent(ListActionButtonsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('actions', [
      {
        requiredAction: 'EXPORT',
        label: 'Descargar PDF',
        icon: 'pi pi-file-pdf',
        command: vi.fn(),
      },
      {
        requiredAction: 'DELETE',
        label: 'Eliminar',
        icon: 'pi pi-trash',
        command: vi.fn(),
        danger: true,
      },
      { requiredAction: 'READ', label: 'Ver detalle', icon: 'pi pi-eye', command: vi.fn() },
      { requiredAction: 'UPDATE', label: 'Editar', icon: 'pi pi-pencil', command: vi.fn() },
    ]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('prioritizes view, edit and delete before module-specific actions', () => {
    expect(component.orderedActions().map((action) => action.label)).toEqual([
      'Ver detalle',
      'Editar',
      'Eliminar',
      'Descargar PDF',
    ]);
  });

  it('should render a single actions trigger', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('p-button')).toHaveLength(1);
  });

  it('should center the actions trigger in its table cell', () => {
    expect(fixture.nativeElement.classList).toContain('justify-center');
    expect(fixture.nativeElement.classList).toContain('w-full');
  });

  it('hides the action trigger when no action is authorized', () => {
    allowed.set(false);
    fixture.detectChanges();
    expect(component.orderedActions()).toEqual([]);
    expect((fixture.nativeElement as HTMLElement).querySelector('p-button')).toBeNull();
  });

  it('checks authorization again before executing an action after permissions change', () => {
    const action = component.orderedActions()[1];
    allowed.set(false);
    component.execute(action);
    expect(action.command).not.toHaveBeenCalled();
  });

  it('does not execute disabled or undeclared actions', () => {
    const command = vi.fn();
    component.execute({ label: 'Hidden', icon: '', command });
    component.execute({
      label: 'Disabled',
      icon: '',
      command,
      requiredAction: 'READ',
      disabled: true,
    });
    expect(command).not.toHaveBeenCalled();
  });

  it('gates export actions only on the owning module EXPORT grant', () => {
    can.mockImplementation(
      (module: BusinessModule, action?: string) =>
        !(module === BusinessModule.FINANCE_INVOICES && action === 'EXPORT'),
    );
    fixture.componentRef.setInput('actions', [
      {
        label: 'Export',
        icon: '',
        requiredAction: 'EXPORT',
        module: BusinessModule.FINANCE_INVOICES,
        command: vi.fn(),
      },
      {
        label: 'Report',
        icon: '',
        requiredAction: 'EXPORT',
        module: BusinessModule.FINANCE_INVOICES,
        command: vi.fn(),
      },
    ]);
    fixture.detectChanges();
    expect(component.orderedActions().map((action) => action.label)).toEqual([]);
  });

  it('executes an authorized action once', () => {
    const action = component.orderedActions()[0];
    component.execute(action);
    expect(action.command).toHaveBeenCalledExactlyOnceWith();
  });

  it('uses the current module after navigation reuses the actions component', () => {
    can.mockImplementation((module: BusinessModule) => module === BusinessModule.CATALOG_PRODUCTS);
    fixture.componentRef.setInput('actions', [
      { label: 'Edit', icon: '', requiredAction: 'UPDATE', command: vi.fn() },
    ]);
    fixture.detectChanges();
    expect(component.orderedActions()).toHaveLength(1);
    events.next(new NavigationEnd(1, '/finance/expenses', '/finance/expenses'));
    fixture.detectChanges();
    expect(component.orderedActions()).toEqual([]);
  });
});
