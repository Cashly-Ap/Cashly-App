import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ReactiveFormsModule } from '@angular/forms';
import { PaymentMethodFormPageComponent } from './payment-method-form-page.component';
import { FinanceApplicationService } from '@features/finances/services/application';
import { PaymentMethodDetail } from '@features/finances/models/interfaces';

describe('PaymentMethodFormPageComponent', () => {
  let component: PaymentMethodFormPageComponent;
  let fixture: ComponentFixture<PaymentMethodFormPageComponent>;
  let mockService: Partial<FinanceApplicationService>;
  let router: Router;
  let messageService: MessageService;

  const mockPaymentMethod: PaymentMethodDetail = {
    id: 'pm-001',
    code: 'CASH',
    name: 'Efectivo',
    description: 'Pago en efectivo',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  function configureTestBed(id: string | null = null) {
    mockService = {
      loadPaymentMethods: vi.fn().mockReturnValue(of({ content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 })),
      loadPaymentMethodById: vi.fn().mockReturnValue(of(mockPaymentMethod)),
      createPaymentMethod: vi.fn().mockReturnValue(of(mockPaymentMethod)),
      updatePaymentMethod: vi.fn().mockReturnValue(of(mockPaymentMethod)),
      togglePaymentMethod: vi.fn().mockReturnValue(of(mockPaymentMethod)),
      paymentMethods: signal([]),
      currentPaymentMethod: signal(null),
      loading: signal(false),
      error: signal(null),
      totalElements: signal(0),
    };

    TestBed.configureTestingModule({
      imports: [PaymentMethodFormPageComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => id }), snapshot: { paramMap: { get: () => id }, queryParamMap: { get: () => null } } } },
        { provide: FinanceApplicationService, useValue: mockService },
        MessageService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();
  }

  function createComponent() {
    fixture = TestBed.createComponent(PaymentMethodFormPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    messageService = TestBed.inject(MessageService);
  }

  beforeEach(() => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed();
    createComponent();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a form with name, description, and isActive fields', () => {
    expect(component.form).toBeDefined();
    expect(component.form.get('name')).toBeDefined();
    expect(component.form.get('description')).toBeDefined();
    expect(component.form.get('isActive')).toBeDefined();
  });

  it('should have name field as required', () => {
    const nameControl = component.form.get('name');
    nameControl?.setValue('');
    expect(nameControl?.invalid).toBe(true);
  });

  it('should have name field valid when value provided', () => {
    const nameControl = component.form.get('name');
    nameControl?.setValue('Test Payment Method');
    expect(nameControl?.valid).toBe(true);
  });

  it('should have isActive field default to true', () => {
    expect(component.form.get('isActive')?.value).toBe(true);
  });

  it('should return correct config', () => {
    const config = component.getConfig();
    expect(config.entityDisplayName).toBe('Método de Pago');
    expect(config.entityArticle).toBe('del');
    expect(config.module).toBe('finances');
    expect(config.routeBase).toBe('/finances');
  });

  it('should be in create mode by default', () => {
    expect(component.isCreateMode()).toBe(true);
    expect(component.isEditMode()).toBe(false);
  });

  it('should call create on submit in create mode', () => {
    component.form.get('name')?.setValue('Transferencia');
    component.onSubmit();
    expect(mockService.createPaymentMethod).toHaveBeenCalledWith({
      name: 'Transferencia',
      description: undefined,
    });
  });

  it('should navigate to /finances on create success', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.form.get('name')?.setValue('Transferencia');
    component.onSubmit();
    expect(navigateSpy).toHaveBeenCalledWith(['/finances']);
  });

  it('should show success message on create success', () => {
    const addSpy = vi.spyOn(messageService, 'add');
    component.form.get('name')?.setValue('Transferencia');
    component.onSubmit();
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Método de pago creado exitosamente',
      life: 3000,
    });
  });

  it('should show error message on create failure', () => {
    mockService.createPaymentMethod = vi.fn().mockReturnValue(throwError(() => new Error('Create failed')));
    const addSpy = vi.spyOn(messageService, 'add');
    component.form.get('name')?.setValue('Transferencia');
    component.onSubmit();
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al crear el método de pago.',
      life: 5000,
    });
  });

  it('should call update on submit in edit mode', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed('pm-001');
    createComponent();
    fixture.detectChanges();
    component.form.get('name')?.setValue('Efectivo Actualizado');
    component.onSubmit();
    expect(mockService.updatePaymentMethod).toHaveBeenCalledWith('pm-001', {
      name: 'Efectivo Actualizado',
      description: 'Pago en efectivo',
    });
  });

  it('should load entity and patch form in edit mode', () => {
    component.onLoadEntity('pm-001');
    expect(mockService.loadPaymentMethodById).toHaveBeenCalledWith('pm-001');
  });

  it('should patch form values on load entity success', () => {
    component.onLoadEntity('pm-001');
    expect(component.form.get('name')?.value).toBe('Efectivo');
    expect(component.form.get('description')?.value).toBe('Pago en efectivo');
    expect(component.form.get('isActive')?.value).toBe(true);
  });
});
