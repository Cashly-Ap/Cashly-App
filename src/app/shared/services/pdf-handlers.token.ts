import { InjectionToken } from '@angular/core';
import { PdfViewerConfig } from '@core/pdf-viewer/models';

export interface PdfHandlerRegistration {
  resource: string;
  build: (id: string, label: string) => PdfViewerConfig;
}

export const PDF_HANDLERS = new InjectionToken<PdfHandlerRegistration[]>('PDF_HANDLERS', {
  factory: () => [],
});
