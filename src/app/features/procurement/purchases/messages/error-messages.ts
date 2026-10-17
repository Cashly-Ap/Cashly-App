export const PURCHASE_ERROR_MESSAGES = {
  create: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al crear la compra. Por favor, intente nuevamente.',
    life: 5000,
  },
  update: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al actualizar la compra. Por favor, intente nuevamente.',
    life: 5000,
  },
  load: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al cargar la compra. Es posible que no exista.',
    life: 5000,
  },
  delete: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al eliminar la compra. Por favor, intente nuevamente.',
    life: 5000,
  },
  confirm: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al confirmar la compra. Por favor, intente nuevamente.',
    life: 5000,
  },
  cancel: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al cancelar la compra. Por favor, intente nuevamente.',
    life: 5000,
  },
};

export const PURCHASE_HTTP_ERRORS: Record<number, string> = {
  0: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
  400: 'Los datos de la compra son incorrectos. Verifica la información.',
  404: 'Compra no encontrada.',
  409: 'La compra no puede ser modificada en su estado actual.',
  500: 'Error interno del servidor. Por favor, intenta más tarde.',
};
