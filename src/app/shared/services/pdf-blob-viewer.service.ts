import { Injectable, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class PdfBlobViewerService {
  private readonly sanitizer = inject(DomSanitizer);
  private objectUrl: string | null = null;
  readonly visible = signal(false);
  readonly loading = signal(false);
  readonly title = signal('');
  readonly url = signal<SafeResourceUrl | null>(null);

  showLoading(title: string): void {
    this.revoke();
    this.title.set(title);
    this.url.set(null);
    this.loading.set(true);
    this.visible.set(true);
  }

  open(blob: Blob, title: string): void {
    this.revoke();
    this.objectUrl = URL.createObjectURL(blob);
    this.title.set(title);
    this.url.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl));
    this.loading.set(false);
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.loading.set(false);
    this.url.set(null);
    this.revoke();
  }

  private revoke(): void {
    if (!this.objectUrl) return;
    URL.revokeObjectURL(this.objectUrl);
    this.objectUrl = null;
  }
}
