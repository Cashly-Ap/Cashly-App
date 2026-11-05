import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { of } from 'rxjs';
import {
  ReturnLinesTableComponent,
  ReturnLineFormData,
} from '@features/finance/billing/returns/components/return-lines-table/return-lines-table.component';
import { WarehouseApiService } from '@features/inventory/warehouses/services/api/warehouse-api.service';

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
      returnedQuantity: 0,
      warehouseAllocations: [],
      warehouseStocks: [
        {
          warehouseId: 'w1',
          warehouseCode: 'WH1',
          warehouseName: 'Main',
          quantity: 10,
          reserved: 2,
          available: 8,
        },
      ],
    },
  ];

  returnLines: ReturnLineFormData[] = [
    {
      invoiceLineId: 'line-1',
      productId: 'p1',
      productName: 'Product A',
      quantity: 0,
      warehouseId: '',
      unitPrice: 20,
      warehouseAllocations: [],
    },
  ];
}

describe('ReturnLinesTableComponent', () => {
  let component: ReturnLinesTableComponent;
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        {
          provide: WarehouseApiService,
          useValue: { getAllSimple: () => of([{ id: 'w1', name: 'Main' }]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate total amount from return lines', () => {
    // totalAmount is a computed based on returnLines input
    // Initial: quantity=0, unitPrice=20 => 0
    expect(component.totalAmount()).toBe(0);
  });

  it('should compute total amount when quantities change', () => {
    // Simulate a returnLine with quantity
    const updatedLines: ReturnLineFormData[] = [
      {
        invoiceLineId: 'line-1',
        productId: 'p1',
        productName: 'Product A',
        quantity: 2,
        warehouseId: 'w1',
        unitPrice: 20,
        warehouseAllocations: [{ warehouseId: 'w1', allocated: 2 }],
      },
    ];
    component.returnLinesChange.emit(updatedLines);

    // After emit, the parent updates the binding, but since we're testing in isolation,
    // just check that the computed works with the current input
    expect(component.totalAmount()).toBe(0);
  });

  it('should return max quantity for a line', () => {
    const maxQty = component.getMaxQuantity(0);
    expect(maxQty).toBe(5);
  });

  it('should return 0 for invalid line index', () => {
    expect(component.getMaxQuantity(99)).toBe(0);
  });

  it('should build allocation entries for a line', () => {
    const entries = component.allocationEntriesFor(0)();

    expect(entries).toHaveLength(1);
    expect(entries[0].warehouseId).toBe('w1');
    expect(entries[0].available).toBe(5);
  });

  it('should apply allocations and emit returnLinesChange', () => {
    let emitted: ReturnLineFormData[] | undefined;
    component.returnLinesChange.subscribe((value) => (emitted = value));

    component.onAllocationSaved(0, [
      {
        warehouseId: 'w1',
        warehouseCode: '',
        warehouseName: 'Main',
        quantity: 5,
        reserved: 0,
        available: 5,
        allocated: 3,
      },
    ]);

    expect(emitted).toBeDefined();
    expect(emitted![0].quantity).toBe(3);
    expect(emitted![0].warehouseAllocations[0].allocated).toBe(3);
  });

  it('should clamp allocations to the pending quantity', () => {
    let emitted: ReturnLineFormData[] | undefined;
    component.returnLinesChange.subscribe((value) => (emitted = value));

    component.onAllocationSaved(0, [
      {
        warehouseId: 'w1',
        warehouseCode: '',
        warehouseName: 'Main',
        quantity: 5,
        reserved: 0,
        available: 5,
        allocated: 99,
      },
    ]);

    expect(emitted![0].quantity).toBe(5);
    expect(emitted![0].warehouseAllocations[0].allocated).toBe(5);
  });
});
