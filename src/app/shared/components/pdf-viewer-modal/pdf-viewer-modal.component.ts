import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-viewer-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, CommonModule, DialogModule, ProgressSpinnerModule],
  templateUrl: './pdf-viewer-modal.component.html',
})
export class PdfViewerModalComponent {
  readonly visible = input(false);
  readonly pdfUrl = input<SafeResourceUrl | null>(null);
  readonly title = input('');
  readonly loading = input(false);

  readonly visibleChange = output<boolean>();
}
