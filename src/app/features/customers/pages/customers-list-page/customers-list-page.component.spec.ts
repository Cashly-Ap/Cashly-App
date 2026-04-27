import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CustomersListPageComponent } from './customers-list-page.component';
import { CustomerApplicationService } from '@features/customers/services/application';
import { CustomerType } from '@features/customers/models/enums';
import { CustomerList } from '@features/customers/models/interfaces';

describe('CustomersListPageComponent', () => {
  let component: CustomersListPageComponent;
  let fixture: ComponentFixture<CustomersListPageComponent>;
  let mockService: Partial<CustomerApplicationService>;
  let router: Router;

  const mockCustomer: CustomerList = {
    id: 'uuid-001',
    code: 1001,
    alias: 'ACME',
    legalName: 'Acme C.A.',
    rif: 'J-12345678-9',
    type: CustomerType.BUSINESS,
    active: true,
  };

  beforeEach(async () => {
    mockService = {
      loadAll: vi.fn().mockReturnValue(of([mockCustomer])),
      delete: vi.fn().mockReturnValue(of(undefined)),
      customers: signal([mockCustomer]),
      loading: signal(false),
      error: signal(null),
      totalElements: signal(1),
    };

    await TestBed.configureTestingModule({
      imports: [CustomersListPageComponent],
      providers: [
        provideRouter([]),
        { provide: CustomerApplicationService, useValue: mockService },
        ConfirmationService,
        MessageService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomersListPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load customers on init', () => {
    fixture.detectChanges();
    expect(mockService.loadAll).toHaveBeenCalled();
  });

  it('should filter customers by legalName', () => {
    fixture.detectChanges();
    component.onSearch('Acme');
    expect(mockService.loadAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'Acme' }));
  });

  it('should filter customers by alias', () => {
    fixture.detectChanges();
    component.onSearch('ACME');
    expect(mockService.loadAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'ACME' }));
  });

  it('should filter customers by rif', () => {
    fixture.detectChanges();
    component.onSearch('J-12345678');
    expect(mockService.loadAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'J-12345678' }));
  });

  it('should return empty filtered list when no match', () => {
    fixture.detectChanges();
    component.onSearch('nonexistent');
    expect(mockService.loadAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'nonexistent' }));
  });

  it('should navigate to new customer on onCreate', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onCreate();
    expect(navigateSpy).toHaveBeenCalledWith(['/customers', 'new']);
  });

  it('should navigate to customer detail on onView', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onView(mockCustomer);
    expect(navigateSpy).toHaveBeenCalledWith(['/customers', mockCustomer.id]);
  });

  it('should navigate to customer edit on onEdit', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEdit(mockCustomer);
    expect(navigateSpy).toHaveBeenCalledWith(['/customers', mockCustomer.id, 'edit']);
  });

  it('should return correct type label', () => {
    const label = component.getTypeLabel(CustomerType.BUSINESS);
    expect(label).toBe('Jurídico');
  });
});
