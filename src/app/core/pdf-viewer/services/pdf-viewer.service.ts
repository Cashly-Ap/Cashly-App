import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PdfViewerConfig, PdfViewerState } from '@core/pdf-viewer/models';

@Injectable({ providedIn: 'root' })
export class PdfViewerService {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  private state = signal<PdfViewerState>({
    visible: false,
    loading: false,
    error: null,
    pdfBlobUrl: null,
    config: null,
  });

  visible = computed(() => this.state().visible);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);
  config = computed(() => this.state().config);

  pdfSafeUrl = computed<SafeResourceUrl | null>(() => {
    const blobUrl = this.state().pdfBlobUrl;
    if (!blobUrl) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
  });

  open(config: PdfViewerConfig): void {
    this.cleanupBlobUrl();

    this.state.update((s) => ({
      ...s,
      visible: true,
      loading: true,
      error: null,
      config,
    }));

    let params = new HttpParams();
    if (config.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        params = params.set(key, value);
      });
    }

    this.http.get(config.url, { params, responseType: 'blob' }).subscribe({
      next: (blob) => {
        const blobUrl = URL.createObjectURL(blob);
        this.state.update((s) => ({
          ...s,
          loading: false,
          pdfBlobUrl: blobUrl,
        }));
      },
      error: (err) => {
        const errorMessage = err.status === 404 ? 'El documento PDF no fue encontrado' : 'Error al cargar el documento PDF. Por favor, intente nuevamente.';
        this.state.update((s) => ({
          ...s,
          loading: false,
          error: errorMessage,
        }));
      },
    });
  }

  close(): void {
    this.cleanupBlobUrl();
    this.state.set({
      visible: false,
      loading: false,
      error: null,
      pdfBlobUrl: null,
      config: null,
    });
  }

  download(): void {
    const blobUrl = this.state().pdfBlobUrl;
    const config = this.state().config;

    if (!blobUrl || !config) return;

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = config.fileName || 'documento.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  openFullscreen(): void {
    const blobUrl = this.state().pdfBlobUrl;
    if (!blobUrl) return;

    window.open(blobUrl, '_blank');
  }

  private cleanupBlobUrl(): void {
    const currentBlobUrl = this.state().pdfBlobUrl;
    if (currentBlobUrl) {
      URL.revokeObjectURL(currentBlobUrl);
    }
  }
}
