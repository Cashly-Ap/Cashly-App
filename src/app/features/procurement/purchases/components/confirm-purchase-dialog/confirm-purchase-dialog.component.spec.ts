import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfirmPurchaseDialogComponent } from './confirm-purchase-dialog.component';
import { PurchaseApiService } from '@features/procurement/purchases/services/api/purchase-api.service';
import { PurchaseDetails } from '@features/procurement/purchases/models/interfaces/purchase-details.interface';
import { PurchaseStatus } from '@features/procurement/purchases/models/enums/purchase-status.enum';

describe('ConfirmPurchaseDialogComponent', () => {
  let response: Subject<PurchaseDetails>;
  const getById = vi.fn();
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
    getById.mockReset().mockReturnValue(response);
    TestBed.configureTestingModule({
      providers: [{ provide: PurchaseApiService, useValue: { getById } }],
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
    return { fixture, dialog, emit };
  }

  it('loads the purchase automatically when the dialog opens and shows its products', () => {
    const { dialog } = open();
    expect(getById).toHaveBeenCalledExactlyOnceWith('p1');
    expect(dialog.loading()).toBe(true);
    response.next(purchase);
    expect(dialog.confirmationModel().inventory?.rows).toEqual([
      expect.objectContaining({ productName: 'Product', warehouseName: 'Main', quantity: 2 }),
    ]);
    expect(dialog.canConfirm()).toBe(true);
  });

  it('does not load details until the dialog is visible', () => {
    const fixture = TestBed.createComponent(ConfirmPurchaseDialogComponent);
    fixture.componentRef.setInput('purchaseId', 'p1');
    fixture.detectChanges();
    expect(getById).not.toHaveBeenCalled();
  });

  it('blocks confirmation when the detail request fails', () => {
    const { dialog, emit } = open();
    response.error(new Error('Unavailable'));
    dialog.onConfirm();
    expect(emit).not.toHaveBeenCalled();
    expect(dialog.error()).toBe('procurement.purchases.confirmationPreviewUnavailable');
  });

  it('blocks an incomplete warehouse allocation preview', () => {
    const { dialog, emit } = open();
    response.next({ ...purchase, lines: [{ ...purchase.lines[0], allocations: [] }] });
    dialog.onConfirm();
    expect(emit).not.toHaveBeenCalled();
    expect(dialog.canConfirm()).toBe(false);
    expect(dialog.error()).toBe('procurement.purchases.confirmationPreviewIncomplete');
  });

  it('rejects details belonging to another purchase', () => {
    const { dialog, emit } = open();
    response.next({ ...purchase, id: 'another-purchase' });
    dialog.onConfirm();
    expect(dialog.details()).toBeNull();
    expect(emit).not.toHaveBeenCalled();
  });

  it('ignores a response received after the dialog closes', () => {
    const { fixture, dialog } = open();
    fixture.componentRef.setInput('visible', false);
    fixture.detectChanges();
    response.next(purchase);
    expect(dialog.details()).toBeNull();
  });

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
