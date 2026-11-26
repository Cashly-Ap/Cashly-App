export const INVOICE_ERROR_MESSAGES = {
  create: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al crear la factura. Por favor, intente nuevamente.',
    life: 5000,
  },
  update: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al actualizar la factura. Por favor, intente nuevamente.',
    life: 5000,
  },
  load: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al cargar la factura. Es posible que no exista.',
    life: 5000,
  },
  confirm: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Error al confirmar la factura. Por favor, intente nuevamente.',
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

interface InvoiceErrorResponse {
  status?: number;
  error?: unknown;
}

export function invoiceErrorDetail(error: unknown, fallback: string): string {
  const response = error as InvoiceErrorResponse | null;
  const details = response?.error;

  if (typeof details === 'string' && details.trim()) return details;
  if (details && typeof details === 'object') {
    const payload = details as { message?: unknown; error?: unknown };
    if (typeof payload.message === 'string' && payload.message.trim()) return payload.message;
    if (typeof payload.error === 'string' && payload.error.trim()) return payload.error;
  }

  const status = response?.status;
  if (typeof status === 'number' && INVOICE_HTTP_ERRORS[status]) {
    return INVOICE_HTTP_ERRORS[status];
  }

  return fallback;
}
