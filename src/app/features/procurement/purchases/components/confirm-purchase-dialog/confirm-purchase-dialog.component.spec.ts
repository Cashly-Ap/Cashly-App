import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfirmPurchaseDialogComponent } from './confirm-purchase-dialog.component';
import { PurchaseApiService } from '@features/procurement/purchases/services/api/purchase-api.service';
import { PurchaseDetails } from '@features/procurement/purchases/models/interfaces/purchase-details.interface';
import { PurchaseStatus } from '@features/procurement/purchases/models/enums/purchase-status.enum';

describe('ConfirmPurchaseDialogComponent', () => {
  let response: Subject<PurchaseDetails>;
  const purchase: PurchaseDetails = {
    id: 'p1',
    purchaseNumber: '1',
    supplierId: 's1',
    supplierName: 'Supplier',
    supplierRif: '',
    createdBy: 'u1',
    createdByName: 'User',
    status: PurchaseStatus.DRAFT,
    notes: null,
    subtotal: 10,
    createdAt: '',
    updatedAt: '',
    lines: [
      {
        id: 'l1',
        productId: 'product',
        productName: 'Product',
        productCode: 'P',
        quantity: 2,
        unitCost: 5,
        subtotal: 10,
        allocations: [{ warehouseId: 'w1', warehouseName: 'Main', allocatedQuantity: 2 }],
        stockItems: [],
      },
    ],
  };

  beforeEach(() => {
    response = new Subject<PurchaseDetails>();
    TestBed.configureTestingModule({
      providers: [{ provide: PurchaseApiService, useValue: { getById: () => response } }],
    });
    TestBed.overrideComponent(ConfirmPurchaseDialogComponent, {
      set: { template: '', imports: [] },
    });
  });

  function open() {
    const fixture = TestBed.createComponent(ConfirmPurchaseDialogComponent);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('purchaseId', 'p1');
    fixture.detectChanges();
    const dialog = fixture.componentInstance;
    const emit = vi.spyOn(dialog.confirmed, 'emit');
    dialog.onDialogShow();
    return { dialog, emit };
  }

  it('blocks confirmation while loading', () => {
    const { dialog, emit } = open();
    dialog.onConfirm();
    expect(emit).not.toHaveBeenCalled();
  });

  it('allows replenishing a warehouse with no current stock once', () => {
    const { dialog, emit } = open();
    response.next(purchase);
    dialog.onConfirm();
    dialog.onConfirm();
    expect(emit).toHaveBeenCalledExactlyOnceWith('p1');
  });

  it('ignores details received after the dialog is reset', () => {
    const { dialog } = open();
    dialog.reset();
    response.next(purchase);
    expect(dialog.details()).toBeNull();
  });

  it('reads the available stock for the selected warehouse', () => {
    const { dialog } = open();
    expect(
      dialog.availableStock(
        {
          ...purchase.lines[0],
          stockItems: [
            {
              warehouseId: 'w1',
              warehouseCode: 'W',
              warehouseName: 'Main',
              quantity: 9,
              reserved: 3,
              available: 6,
            },
          ],
        },
        'w1',
      ),
    ).toBe(6);
  });
});
