import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WarehouseMovementsPageComponent } from '@features/inventory/warehouses/pages/warehouse-movements-page/warehouse-movements-page.component';
import { WarehouseApplicationService } from '@features/inventory/warehouses/services/application/warehouse-application.service';

describe('WarehouseMovementsPageComponent', () => {
  let fixture: ComponentFixture<WarehouseMovementsPageComponent>;
  let component: WarehouseMovementsPageComponent;
  let router: Router;
  const service = {
    loadById: vi.fn().mockReturnValue(of({ name: 'Central' })),
    getMovements: vi.fn().mockReturnValue(
      of({
        content: [
          {
            id: 'm1',
            movementType: 'ENTRY',
            productName: 'Motor',
            productCode: 'M-1',
            quantity: 2,
            previousStock: 3,
            newStock: 5,
            createdAt: '2026-08-17T10:00:00Z',
          },
        ],
        number: 0,
        totalPages: 1,
        totalElements: 1,
      }),
    ),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WarehouseMovementsPageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'wh-1' } } } },
        { provide: WarehouseApplicationService, useValue: service },
        MessageService,
      ],
    });
    fixture = TestBed.createComponent(WarehouseMovementsPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('loads movements on init', () => {
    fixture.detectChanges();

    expect(service.getMovements).toHaveBeenCalledWith('wh-1', { page: 0, size: 15 });
    expect(component.movements()).toHaveLength(1);
  });

  it('renders the movement type as a semantic badge', () => {
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('app-text-badge span') as HTMLElement;

    expect(badge.textContent?.trim()).toBe('Entrada');
    expect(badge.className).toContain('bg-green-100');
  });

  it.each([
    ['ENTRY', 'success'],
    ['RETURN_ENTRY', 'success'],
    ['CANCEL_ENTRY', 'success'],
    ['EXIT', 'danger'],
    ['COMPONENT_EXIT', 'danger'],
    ['SALE_EXIT', 'danger'],
    ['ADJUSTMENT', 'warning'],
    ['TRANSFER_IN', 'info'],
    ['TRANSFER_OUT', 'info'],
    ['UNKNOWN', 'secondary'],
  ])('maps %s movements to the %s badge variant', (movementType, expectedVariant) => {
    expect(component.getMovementTypeVariant(movementType)).toBe(expectedVariant);
  });

  it('reloads the first page with the selected movement type', () => {
    fixture.detectChanges();

    component.onTypeChange('EXIT');

    expect(service.getMovements).toHaveBeenLastCalledWith('wh-1', {
      page: 0,
      size: 15,
      movementType: 'EXIT',
    });
  });

  it('returns to warehouse details', () => {
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.onBack();

    expect(navigateSpy).toHaveBeenCalledWith(['/warehouses', 'wh-1']);
  });
});
