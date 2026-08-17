export const WAREHOUSE_SUCCESS_MESSAGES = {
  registerEntry: 'Entradas registradas exitosamente',
  registerExit: 'Salidas registradas exitosamente',
  delete: 'Almacén eliminado exitosamente',
  toggleStatus: (active: boolean) => `Almacén ${active ? 'activado' : 'desactivado'} exitosamente`,
} as const;
