import { provideRouter } from '@angular/router';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WarehousesDetailsPageComponent } from '@features/inventory/warehouses/pages/warehouses-details-page/warehouses-details-page.component';
import { WarehouseApplicationService } from '@features/inventory/warehouses/services/application/warehouse-application.service';
import { WarehouseDetails } from '@features/inventory/warehouses/models/interfaces/warehouse.interfaces';

describe('WarehousesDetailsPageComponent', () => {
  let fixture: ComponentFixture<WarehousesDetailsPageComponent>;
  let component: WarehousesDetailsPageComponent;
  let router: Router;
  let confirmationService: ConfirmationService;

  const warehouse: WarehouseDetails = {
    id: 'wh-001',
    name: 'Almacén Central',
    state: 'Distrito Capital',
    municipality: 'Libertador',
    active: true,
    deletable: true,
    stock: [],
    recentMovements: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T10:30:00Z',
  };
  const service = {
    loadById: vi.fn().mockReturnValue(of(warehouse)),
    delete: vi.fn().mockReturnValue(of(undefined)),
    getStock: vi.fn(),
    getMovements: vi.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WarehousesDetailsPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthorizationService, useValue: { can: () => true } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'wh-001' } } } },
        { provide: WarehouseApplicationService, useValue: service },
        MessageService,
      ],
    });
    fixture = TestBed.createComponent(WarehousesDetailsPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    confirmationService = fixture.debugElement.injector.get(ConfirmationService);
  });

  it('loads only warehouse information on init', () => {
    fixture.detectChanges();

    expect(service.loadById).toHaveBeenCalledWith('wh-001');
    expect(service.getStock).not.toHaveBeenCalled();
    expect(service.getMovements).not.toHaveBeenCalled();
    expect(component.warehouse()?.name).toBe('Almacén Central');
  });

  it('navigates to stock and movements pages', () => {
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.onViewStock();
    component.onViewMovements();

    expect(navigateSpy).toHaveBeenNthCalledWith(1, ['/inventory/warehouses', 'wh-001', 'stock']);
    expect(navigateSpy).toHaveBeenNthCalledWith(2, [
      '/inventory/warehouses',
      'wh-001',
      'movements',
    ]);
  });

  it('opens the shared stock operation dialog for entries and exits', () => {
    fixture.detectChanges();

    component.onRegisterEntry();
    expect(component.selectedOperation()).toBe('entry');
    expect(component.operationDialogVisible()).toBe(true);

    component.operationDialogVisible.set(false);
    component.onRegisterExit();
    expect(component.selectedOperation()).toBe('exit');
    expect(component.operationDialogVisible()).toBe(true);
  });

  it('deletes the warehouse after confirmation', () => {
    fixture.detectChanges();
    vi.spyOn(confirmationService, 'confirm').mockImplementation((options) => options.accept?.());

    component.onDelete();

    expect(service.delete).toHaveBeenCalledWith('wh-001');
  });

  it('hides delete when the warehouse cannot be deleted', () => {
    service.loadById.mockReturnValueOnce(of({ ...warehouse, deletable: false }));

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Eliminar');
  });

  it('shows edit and delete before warehouse-specific actions', () => {
    vi.spyOn(router, 'url', 'get').mockReturnValue('/inventory/warehouses/wh-001');
    fixture.detectChanges();
    const actionsTrigger = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Acciones'))!;
    actionsTrigger.click();
    fixture.detectChanges();
    const menuText = document.body.textContent ?? '';

    expect(menuText.indexOf('Editar')).toBeLessThan(menuText.indexOf('Registrar entrada'));
    expect(menuText.indexOf('Eliminar')).toBeLessThan(menuText.indexOf('Registrar entrada'));
  });
});
