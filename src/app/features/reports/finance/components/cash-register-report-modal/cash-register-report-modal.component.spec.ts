import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Component } from '@angular/core';
import { CashRegisterReportModalComponent } from '@features/reports/finance/components/cash-register-report-modal/cash-register-report-modal.component';

@Component({
  template: `<app-cash-register-report-modal
    [visible]="visible"
    (visibleChange)="onVisibleChange($event)"
    (onGenerateExcel)="onGenerateExcel($event)"
  />`,
  imports: [CashRegisterReportModalComponent],
})
class HostComponent {
  visible = false;
  onVisibleChange = vi.fn();
  onGenerateExcel = vi.fn();
}

describe('CashRegisterReportModalComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let component: CashRegisterReportModalComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
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

  it('should emit onGenerateExcel with formatted date range when generateExcel is called', () => {
    component.dateFrom.set(new Date(2025, 5, 15));
    component.dateTo.set(new Date(2025, 5, 20));

    component.generateExcel();

    expect(hostComponent.onGenerateExcel).toHaveBeenCalledWith({
      dateFrom: '2025-06-15',
      dateTo: '2025-06-20',
      type: 'DETAILED',
    });
  });

  it('should not emit onGenerateExcel when dateFrom is null', () => {
    component.dateFrom.set(null);
    component.dateTo.set(new Date(2025, 5, 20));

    component.generateExcel();

    expect(hostComponent.onGenerateExcel).not.toHaveBeenCalled();
  });

  it('should not emit onGenerateExcel when dateTo is null', () => {
    component.dateFrom.set(new Date(2025, 5, 15));
    component.dateTo.set(null);

    component.generateExcel();

    expect(hostComponent.onGenerateExcel).not.toHaveBeenCalled();
  });

  it('should pad month and day with leading zeros', () => {
    component.dateFrom.set(new Date(2025, 0, 1));
    component.dateTo.set(new Date(2025, 11, 31));

    component.generateExcel();

    expect(hostComponent.onGenerateExcel).toHaveBeenCalledWith({
      dateFrom: '2025-01-01',
      dateTo: '2025-12-31',
      type: 'DETAILED',
    });
  });
});
