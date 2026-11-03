import { Provider } from '@angular/core';
import { PDF_HANDLERS, PdfHandlerRegistration } from '@shared/services/pdf-handlers.token';

export function providePdfHandler(): Provider {
  return {
    provide: PDF_HANDLERS,
    multi: true,
    useFactory: (): PdfHandlerRegistration => ({
      resource: 'orders',
      build: (id: string, label: string) => ({
        url: `/api/reports/orders/${id}/pdf`,
        title: `Pedido ${label}`,
        fileName: `pedido-${label}.pdf`,
      }),
    }),
  };
}
