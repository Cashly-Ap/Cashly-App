export const INVOICE_ERROR_MESSAGES = {
  create: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al crear la factura. Por favor, intente nuevamente.',
    life: 5000,
  },
  load: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al cargar la factura. Es posible que no exista.',
    life: 5000,
  },
  cancel: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al cancelar la factura. Por favor, intente nuevamente.',
    life: 5000,
  },
  duplicate: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al duplicar la factura. Por favor, intente nuevamente.',
    life: 5000,
  },
};

export const INVOICE_HTTP_ERRORS: Record<number, string> = {
  0: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
  400: 'Los datos de la factura son incorrectos. Verifica la información.',
  404: 'Factura no encontrada.',
  409: 'La factura no puede ser modificada en su estado actual.',
  500: 'Error interno del servidor. Por favor, intenta más tarde.',
};