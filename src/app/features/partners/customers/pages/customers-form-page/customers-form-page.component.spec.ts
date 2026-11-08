import { NavigationHistoryService } from '@core/navigation/navigation-history.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, ActivatedRoute, provideRouter, convertToParamMap } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CustomersFormPageComponent } from '@features/partners/customers/pages/customers-form-page/customers-form-page.component';
import { CustomerApplicationService } from '@features/partners/customers/services/application/customer-application.service';
import { CustomerApiService } from '@features/partners/customers/services/api/customer-api.service';
import { CustomerType } from '@features/partners/customers/models/enums/customer-type.enum';
import { CustomerDetails } from '@features/partners/customers/models/interfaces/customer-details.interface';
import { FormMode } from '@core/forms/enums/form-mode.enum';

describe('CustomersFormPageComponent', () => {
  let component: CustomersFormPageComponent;
  let fixture: ComponentFixture<CustomersFormPageComponent>;
  let mockService: Partial<CustomerApplicationService>;
  let router: Router;

  const mockDetails: CustomerDetails = {
    id: 'uuid-001',
    code: 1001,
    legalName: 'Acme C.A.',
    type: CustomerType.BUSINESS,
    rif: 'J-12345678-9',
    alias: 'ACME',
    creditDays: 30,
    creditLimit: 50000,
    active: true,
    createdAt: '2025-01-15T10:30:00Z',
    emails: [{ id: 'e1', customerId: 'uuid-001', email: 'contact@acme.com' }],
    phones: [{ id: 'p1', customerId: 'uuid-001', phone: '0212-1234567' }],
    addresses: [
      { id: 'a1', customerId: 'uuid-001', address: 'Av. Principal', billing: true, active: true },
    ],
  };

  beforeEach(async () => {
    mockService = {
      loadById: vi.fn().mockReturnValue(of(mockDetails)),
      create: vi.fn().mockReturnValue(of(mockDetails)),
      update: vi.fn().mockReturnValue(of(mockDetails)),
      loading: signal(false),
      error: signal(null),
      currentCustomer: signal(null),
    };

    await TestBed.configureTestingModule({
      imports: [CustomersFormPageComponent],
      providers: [
        provideRouter([]),
        { provide: CustomerApplicationService, useValue: mockService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({})),
            snapshot: { paramMap: convertToParamMap({}), queryParamMap: convertToParamMap({}) },
          },
        },
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomersFormPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be in create mode by default', () => {
    expect(component.isEditMode()).toBe(false);
  });

  it('should have title "Nuevo Cliente" in create mode', () => {
    expect(component.title()).toBe('Nuevo Cliente');
  });

  it('should have submitLabel "Crear Cliente" in create mode', () => {
    expect(component.submitLabel()).toBe('Crear Cliente');
  });

  it('should initialize form with default values', () => {
    const form = component.form;
    expect(form.get('active')?.value).toBe(true);
    expect(form.get('creditDays')?.value).toBe(null);
    expect(form.get('creditLimit')?.value).toBe(null);
  });

  it('returns through navigation history instead of forcing the list destination', () => {
    const back = vi
      .spyOn(TestBed.inject(NavigationHistoryService), 'back')
      .mockImplementation(() => undefined);
    component.onCancel();
    expect(back).toHaveBeenCalledWith(['/partners/customers']);
  });

  it('should navigate to /customers on cancel', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onCancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/partners/customers']);
  });

  it('should mark form as touched and show warning when submitting invalid form', () => {
    const messageService = fixture.debugElement.injector.get(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');

    component.form.get('legalName')?.setValue('');
    component.onSubmit();

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'warn' }));
  });

  it('should show warning and not create when no warehouses assigned', () => {
    const messageService = fixture.debugElement.injector.get(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');
    const createSpy = vi.spyOn(mockService, 'create');

    component.form.get('legalName')?.setValue('Acme Corp');
    component.form.get('rif')?.setValue('J-12345678-9');
    component.form.get('priceTypeId')?.setValue('pt-001');
    (component.form.get('addresses') as any).at(0).get('address')?.setValue('Av. Principal');
    component.warehouseAccess.set([]);

    expect(component.form.valid).toBe(true);
    component.onSubmit();

    expect(addSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'warn',
        detail: 'Debe asignar al menos un almacén antes de crear el cliente',
      }),
    );
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('should include warehouse ids in create request and not grant separately', () => {
    const createSpy = vi.spyOn(mockService, 'create');
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const apiService = TestBed.inject(CustomerApiService);
    const grantSpy = vi.spyOn(apiService, 'grantWarehouseAccess');

    component.form.get('legalName')?.setValue('Acme Corp');
    component.form.get('rif')?.setValue('J-12345678-9');
    component.form.get('priceTypeId')?.setValue('pt-001');
    (component.form.get('addresses') as any).at(0).get('address')?.setValue('Av. Principal');
    component.warehouseAccess.set([
      { id: '', customerId: '', warehouseId: 'wh-001', warehouseName: 'Almacén 1' },
    ]);

    component.onSubmit();

    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({ warehouseIds: ['wh-001'] }));
    expect(grantSpy).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/partners/customers', 'uuid-001']);
  });

  it('should identify a duplicate RIF when customer creation returns a conflict', () => {
    const messageService = fixture.debugElement.injector.get(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');
    vi.mocked(mockService.create!).mockReturnValue(
      throwError(() => ({
        status: 409,
        error: { error: 'Duplicate customer RIF' },
      })),
    );

    component.form.get('legalName')?.setValue('Duplicate Corp');
    component.form.get('rif')?.setValue('J-12345678-9');
    component.form.get('priceTypeId')?.setValue('pt-001');
    (component.form.get('addresses') as any).at(0).get('address')?.setValue('Av. Principal');
    component.warehouseAccess.set([
      { id: '', customerId: '', warehouseId: 'wh-001', warehouseName: 'Almacén 1' },
    ]);

    component.onSubmit();

    expect(component.form.get('rif')?.hasError('duplicateRif')).toBe(true);
    expect(addSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'warn',
        detail: 'Ya existe un cliente registrado con el RIF J-12345678-9.',
      }),
    );
  });

  it('should identify a duplicate RIF when customer update returns a conflict', () => {
    const messageService = fixture.debugElement.injector.get(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');
    vi.mocked(mockService.update!).mockReturnValue(
      throwError(() => ({
        status: 409,
        error: { error: 'Duplicate customer RIF' },
      })),
    );

    component.mode.set(FormMode.EDIT);
    component.entityId.set('uuid-001');
    component.form.get('legalName')?.setValue('Duplicate Corp');
    component.form.get('rif')?.setValue('J-12345678-9');
    component.form.get('priceTypeId')?.setValue('pt-001');
    (component.form.get('addresses') as any).at(0).get('address')?.setValue('Av. Principal');

    component.onSubmit();

    expect(component.form.get('rif')?.hasError('duplicateRif')).toBe(true);
    expect(addSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'warn',
        detail: 'Ya existe un cliente registrado con el RIF J-12345678-9.',
      }),
    );
  });
  it('opens the saved customer detail after updating', () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.mode.set(FormMode.EDIT);
    component.entityId.set('uuid-001');
    component.form.patchValue({
      legalName: 'Acme Corp',
      rif: 'J-12345678-9',
      priceTypeId: 'pt-001',
    });
    component.array('addresses').at(0).patchValue({ address: 'Av. Principal' });
    component.onSubmit();
    expect(navigate).toHaveBeenCalledWith(['/partners/customers', 'uuid-001']);
  });
});
