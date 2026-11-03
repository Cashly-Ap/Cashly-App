import { describe, expect, it, vi } from 'vitest';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import {
  cancelAction,
  confirmAction,
  convertToInvoiceAction,
  convertToOrderAction,
  deleteAction,
  duplicateInvoiceAction,
  editAction,
  listAction,
  pdfAction,
  viewAction,
} from './list-action-builders';

describe('list action builders', () => {
  it('builds the common record actions with the shared labels and icons', () => {
    const command = vi.fn();

    expect(viewAction(command)).toEqual({
      label: 'Ver detalle',
      requiredAction: 'READ',
      icon: 'pi pi-eye',
      command,
    });
    expect(editAction(command)).toEqual({
      label: 'Editar',
      requiredAction: 'UPDATE',
      icon: 'pi pi-pencil',
      command,
    });
    expect(deleteAction(command)).toEqual({
      label: 'Eliminar',
      requiredAction: 'DELETE',
      icon: 'pi pi-trash',
      danger: true,
      command,
    });
    expect(pdfAction(command)).toEqual({
      label: 'Descargar PDF',
      requiredAction: 'EXPORT',
      icon: 'pi pi-file-pdf',
      command,
    });
  });

  it('builds document actions with their module and danger defaults', () => {
    const command = vi.fn();

    expect(convertToOrderAction(command)).toMatchObject({
      label: 'Convertir a pedido',
      requiredAction: 'CREATE',
      module: BusinessModule.SALES_ORDERS,
      icon: 'pi pi-shopping-cart',
    });
    expect(convertToInvoiceAction(command)).toMatchObject({
      label: 'Convertir a factura',
      module: BusinessModule.FINANCE_INVOICES,
    });
    expect(cancelAction('Cancelar presupuesto', command)).toMatchObject({
      label: 'Cancelar presupuesto',
      requiredAction: 'CANCEL',
      icon: 'pi pi-times',
      danger: true,
    });
    expect(confirmAction('Confirmar compra', command)).toMatchObject({
      label: 'Confirmar compra',
      requiredAction: 'CONFIRM',
      icon: 'pi pi-check',
    });
    expect(duplicateInvoiceAction(command)).toMatchObject({
      label: 'Duplicar factura',
      icon: 'pi pi-copy',
    });
  });

  it('keeps custom options such as disabled and module', () => {
    const action = listAction('Ver saldo', 'READ', 'wallet', vi.fn(), {
      module: BusinessModule.CONTACTS_CUSTOMERS,
      disabled: true,
    });

    expect(action).toMatchObject({
      label: 'Ver saldo',
      icon: 'pi pi-wallet',
      module: BusinessModule.CONTACTS_CUSTOMERS,
      disabled: true,
    });
  });
});
