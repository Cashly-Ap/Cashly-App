import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorMessage {
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail: string;
  life?: number;
}

export class HttpErrorHandler {
  static handleCreateError(error: unknown, entityName: string): ErrorMessage {
    let detail = `Ha ocurrido un error al crear ${entityName}`;

    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        detail =
          error.error?.message ||
          `Los datos proporcionados son inválidos. Por favor, revise la información e intente nuevamente.`;
      } else if (error.status === 409) {
        detail = `Ya existe ${entityName} con estos datos`;
      } else if (error.status === 500) {
        detail = 'Error del servidor. Por favor, intente nuevamente más tarde.';
      } else if (error.status === 0) {
        detail = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
      }
    } else if (error instanceof Error) {
      detail = error.message;
    }

    return {
      severity: 'error',
      summary: `Error al crear ${entityName}`,
      detail,
      life: 5000,
    };
  }

  static handleUpdateError(error: unknown, entityName: string): ErrorMessage {
    let detail = `Ha ocurrido un error al actualizar ${entityName}`;

    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        detail =
          error.error?.message ||
          `Los datos proporcionados son inválidos. Por favor, revise la información e intente nuevamente.`;
      } else if (error.status === 404) {
        detail = `${entityName} no encontrado o fue eliminado`;
      } else if (error.status === 409) {
        detail = `Ya existe ${entityName} con estos datos`;
      } else if (error.status === 500) {
        detail = 'Error del servidor. Por favor, intente nuevamente más tarde.';
      } else if (error.status === 0) {
        detail = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
      }
    } else if (error instanceof Error) {
      detail = error.message;
    }

    return {
      severity: 'error',
      summary: `Error al actualizar ${entityName}`,
      detail,
      life: 5000,
    };
  }

  static handleDeleteError(error: unknown, entityName: string): ErrorMessage {
    let detail = `Ha ocurrido un error al eliminar ${entityName}`;

    if (error instanceof HttpErrorResponse) {
      if (error.status === 404) {
        detail = `${entityName} no encontrado o ya fue eliminado`;
      } else if (error.status === 409) {
        detail =
          error.error?.message ||
          `No se puede eliminar ${entityName} porque tiene registros asociados`;
      } else if (error.status === 500) {
        detail = 'Error del servidor. Por favor, intente nuevamente más tarde.';
      } else if (error.status === 0) {
        detail = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
      }
    } else if (error instanceof Error) {
      detail = error.message;
    }

    return {
      severity: 'error',
      summary: `Error al eliminar ${entityName}`,
      detail,
      life: 5000,
    };
  }

  static handleLoadError(error: unknown, entityName: string): ErrorMessage {
    let detail = `Ha ocurrido un error al cargar ${entityName}`;

    if (error instanceof HttpErrorResponse) {
      if (error.status === 404) {
        detail = `${entityName} no encontrado o fue eliminado`;
      } else if (error.status === 500) {
        detail = 'Error del servidor. Por favor, intente nuevamente más tarde.';
      } else if (error.status === 0) {
        detail = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
      }
    } else if (error instanceof Error) {
      detail = error.message;
    }

    return {
      severity: 'error',
      summary: `Error al cargar ${entityName}`,
      detail,
      life: 5000,
    };
  }

  static createSuccessMessage(summary: string, detail: string, life: number = 3000): ErrorMessage {
    return {
      severity: 'success',
      summary,
      detail,
      life,
    };
  }

  static createWarningMessage(summary: string, detail: string, life: number = 3000): ErrorMessage {
    return {
      severity: 'warn',
      summary,
      detail,
      life,
    };
  }

  static createInfoMessage(summary: string, detail: string, life: number = 3000): ErrorMessage {
    return {
      severity: 'info',
      summary,
      detail,
      life,
    };
  }
}
