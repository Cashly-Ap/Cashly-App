import { HttpErrorResponse } from '@angular/common/http';
import { HttpErrorHandler } from './http-error.handler';

describe('HttpErrorHandler', () => {
  describe('handleCreateError', () => {
    it('should handle 400 error with custom message', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: { message: 'Invalid data provided' },
      });

      const result = HttpErrorHandler.handleCreateError(error, 'el cliente');

      expect(result).toEqual({
        severity: 'error',
        summary: 'Error al crear el cliente',
        detail: 'Invalid data provided',
        life: 5000,
      });
    });

    it('should handle 400 error without custom message', () => {
      const error = new HttpErrorResponse({ status: 400 });

      const result = HttpErrorHandler.handleCreateError(error, 'el cliente');

      expect(result.severity).toBe('error');
      expect(result.summary).toBe('Error al crear el cliente');
      expect(result.detail).toContain('Los datos proporcionados son inválidos');
      expect(result.life).toBe(5000);
    });

    it('should handle 409 conflict error', () => {
      const error = new HttpErrorResponse({ status: 409 });

      const result = HttpErrorHandler.handleCreateError(error, 'el cliente');

      expect(result).toEqual({
        severity: 'error',
        summary: 'Error al crear el cliente',
        detail: 'Ya existe el cliente con estos datos',
        life: 5000,
      });
    });

    it('should handle 500 server error', () => {
      const error = new HttpErrorResponse({ status: 500 });

      const result = HttpErrorHandler.handleCreateError(error, 'el cliente');

      expect(result).toEqual({
        severity: 'error',
        summary: 'Error al crear el cliente',
        detail: 'Error del servidor. Por favor, intente nuevamente más tarde.',
        life: 5000,
      });
    });

    it('should handle network error (status 0)', () => {
      const error = new HttpErrorResponse({ status: 0 });

      const result = HttpErrorHandler.handleCreateError(error, 'el cliente');

      expect(result).toEqual({
        severity: 'error',
        summary: 'Error al crear el cliente',
        detail:
          'No se pudo conectar con el servidor. Verifique su conexión a internet.',
        life: 5000,
      });
    });

    it('should handle unknown error status', () => {
      const error = new HttpErrorResponse({ status: 418 });

      const result = HttpErrorHandler.handleCreateError(error, 'el producto');

      expect(result.severity).toBe('error');
      expect(result.summary).toBe('Error al crear el producto');
      expect(result.detail).toContain(
        'Ha ocurrido un error al crear el producto',
      );
    });
  });

  describe('handleUpdateError', () => {
    it('should handle 400 error with custom message', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: { message: 'Invalid update data' },
      });

      const result = HttpErrorHandler.handleUpdateError(error, 'el cliente');

      expect(result.detail).toBe('Invalid update data');
      expect(result.summary).toBe('Error al actualizar el cliente');
    });

    it('should handle 404 not found error', () => {
      const error = new HttpErrorResponse({ status: 404 });

      const result = HttpErrorHandler.handleUpdateError(error, 'el cliente');

      expect(result.detail).toBe('el cliente no encontrado o fue eliminado');
    });

    it('should handle 409 conflict error', () => {
      const error = new HttpErrorResponse({ status: 409 });

      const result = HttpErrorHandler.handleUpdateError(error, 'el cliente');

      expect(result.detail).toBe('Ya existe el cliente con estos datos');
    });

    it('should handle 500 server error', () => {
      const error = new HttpErrorResponse({ status: 500 });

      const result = HttpErrorHandler.handleUpdateError(error, 'el cliente');

      expect(result.detail).toBe(
        'Error del servidor. Por favor, intente nuevamente más tarde.',
      );
    });

    it('should handle network error', () => {
      const error = new HttpErrorResponse({ status: 0 });

      const result = HttpErrorHandler.handleUpdateError(error, 'el cliente');

      expect(result.detail).toBe(
        'No se pudo conectar con el servidor. Verifique su conexión a internet.',
      );
    });
  });

  describe('handleDeleteError', () => {
    it('should handle 404 not found error', () => {
      const error = new HttpErrorResponse({ status: 404 });

      const result = HttpErrorHandler.handleDeleteError(error, 'el cliente');

      expect(result).toEqual({
        severity: 'error',
        summary: 'Error al eliminar el cliente',
        detail: 'el cliente no encontrado o ya fue eliminado',
        life: 5000,
      });
    });

    it('should handle 409 conflict error', () => {
      const error = new HttpErrorResponse({ status: 409 });

      const result = HttpErrorHandler.handleDeleteError(error, 'el cliente');

      expect(result.detail).toBe(
        'No se puede eliminar el cliente porque tiene registros asociados',
      );
    });

    it('should handle 500 server error', () => {
      const error = new HttpErrorResponse({ status: 500 });

      const result = HttpErrorHandler.handleDeleteError(error, 'el cliente');

      expect(result.detail).toBe(
        'Error del servidor. Por favor, intente nuevamente más tarde.',
      );
    });

    it('should handle network error', () => {
      const error = new HttpErrorResponse({ status: 0 });

      const result = HttpErrorHandler.handleDeleteError(error, 'el cliente');

      expect(result.detail).toBe(
        'No se pudo conectar con el servidor. Verifique su conexión a internet.',
      );
    });
  });

  describe('handleLoadError', () => {
    it('should handle 404 not found error', () => {
      const error = new HttpErrorResponse({ status: 404 });

      const result = HttpErrorHandler.handleLoadError(error, 'el cliente');

      expect(result).toEqual({
        severity: 'error',
        summary: 'Error al cargar el cliente',
        detail: 'el cliente no encontrado o fue eliminado',
        life: 5000,
      });
    });

    it('should handle 500 server error', () => {
      const error = new HttpErrorResponse({ status: 500 });

      const result = HttpErrorHandler.handleLoadError(error, 'el cliente');

      expect(result.detail).toBe(
        'Error del servidor. Por favor, intente nuevamente más tarde.',
      );
    });

    it('should handle network error', () => {
      const error = new HttpErrorResponse({ status: 0 });

      const result = HttpErrorHandler.handleLoadError(error, 'el cliente');

      expect(result.detail).toBe(
        'No se pudo conectar con el servidor. Verifique su conexión a internet.',
      );
    });

    it('should handle unknown error status', () => {
      const error = new HttpErrorResponse({ status: 503 });

      const result = HttpErrorHandler.handleLoadError(error, 'los datos');

      expect(result.severity).toBe('error');
      expect(result.summary).toBe('Error al cargar los datos');
      expect(result.detail).toContain(
        'Ha ocurrido un error al cargar los datos',
      );
    });
  });

  describe('createSuccessMessage', () => {
    it('should create success message with default life', () => {
      const result = HttpErrorHandler.createSuccessMessage(
        'Success',
        'Operation completed',
      );

      expect(result).toEqual({
        severity: 'success',
        summary: 'Success',
        detail: 'Operation completed',
        life: 3000,
      });
    });

    it('should create success message with custom life', () => {
      const result = HttpErrorHandler.createSuccessMessage(
        'Success',
        'Operation completed',
        5000,
      );

      expect(result.life).toBe(5000);
    });
  });

  describe('createWarningMessage', () => {
    it('should create warning message with default life', () => {
      const result = HttpErrorHandler.createWarningMessage(
        'Warning',
        'Be careful',
      );

      expect(result).toEqual({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Be careful',
        life: 3000,
      });
    });

    it('should create warning message with custom life', () => {
      const result = HttpErrorHandler.createWarningMessage(
        'Warning',
        'Be careful',
        4000,
      );

      expect(result.life).toBe(4000);
    });
  });

  describe('createInfoMessage', () => {
    it('should create info message with default life', () => {
      const result = HttpErrorHandler.createInfoMessage(
        'Info',
        'Just so you know',
      );

      expect(result).toEqual({
        severity: 'info',
        summary: 'Info',
        detail: 'Just so you know',
        life: 3000,
      });
    });

    it('should create info message with custom life', () => {
      const result = HttpErrorHandler.createInfoMessage(
        'Info',
        'Just so you know',
        6000,
      );

      expect(result.life).toBe(6000);
    });
  });
});
