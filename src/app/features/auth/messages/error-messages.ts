export const AUTH_HTTP_ERRORS: Record<number, string> = {
  0: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
  400: 'Los datos enviados son incorrectos. Verifica la información e intenta nuevamente.',
  401: 'Credenciales incorrectas. Verifica tu email y contraseña.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'Usuario no encontrado. Verifica tu email e intenta nuevamente.',
  500: 'Error interno del servidor. Por favor, intenta más tarde.',
  503: 'El servicio no está disponible temporalmente. Intenta más tarde.',
  504: 'El servidor tardó demasiado en responder. Intenta más tarde.',
};

export const AUTH_DEFAULT_ERROR_MESSAGE =
  'Ocurrió un error inesperado. Por favor, intenta nuevamente.';

export const AUTH_ERROR_MESSAGES = {
  changePassword: {
    severity: 'error',
    summary: 'Error',
    detail: 'Error al cambiar la contraseña. Por favor, intente nuevamente.',
  },
  changeUsername: {
    severity: 'error',
    summary: 'Error',
    detail: 'Error al cambiar el nombre de usuario. Por favor, intente nuevamente.',
  },
  changeCommissionDeduction: {
    severity: 'error',
    summary: 'Error',
    detail: 'Error al actualizar el deducible mensual. Por favor, intente nuevamente.',
  },
  sessionExpired: {
    severity: 'warn',
    summary: 'Sesión Expirada',
    detail: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
  },
  connectionError: {
    severity: 'error',
    summary: 'Error de Conexión',
    detail: 'No se puede conectar con el servidor. Por favor, inténtelo más tarde.',
  },
  serverError: {
    severity: 'error',
    summary: 'Error del Servidor',
    detail: 'Ha ocurrido un error en el servidor. Por favor, inténtelo más tarde.',
  },
  loginError: {
    severity: 'error',
    summary: 'Error de autenticación',
    detail: 'Error al iniciar sesión. Verifique sus credenciales.',
  },
};

export const AUTH_SESSION_MESSAGES = {
  expired: {
    severity: 'warn',
    summary: 'Sesión Expirada',
    detail: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
  },
  connectionError: {
    severity: 'error',
    summary: 'Error de Conexión',
    detail: 'No se puede conectar con el servidor. Por favor, inténtelo más tarde.',
  },
  serverError: {
    severity: 'error',
    summary: 'Error del Servidor',
    detail: 'Ha ocurrido un error en el servidor. Por favor, inténtelo más tarde.',
  },
  loginError: {
    severity: 'error',
    summary: 'Error de autenticación',
    detail: 'Error al iniciar sesión. Verifique sus credenciales.',
  },
};
