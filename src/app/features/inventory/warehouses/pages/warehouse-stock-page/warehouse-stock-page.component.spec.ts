import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { WarehouseStockPageComponent } from '@features/inventory/warehouses/pages/warehouse-stock-page/warehouse-stock-page.component';
import { WarehouseApplicationService } from '@features/inventory/warehouses/services/application/warehouse-application.service';

describe('WarehouseStockPageComponent', () => {
  let fixture: ComponentFixture<WarehouseStockPageComponent>;
  let component: WarehouseStockPageComponent;
  let router: Router;
  const service = {
    loadById: vi.fn().mockReturnValue(of({ name: 'Central' })),
    getStock: vi.fn().mockReturnValue(
      of([
        { productId: 'p1', productName: 'Motor 10HP', composite: true, quantity: 5 },
        { productId: 'p2', productName: 'Bomba', composite: false, quantity: 2 },
      ]),
    ),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WarehouseStockPageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'wh-1' } } } },
        { provide: WarehouseApplicationService, useValue: service },
        MessageService,
      ],
    });
    fixture = TestBed.createComponent(WarehouseStockPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('loads warehouse stock on init', () => {
    fixture.detectChanges();

    expect(service.getStock).toHaveBeenCalledWith('wh-1');
    expect(component.stock()).toHaveLength(2);
    expect(component.warehouseName()).toBe('Central');
    expect(fixture.nativeElement.textContent).not.toContain('Unidad');
    expect(fixture.nativeElement.textContent).toContain('Compuesto');
    expect(fixture.nativeElement.textContent).toContain('Simple');
  });

  it('filters stock and resets pagination', () => {
    fixture.detectChanges();
    component.page.set(2);

    component.onSearchChange('motor');

    expect(component.page()).toBe(0);
    expect(component.filteredStock()).toHaveLength(1);
  });

  it('returns to warehouse details', () => {
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.onBack();

    expect(navigateSpy).toHaveBeenCalledWith(['/warehouses', 'wh-1']);
  });
});
