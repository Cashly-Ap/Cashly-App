import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReturnLinesTableComponent } from './return-lines-table.component';

describe('ReturnLinesTableComponent', () => {
  let component: ReturnLinesTableComponent;
  let fixture: ComponentFixture<ReturnLinesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnLinesTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReturnLinesTableComponent);
    component = fixture.componentInstance;

    component.invoiceLines.set([
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
    ]);

    component.returnLines.set([
      { invoiceLineId: 'line-1', productId: 'p1', productName: 'Product A', quantity: 0, warehouseId: '', unitPrice: 20 },
    ]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate total amount', () => {
    component.returnLines.set([
      { invoiceLineId: 'line-1', productId: 'p1', productName: 'Product A', quantity: 2, warehouseId: 'w1', unitPrice: 20 },
    ]);
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
