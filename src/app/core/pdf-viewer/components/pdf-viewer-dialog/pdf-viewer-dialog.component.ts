import { Component, inject, signal, HostListener, OnInit, OnDestroy } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { PdfViewerService } from '@core/pdf-viewer/services';

@Component({
  selector: 'app-pdf-viewer-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule, ProgressSpinnerModule, TooltipModule],
  templateUrl: './pdf-viewer-dialog.component.html',
})
export class PdfViewerDialogComponent implements OnInit, OnDestroy {
  protected pdfService = inject(PdfViewerService);

  isMobile = signal<boolean>(false);
  isSmallScreen = signal<boolean>(false);

  private readonly MOBILE_BREAKPOINT = 640;
  private readonly SMALL_SCREEN_BREAKPOINT = 768;

  ngOnInit(): void {
    this.checkScreenSize();
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const width = window.innerWidth;
    this.isMobile.set(width < this.MOBILE_BREAKPOINT);
    this.isSmallScreen.set(width < this.SMALL_SCREEN_BREAKPOINT);
  }

  onClose(): void {
    document.body.style.overflow = '';
    this.pdfService.close();
  }

  onDownload(): void {
    this.pdfService.download();
  }

  onFullscreen(): void {
    this.pdfService.openFullscreen();
  }

  onOpenInBrowser(): void {
    this.pdfService.openFullscreen();
    this.onClose();
  }

  getDialogStyle(): Record<string, string> {
    if (this.isMobile()) {
      return {
        width: '100vw',
        height: '100vh',
        maxHeight: '100vh',
        margin: '0',
        borderRadius: '0',
      };
    }
    if (this.isSmallScreen()) {
      return {
        width: '95vw',
        height: '95vh',
        maxHeight: '95vh',
      };
    }
    return {
      width: '90vw',
      height: '90vh',
      maxHeight: '90vh',
    };
  }

  getContentStyle(): Record<string, string> {
    if (this.isMobile()) {
      return {
        height: 'calc(100vh - 60px)',
        padding: '0',
        overflow: 'hidden',
      };
    }
    if (this.isSmallScreen()) {
      return {
        height: 'calc(95vh - 80px)',
        padding: '0',
        overflow: 'hidden',
      };
    }
    return {
      height: 'calc(90vh - 100px)',
      padding: '0',
      overflow: 'hidden',
    };
  }
}
