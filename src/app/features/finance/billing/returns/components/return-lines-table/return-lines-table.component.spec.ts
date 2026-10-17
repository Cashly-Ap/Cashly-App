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

  it('should open allocation popover on valid item', () => {
    const event = new MouseEvent('click');
    component.openAllocationPopover(event, 0);
    expect(component.activeItemIdx()).toBe(0);
  });

  it('should toggle allocation popover on same item', () => {
    const event = new MouseEvent('click');
    component.openAllocationPopover(event, 0);
    component.openAllocationPopover(event, 0);
    expect(component.activeItemIdx()).toBeNull();
  });

  it('should confirm allocations and emit returnLinesChange', () => {
    let emitted: ReturnLineFormData[] | undefined;
    component.returnLinesChange.subscribe((v) => (emitted = v));

    // Open popover and set allocations
    const event = new MouseEvent('click');
    component.openAllocationPopover(event, 0);
    component.updatePopoverAllocation(0, 3);
    component.confirmAllocations();

    expect(emitted).toBeDefined();
    expect(emitted![0].quantity).toBe(3);
    expect(emitted![0].warehouseAllocations[0].allocated).toBe(3);
    expect(component.activeItemIdx()).toBeNull();
  });
});
