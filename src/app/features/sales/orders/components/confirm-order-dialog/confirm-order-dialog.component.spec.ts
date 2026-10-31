import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfirmOrderDialogComponent } from './confirm-order-dialog.component';
import { OrderApiService } from '@features/sales/orders/services/api/order-api.service';
import { OrderDetails } from '@features/sales/orders/models/interfaces/order-details.interface';
import { OrderStatus } from '@features/sales/orders/models/enums/order-status.enum';
import { LanguageService } from '@core/i18n/language.service';
import { TranslationService } from '@core/i18n/translation.service';

describe('ConfirmOrderDialogComponent stock guard', () => {
  let response: Subject<OrderDetails>;
  const order: OrderDetails = {
    id: 'o1',
    orderNumber: '1',
    customerId: 'c1',
    customerAlias: 'Customer',
    customerLegalName: 'Customer',
    status: OrderStatus.DRAFT,
    notes: null,
    totalAmount: 10,
    createdAt: '',
    updatedAt: '',
    items: [
      {
        id: 'l1',
        productId: 'p1',
        productName: 'Product',
        productCode: 'P',
        quantity: 2,
        unitPrice: 5,
        subtotal: 10,
        warehouseAllocations: [
          {
            warehouseId: 'w1',
            warehouseName: 'Main',
            warehouseCode: 'W',
            allocated: 2,
            available: 2,
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    response = new Subject<OrderDetails>();
    TestBed.configureTestingModule({
      providers: [{ provide: OrderApiService, useValue: { getById: () => response } }],
    });
    TestBed.overrideComponent(ConfirmOrderDialogComponent, { set: { template: '', imports: [] } });
  });

  function open() {
    const fixture = TestBed.createComponent(ConfirmOrderDialogComponent);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('orderId', 'o1');
    fixture.detectChanges();
    const emit = vi.spyOn(fixture.componentInstance.confirmed, 'emit');
    return { fixture, dialog: fixture.componentInstance, emit };
  }

  it('cannot confirm while details are loading', () => {
    const { dialog, emit } = open();
    dialog.onConfirm();
    expect(emit).not.toHaveBeenCalled();
  });

  it('cannot confirm after a stock load failure', () => {
    const { dialog, emit } = open();
    response.error(new Error('Unavailable'));
    dialog.onConfirm();
    expect(emit).not.toHaveBeenCalled();
  });

  it('cannot confirm when stock is insufficient', () => {
    const { dialog, emit } = open();
    response.next({ ...order, items: [{ ...order.items[0], quantity: 3 }] });
    dialog.onConfirm();
    expect(emit).not.toHaveBeenCalled();
  });

  it('confirms once when available stock covers the order', () => {
    const { dialog, emit } = open();
    response.next(order);
    dialog.onConfirm();
    dialog.onConfirm();
    expect(emit).toHaveBeenCalledExactlyOnceWith('o1');
  });

  it('ignores a response arriving after the dialog closes', () => {
    const { fixture, dialog } = open();
    fixture.componentRef.setInput('visible', false);
    fixture.detectChanges();
    response.next(order);
    expect(dialog.details()).toBeNull();
  });

  it('uses English labels and inventory notices when English is selected', () => {
    const { dialog } = open();
    response.next(order);
    TestBed.inject(LanguageService).setLanguage('en');
    const translations = TestBed.inject(TranslationService);
    const model = dialog.confirmationModel();
    expect(translations.t(model.title)).toBe('Confirm order');
    expect(translations.t(model.subtitle)).toBe('Review stock before confirming the order');
    expect(translations.t(model.summaryFields?.[1].label)).toBe('Customer');
    expect(translations.t(model.notice?.title)).toBe(
      'Confirming this order will deduct its reserved stock from the assigned warehouses.',
    );
    expect(translations.t(model.acceptLabel)).toBe('Yes, confirm');
  });

  it('confirms against the stock already reserved by the draft even when free stock is zero', () => {
    const { dialog, emit } = open();
    response.next({
      ...order,
      items: [
        {
          ...order.items[0],
          warehouseAllocations: [{ ...order.items[0].warehouseAllocations[0], available: 0 }],
          warehouseStocks: [
            {
              warehouseId: 'w1',
              warehouseCode: 'W',
              warehouseName: 'Main',
              quantity: 2,
              reserved: 2,
              available: 0,
            },
          ],
        },
      ],
    });
    expect(dialog.canConfirm()).toBe(true);
    expect(dialog.confirmationModel().inventory?.rows[0].availableAfter).toBe(0);
    dialog.onConfirm();
    expect(emit).toHaveBeenCalledExactlyOnceWith('o1');
  });
});
