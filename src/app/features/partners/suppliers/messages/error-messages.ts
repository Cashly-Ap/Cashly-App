export const SUPPLIER_ERROR_MESSAGES = {
  create: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al crear el proveedor. Por favor, intente nuevamente.',
    life: 5000,
  },
  update: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al actualizar el proveedor. Por favor, intente nuevamente.',
    life: 5000,
  },
  load: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al cargar el proveedor. Es posible que no exista.',
    life: 5000,
  },
  delete: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al eliminar el proveedor. Por favor, intente nuevamente.',
    life: 5000,
  },
};

export const SUPPLIER_HTTP_ERRORS: Record<number, string> = {
  0: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
  400: 'Los datos del proveedor son incorrectos. Verifica la información.',
  404: 'Proveedor no encontrado.',
  409: 'Ya existe un proveedor con ese RIF.',
  500: 'Error interno del servidor. Por favor, intenta más tarde.',
};
