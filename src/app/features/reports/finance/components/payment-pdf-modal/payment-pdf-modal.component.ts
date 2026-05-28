import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FinancePdfApiService } from '../../services/api/finance-pdf-api.service';
import { MessageService } from 'primeng/api';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-payment-pdf-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
  ],
  templateUrl: './payment-pdf-modal.component.html',
})
export class PaymentPdfModalComponent {
  private readonly financePdfApi = inject(FinancePdfApiService);
  private readonly messageService = inject(MessageService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly visible = input(false);
  readonly visibleChange = output<boolean>();
  readonly paymentId = input<string | null>(null);

  readonly loading = signal(false);
  readonly pdfUrl = signal<SafeResourceUrl | null>(null);

  onHide(): void {
    this.visibleChange.emit(false);
    this.pdfUrl.set(null);
  }

  generatePdf(): void {
    const id = this.paymentId();
    if (!id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se encontró el ID del pago',
        life: 3000,
      });
      return;
    }

    this.loading.set(true);
    this.financePdfApi.getPaymentPdf(id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al generar el PDF del pago',
          life: 5000,
        });
        this.loading.set(false);
      },
    });
  }

  downloadPdf(): void {
    const url = this.pdfUrl();
    if (!url) return;

    const link = document.createElement('a');
    link.href = url.toString();
    link.download = `pago-${this.paymentId()}.pdf`;
    link.click();
  }
}
