import { Provider } from '@angular/core';
import { PDF_HANDLERS, PdfHandlerRegistration } from '@shared/services/pdf-handlers.token';

export function providePdfHandler(): Provider {
  return {
    provide: PDF_HANDLERS,
    multi: true,
    useFactory: (): PdfHandlerRegistration => ({
      resource: 'quotes',
      build: (id: string, label: string) => ({
        url: `/api/reports/quotes/${id}/pdf`,
        title: `Presupuesto ${label}`,
        fileName: `presupuesto-${label}.pdf`,
      }),
    }),
  };
}
