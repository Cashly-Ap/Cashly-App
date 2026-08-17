export const CUSTOMER_ERROR_MESSAGES = {
  create: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al crear el cliente. Por favor, intente nuevamente.',
    life: 5000,
  },
  update: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al actualizar el cliente. Por favor, intente nuevamente.',
    life: 5000,
  },
  load: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al cargar el cliente. Es posible que no exista.',
    life: 5000,
  },
  delete: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al eliminar el cliente. Por favor, intente nuevamente.',
    life: 5000,
  },
  changePortalPassword: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al cambiar la contraseña. Por favor, intente nuevamente.',
    life: 5000,
  },
};

export const CUSTOMER_HTTP_ERRORS: Record<number, string> = {
  0: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
  400: 'Los datos del cliente son incorrectos. Verifica la información.',
  404: 'Cliente no encontrado.',
  409: 'Ya existe un cliente con ese RIF.',
  500: 'Error interno del servidor. Por favor, intenta más tarde.',
};
