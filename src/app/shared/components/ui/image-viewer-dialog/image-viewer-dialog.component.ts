import { Component, input, output, computed, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { FileDownloadHelper } from '@shared/utils/file-download.helper';

@Component({
  selector: 'app-image-viewer-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, TooltipModule],
  templateUrl: './image-viewer-dialog.component.html',
})
export class ImageViewerDialogComponent {
  visible = input.required<boolean>();
  imageUrl = input.required<string | null>();
  title = input<string>('Visualizar Imagen');
  downloadable = input<boolean>(true);
  downloadFilename = input<string | undefined>(undefined);

  visibleChange = output<boolean>();

  dialogVisible = computed(() => this.visible());
  isImageLoaded = signal<boolean>(false);
  isImageError = signal<boolean>(false);
  zoomLevel = signal<number>(1);

  onHide(): void {
    this.resetZoom();
    this.visibleChange.emit(false);
  }

  onImageLoad(): void {
    this.isImageLoaded.set(true);
    this.isImageError.set(false);
  }

  onImageError(): void {
    this.isImageError.set(true);
    this.isImageLoaded.set(false);
  }

  async onDownload(): Promise<void> {
    const url = this.imageUrl();
    if (url) {
      await FileDownloadHelper.downloadImage(url, this.downloadFilename());
    }
  }

  zoomIn(): void {
    this.zoomLevel.update((current) => Math.min(current + 0.25, 3));
  }

  zoomOut(): void {
    this.zoomLevel.update((current) => Math.max(current - 0.25, 0.5));
  }

  resetZoom(): void {
    this.zoomLevel.set(1);
  }

  get zoomStyle() {
    return {
      transform: `scale(${this.zoomLevel()})`,
      transition: 'transform 0.2s ease-in-out',
    };
  }
}
