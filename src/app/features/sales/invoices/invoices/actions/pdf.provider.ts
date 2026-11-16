import { Provider } from '@angular/core';
import { PDF_HANDLERS, PdfHandlerRegistration } from '@shared/services/pdf-handlers.token';

export function providePdfHandler(): Provider {
  return {
    provide: PDF_HANDLERS,
    multi: true,
    useFactory: (): PdfHandlerRegistration => ({
      resource: 'invoices',
      build: (id: string, label: string) => ({
        url: `/api/reports/invoices/${id}/pdf`,
        title: `Factura ${label}`,
        fileName: `factura-${label}.pdf`,
      }),
    }),
  };
}
