import { Injectable, inject } from '@angular/core';
import { PdfViewerService } from '@core/pdf-viewer/services';
import { PDF_HANDLERS } from '@shared/services/pdf-handlers.token';

@Injectable({ providedIn: 'root' })
export class PdfActionService {
  private readonly handlers = inject(PDF_HANDLERS);
  private readonly viewer = inject(PdfViewerService);

  open(resource: string, id: string, label: string): void {
    const handler = this.handlers.find((item) => item.resource === resource);
    if (!handler) return;
    this.viewer.open(handler.build(id, label));
  }
}
