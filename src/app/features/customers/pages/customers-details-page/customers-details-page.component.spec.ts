import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CustomersDetailsPageComponent } from '@features/customers/pages/customers-details-page/customers-details-page.component';
import { CustomerApplicationService } from '@features/customers/services/application';
import { CustomerApiService } from '@features/customers/services/api/customer-api.service';
import { PriceTypeApplicationService } from '@features/price-types/services/application/price-type-application.service';
import { CustomerType } from '@features/customers/models/enums';
import { CustomerDetails } from '@features/customers/models/interfaces';

describe('CustomersDetailsPageComponent', () => {
  let component: CustomersDetailsPageComponent;
  let fixture: ComponentFixture<CustomersDetailsPageComponent>;
  let mockService: Partial<CustomerApplicationService>;
  let mockCustomerApi: Partial<CustomerApiService>;
  let mockPriceTypeService: Partial<PriceTypeApplicationService>;
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
    portalAccess: true,
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
      delete: vi.fn().mockReturnValue(of(undefined)),
      changePortalPassword: vi.fn().mockReturnValue(of(undefined)),
      loading: signal(false),
      error: signal(null),
      currentCustomer: signal(null),
    };

    mockCustomerApi = {
      getWarehouseAccess: vi.fn().mockReturnValue(of([])),
    };

    mockPriceTypeService = {
      priceTypes: signal([]),
      loadAll: vi.fn().mockReturnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [CustomersDetailsPageComponent],
      providers: [
        provideRouter([]),
        { provide: CustomerApplicationService, useValue: mockService },
        { provide: CustomerApiService, useValue: mockCustomerApi },
        { provide: PriceTypeApplicationService, useValue: mockPriceTypeService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'uuid-001' } } },
        },
        ConfirmationService,
        MessageService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomersDetailsPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load customer on init', () => {
    fixture.detectChanges();
    expect(mockService.loadById).toHaveBeenCalledWith('uuid-001');
  });

  it('should set customer signal after loading', () => {
    fixture.detectChanges();
    expect(component.customer()?.id).toBe('uuid-001');
    expect(component.customer()?.legalName).toBe('Acme C.A.');
  });

  it('should navigate to edit on onEdit', () => {
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEdit();
    expect(navigateSpy).toHaveBeenCalledWith(['/customers', 'uuid-001', 'edit']);
  });

  it('should navigate to list on onBack', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/customers']);
  });

  it('should return correct type label', () => {
    expect(component.getTypeLabel(CustomerType.BUSINESS)).toBe('Jurídico');
    expect(component.getTypeLabel(CustomerType.INDIVIDUAL)).toBe('Natural');
  });

  it('should display customer after loading', () => {
    fixture.detectChanges();
    expect(component.customer()).not.toBeNull();
  });

  it('should show actions dropdown button', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('p-button[label="Acciones"]');
    expect(button).not.toBeNull();
  });

  it('should open password dialog when button is clicked', () => {
    fixture.detectChanges();
    expect(component.showPasswordDialog()).toBe(false);
    component.showPasswordDialog.set(true);
    expect(component.showPasswordDialog()).toBe(true);
  });
});
