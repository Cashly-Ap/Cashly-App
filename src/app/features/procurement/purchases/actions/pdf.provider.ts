import { Provider } from '@angular/core';
import { PDF_HANDLERS, PdfHandlerRegistration } from '@shared/services/pdf-handlers.token';

export function providePdfHandler(): Provider {
  return {
    provide: PDF_HANDLERS,
    multi: true,
    useFactory: (): PdfHandlerRegistration => ({
      resource: 'purchases',
      build: (id: string, label: string) => ({
        url: `/api/reports/purchases/${id}/pdf`,
        title: `Compra ${label}`,
        fileName: `compra-${label}.pdf`,
      }),
    }),
  };
}
