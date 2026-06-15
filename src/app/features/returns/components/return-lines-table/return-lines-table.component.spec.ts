import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { of } from 'rxjs';
import { ReturnLinesTableComponent } from './return-lines-table.component';
import { ReturnLineFormData } from '../../models/interfaces';
import { WarehouseApiService } from '@features/warehouses/services/api/warehouse-api.service';

@Component({
  template: `<app-return-lines-table
    [invoiceLines]="invoiceLines"
    [(returnLines)]="returnLines"
  />`,
  imports: [ReturnLinesTableComponent],
})
class HostComponent {
  invoiceLines = [
    {
      id: 'line-1',
      productId: 'p1',
      productName: 'Product A',
      productCode: 'P001',
      quantity: 5,
      unitPrice: 20,
      lineTotal: 100,
      warehouseAllocations: [],
      warehouseStocks: [
        { warehouseId: 'w1', warehouseCode: 'WH1', warehouseName: 'Main', quantity: 10, reserved: 2, available: 8 },
      ],
    },
  ];

  returnLines: ReturnLineFormData[] = [
    { invoiceLineId: 'line-1', productId: 'p1', productName: 'Product A', quantity: 0, warehouseId: '', unitPrice: 20 },
  ];
}

describe('ReturnLinesTableComponent', () => {
  let component: ReturnLinesTableComponent;
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: WarehouseApiService, useValue: { getAllSimple: () => of([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate total amount', () => {
    host.returnLines = [
      { invoiceLineId: 'line-1', productId: 'p1', productName: 'Product A', quantity: 2, warehouseId: 'w1', unitPrice: 20 },
    ];
    fixture.detectChanges();
    expect(component.totalAmount()).toBe(40);
  });

  it('should have warehouse options', () => {
    const options = component.warehouseOptions();
    expect(options.length).toBe(1);
    expect(options[0].value).toBe('w1');
  });

  it('should not exceed max quantity', () => {
    let emitted: any;
    component.returnLinesChange.subscribe((v) => (emitted = v));
    component.onQuantityChange(0, 10);
    expect(emitted[0].quantity).toBe(5);
  });

  it('should not go below zero', () => {
    let emitted: any;
    component.returnLinesChange.subscribe((v) => (emitted = v));
    component.onQuantityChange(0, -1);
    expect(emitted[0].quantity).toBe(0);
  });

  it('should get max quantity', () => {
    expect(component.getMaxQuantity(0)).toBe(5);
  });

  it('should get available stock', () => {
    expect(component.getAvailableStock(0, 'w1')).toBe(8);
    expect(component.getAvailableStock(0, 'w2')).toBe(0);
  });
});
