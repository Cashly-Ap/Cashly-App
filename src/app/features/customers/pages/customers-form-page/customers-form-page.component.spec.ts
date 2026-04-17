import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { CustomersFormPageComponent } from './customers-form-page.component';
import { CustomerApplicationService } from '@features/customers/services/application';
import { CustomerType } from '@features/customers/models/enums';
import { CustomerDetails } from '@features/customers/models/interfaces';

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
    addresses: [{ id: 'a1', customerId: 'uuid-001', address: 'Av. Principal', billing: true, active: true }],
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
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        MessageService,
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

  it('should have submitLabel "Crear" in create mode', () => {
    expect(component.submitLabel()).toBe('Crear');
  });

  it('should initialize form with default values', () => {
    const form = component.form;
    expect(form.get('active')?.value).toBe(true);
    expect(form.get('creditDays')?.value).toBe(0);
    expect(form.get('creditLimit')?.value).toBe(0);
  });

  it('should navigate to /customers on cancel', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onCancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/customers']);
  });

  it('should mark form as touched and show warning when submitting invalid form', () => {
    const messageService = fixture.debugElement.injector.get(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');

    component.form.get('legalName')?.setValue('');
    component.onSubmit();

    expect(addSpy).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'warn' }),
    );
  });
});
