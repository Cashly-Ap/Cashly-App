export const USER_ERROR_MESSAGES = {
  create: {
    summary: 'Error',
    detail: 'Error al crear el usuario. Por favor, intente nuevamente.',
  },
  update: {
    summary: 'Error',
    detail: 'Error al actualizar el usuario. Por favor, intente nuevamente.',
  },
  load: {
    summary: 'Error',
    detail: 'Error al cargar el usuario. Es posible que no exista.',
  },
  delete: {
    summary: 'Error',
    detail: 'Error al eliminar el usuario. Por favor, intente nuevamente.',
  },
};

export const USER_HTTP_ERRORS: Record<number, string> = {
  0: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
  400: 'Los datos del usuario son incorrectos. Verifica la información.',
  404: 'Usuario no encontrado.',
  409: 'Ya existe un usuario con ese correo electrónico.',
  500: 'Error interno del servidor. Por favor, intenta más tarde.',
};
