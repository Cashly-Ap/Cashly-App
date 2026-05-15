export const QUOTE_SUCCESS_MESSAGES = {
  created: {
    severity: 'success' as const,
    summary: 'Éxito',
    detail: 'Presupuesto creado exitosamente',
    life: 3000,
  },
  updated: {
    severity: 'success' as const,
    summary: 'Éxito',
    detail: 'Presupuesto actualizado exitosamente',
    life: 3000,
  },
  deleted: {
    severity: 'success' as const,
    summary: 'Éxito',
    detail: 'Presupuesto eliminado exitosamente',
    life: 3000,
  },
  convertedToOrder: {
    severity: 'success' as const,
    summary: 'Éxito',
    detail: 'Presupuesto convertido a pedido exitosamente',
    life: 3000,
  },
  convertedToInvoice: {
    severity: 'success' as const,
    summary: 'Éxito',
    detail: 'Presupuesto convertido a factura exitosamente',
    life: 3000,
  },
};
