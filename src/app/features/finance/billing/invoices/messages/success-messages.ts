export const INVOICE_SUCCESS_MESSAGES = {
  created: {
    severity: 'success' as const,
    summary: 'Éxito',
    detail: 'Factura creada exitosamente',
    life: 3000,
  },
  updated: {
    severity: 'success' as const,
    summary: 'Éxito',
    detail: 'Factura actualizada exitosamente',
    life: 3000,
  },
  cancelled: {
    severity: 'success' as const,
    summary: 'Éxito',
    detail: 'Factura cancelada exitosamente',
    life: 3000,
  },
  duplicated: {
    severity: 'success' as const,
    summary: 'Éxito',
    detail: 'Factura duplicada exitosamente',
    life: 3000,
  },
};
