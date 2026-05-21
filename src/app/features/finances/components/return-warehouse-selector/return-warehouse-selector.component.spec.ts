import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReturnWarehouseSelectorComponent } from './return-warehouse-selector.component';

describe('ReturnWarehouseSelectorComponent', () => {
  let component: ReturnWarehouseSelectorComponent;
  let fixture: ComponentFixture<ReturnWarehouseSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnWarehouseSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReturnWarehouseSelectorComponent);
    component = fixture.componentInstance;
    component.selectedWarehouseId.set('');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have warehouse options', () => {
    expect(component.warehouseOptions().length).toBe(2);
  });

  it('should emit warehouse change', () => {
    let emitted: string | undefined;
    component.warehouseChange.subscribe((v) => (emitted = v));
    component.onChange('wh-1');
    expect(emitted).toBe('wh-1');
  });
});
