export const ORDER_ERROR_MESSAGES = {
  create: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al crear el pedido. Por favor, intente nuevamente.',
    life: 5000,
  },
  update: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al actualizar el pedido. Por favor, intente nuevamente.',
    life: 5000,
  },
  load: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al cargar el pedido. Es posible que no exista.',
    life: 5000,
  },
  delete: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al eliminar el pedido. Por favor, intente nuevamente.',
    life: 5000,
  },
  confirm: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al confirmar el pedido. Por favor, intente nuevamente.',
    life: 5000,
  },
  cancel: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al cancelar el pedido. Por favor, intente nuevamente.',
    life: 5000,
  },
};

export const ORDER_HTTP_ERRORS: Record<number, string> = {
  0: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
  400: 'Los datos del pedido son incorrectos. Verifica la información.',
  404: 'Pedido no encontrado.',
  409: 'El pedido no puede ser modificado en su estado actual.',
  500: 'Error interno del servidor. Por favor, intenta más tarde.',
};
