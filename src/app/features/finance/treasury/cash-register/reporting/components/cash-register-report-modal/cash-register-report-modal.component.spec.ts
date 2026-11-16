import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Component } from '@angular/core';
import { of } from 'rxjs';
import { CashRegisterReportModalComponent } from '@features/finance/treasury/cash-register/reporting/components/cash-register-report-modal/cash-register-report-modal.component';
import { CustomerApiService } from '@features/partners/customers/services/api/customer-api.service';
import { ProductApiService } from '@features/catalog/products/services/api/product-api.service';
import { CategoryApiService } from '@features/catalog/categories/services/api/category-api.service';

@Component({
  template: `<app-cash-register-report-modal
    [visible]="visible"
    (visibleChange)="onVisibleChange($event)"
    (onGenerateReport)="onGenerateReport($event)"
  />`,
  imports: [CashRegisterReportModalComponent],
})
class HostComponent {
  visible = false;
  onVisibleChange = vi.fn();
  onGenerateReport = vi.fn();
}

describe('CashRegisterReportModalComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let component: CashRegisterReportModalComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: CustomerApiService, useValue: { getAll: vi.fn(() => of({ content: [] })) } },
        { provide: ProductApiService, useValue: { getAllSimple: vi.fn(() => of([])) } },
        { provide: CategoryApiService, useValue: { getAll: vi.fn(() => of({ content: [] })) } },
      ],
    });

    TestBed.compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default visible input as false', () => {
    expect(component.visible()).toBe(false);
  });

  it('should have default dateFrom and dateTo as null', () => {
    expect(component.dateFrom()).toBeNull();
    expect(component.dateTo()).toBeNull();
  });

  it('should emit visibleChange false on onHide', () => {
    component.onHide();
    expect(hostComponent.onVisibleChange).toHaveBeenCalledWith(false);
  });

  it('should emit a PDF report with formatted date range and filters', () => {
    component.dateFrom.set(new Date(2025, 5, 15));
    component.dateTo.set(new Date(2025, 5, 20));

    component.customerId.set('customer-1');
    component.productId.set('product-1');
    component.categoryId.set('category-1');
    component.generateReport();

    expect(hostComponent.onGenerateReport).toHaveBeenCalledWith({
      dateFrom: '2025-06-15',
      dateTo: '2025-06-20',
      type: 'DETAILED',
      format: 'PDF',
      customerId: 'customer-1',
      productId: 'product-1',
      categoryId: 'category-1',
    });
  });

  it('should not emit a report when dateFrom is null', () => {
    component.dateFrom.set(null);
    component.dateTo.set(new Date(2025, 5, 20));

    component.generateReport();

    expect(hostComponent.onGenerateReport).not.toHaveBeenCalled();
  });

  it('should not emit a report when dateTo is null', () => {
    component.dateFrom.set(new Date(2025, 5, 15));
    component.dateTo.set(null);

    component.generateReport();

    expect(hostComponent.onGenerateReport).not.toHaveBeenCalled();
  });

  it('should pad month and day with leading zeros', () => {
    component.dateFrom.set(new Date(2025, 0, 1));
    component.dateTo.set(new Date(2025, 11, 31));

    component.generateReport();

    expect(hostComponent.onGenerateReport).toHaveBeenCalledWith({
      dateFrom: '2025-01-01',
      dateTo: '2025-12-31',
      type: 'DETAILED',
      format: 'PDF',
      customerId: undefined,
      productId: undefined,
      categoryId: undefined,
    });
  });
});
