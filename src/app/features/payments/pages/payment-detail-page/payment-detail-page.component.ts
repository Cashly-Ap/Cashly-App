import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import {
  DetailsCardComponent,
  DetailsCardHeaderComponent,
  DetailsInfoFieldComponent,
  DetailsInfoGridComponent,
} from '@shared/components/details';
import {
  LoadingSpinnerComponent,
  PageHeaderComponent,
} from '@shared/components/ui';
import { PaymentApplicationService } from '@features/payments/services/application/payment-application.service';


@Component({
  selector: 'app-payment-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    DecimalPipe,
    MainLayoutComponent,
    ButtonModule,
    ConfirmDialogModule,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './payment-detail-page.component.html',
})
export class PaymentDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(PaymentApplicationService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly payment = this.service.currentPayment;
  readonly loading = this.service.loading;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.loadPaymentById(id).subscribe({
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el pago. Es posible que no exista.',
            life: 5000,
          });
          this.router.navigate(['/payments']);
        },
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/payments']);
  }

  onDelete(): void {
    const p = this.payment();
    if (!p) return;

    this.confirmationService.confirm({
      header: 'Eliminar Pago',
      message: `¿Estás seguro de que deseas eliminar el pago "${p.paymentNumber}"? Esta acción no se puede deshacer.`,
      acceptIcon: 'pi pi-trash',
      acceptLabel: 'Eliminar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.service.deletePayment(p.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Pago eliminado exitosamente',
              life: 3000,
            });
            this.router.navigate(['/payments']);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || 'No se pudo eliminar el pago.',
              life: 5000,
            });
          },
        });
      },
    });
  }

  onEdit(): void {
    const p = this.payment();
    if (p) {
      this.router.navigate(['/payments', p.id, 'edit']);
    }
  }
}
