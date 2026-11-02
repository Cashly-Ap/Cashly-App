export type DocumentListAction =
  | 'DELETE'
  | 'EDIT'
  | 'CONFIRM'
  | 'CANCEL'
  | 'CONVERT_TO_ORDER'
  | 'CONVERT_TO_INVOICE'
  | 'DUPLICATE';

const DOCUMENT_LIST_ACTIONS: Readonly<Record<string, DocumentListAction>> = {
  Eliminar: 'DELETE',
  Editar: 'EDIT',
  Confirmar: 'CONFIRM',
  'Confirmar compra': 'CONFIRM',
  Cancelar: 'CANCEL',
  'Cancelar compra': 'CANCEL',
  'Convertir a pedido': 'CONVERT_TO_ORDER',
  'Convertir a factura': 'CONVERT_TO_INVOICE',
  Duplicar: 'DUPLICATE',
};

export function documentListAction(label: string | null): DocumentListAction | undefined {
  return label && Object.hasOwn(DOCUMENT_LIST_ACTIONS, label)
    ? DOCUMENT_LIST_ACTIONS[label]
    : undefined;
}
