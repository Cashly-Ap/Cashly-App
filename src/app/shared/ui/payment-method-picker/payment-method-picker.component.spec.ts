import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { PaymentMethodPickerComponent } from './payment-method-picker.component';
import { PaymentMethodApiService } from '@features/payment-methods/services/api/payment-method-api.service';
import { PaymentMethodList } from '@features/payment-methods/models/interfaces';

describe('PaymentMethodPickerComponent', () => {
  let component: PaymentMethodPickerComponent;
  let fixture: ComponentFixture<PaymentMethodPickerComponent>;
  let mockApiService: Partial<PaymentMethodApiService>;

  const mockPaymentMethods: PaymentMethodList[] = [
    {
      id: 'pm-001',
      code: 'CASH',
      name: 'Efectivo',
      description: null,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'pm-002',
      code: 'BANK_TRANSFER',
      name: 'Transferencia Bancaria',
      description: 'Transferencia directa',
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    mockApiService = {
      getAll: vi.fn().mockReturnValue(of(mockPaymentMethods)),
    };

    await TestBed.configureTestingModule({
      imports: [PaymentMethodPickerComponent],
      providers: [{ provide: PaymentMethodApiService, useValue: mockApiService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentMethodPickerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load payment methods on init', () => {
    fixture.detectChanges();
    expect(mockApiService.getAll).toHaveBeenCalledWith({ active: true });
    expect(component.paymentMethods().length).toBe(2);
  });

  it('should open dialog', () => {
    component.open();
    expect(component.visible()).toBe(true);
    expect(component.searchTerm()).toBe('');
  });

  it('should close dialog', () => {
    component.visible.set(true);
    component.close();
    expect(component.visible()).toBe(false);
  });

  it('should emit selected payment method', () => {
    const emitSpy = vi.fn();
    component.selected.subscribe(emitSpy);
    component.onSelect(mockPaymentMethods[0]);
    expect(emitSpy).toHaveBeenCalledWith(mockPaymentMethods[0]);
    expect(component.selectedPaymentMethod()).toEqual(mockPaymentMethods[0]);
  });

  it('should filter payment methods by search term', () => {
    fixture.detectChanges();
    component.searchTerm.set('efectivo');
    const filtered = component.filteredPaymentMethods();
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Efectivo');
  });

  it('should return all payment methods when search term is empty', () => {
    fixture.detectChanges();
    component.searchTerm.set('');
    const filtered = component.filteredPaymentMethods();
    expect(filtered).toHaveLength(2);
  });
});
