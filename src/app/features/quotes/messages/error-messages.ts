export const QUOTE_ERROR_MESSAGES = {
  create: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al crear el presupuesto. Por favor, intente nuevamente.',
    life: 5000,
  },
  update: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al actualizar el presupuesto. Por favor, intente nuevamente.',
    life: 5000,
  },
  load: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al cargar el presupuesto. Es posible que no exista.',
    life: 5000,
  },
  delete: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al eliminar el presupuesto. Por favor, intente nuevamente.',
    life: 5000,
  },
  send: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al enviar el presupuesto. Por favor, intente nuevamente.',
    life: 5000,
  },
  accept: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al aceptar el presupuesto. Por favor, intente nuevamente.',
    life: 5000,
  },
  reject: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al rechazar el presupuesto. Por favor, intente nuevamente.',
    life: 5000,
  },
  cancel: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al cancelar el presupuesto. Por favor, intente nuevamente.',
    life: 5000,
  },
  convertToOrder: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al convertir el presupuesto a pedido. Por favor, intente nuevamente.',
    life: 5000,
  },
  convertToInvoice: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al convertir el presupuesto a factura. Por favor, intente nuevamente.',
    life: 5000,
  },
};

export const QUOTE_HTTP_ERRORS: Record<number, string> = {
  0: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
  400: 'Los datos del presupuesto son incorrectos. Verifica la información.',
  404: 'Presupuesto no encontrado.',
  409: 'El presupuesto no puede ser modificado en su estado actual.',
  500: 'Error interno del servidor. Por favor, intenta más tarde.',
};
