export const CUSTOMER_SUCCESS_MESSAGES = {
  created: {
    severity: 'success' as const,
    summary: 'Éxito',
    detail: 'Cliente creado exitosamente',
    life: 3000,
  },
  updated: {
    severity: 'success' as const,
    summary: 'Éxito',
    detail: 'Cliente actualizado exitosamente',
    life: 3000,
  },
  deleted: {
    severity: 'success' as const,
    summary: 'Éxito',
    detail: 'Cliente eliminado exitosamente',
    life: 3000,
  },
  portalPasswordChanged: {
    severity: 'success' as const,
    summary: 'Éxito',
    detail: 'Contraseña del portal actualizada exitosamente',
    life: 3000,
  },
};
