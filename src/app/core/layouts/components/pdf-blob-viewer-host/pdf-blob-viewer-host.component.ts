import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PdfViewerModalComponent } from '@shared/components/pdf-viewer-modal/pdf-viewer-modal.component';
import { PdfBlobViewerService } from '@shared/services/pdf-blob-viewer.service';

@Component({
  selector: 'app-pdf-blob-viewer-host',
  standalone: true,
  imports: [PdfViewerModalComponent],
  templateUrl: './pdf-blob-viewer-host.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfBlobViewerHostComponent {
  readonly viewer = inject(PdfBlobViewerService);
}
