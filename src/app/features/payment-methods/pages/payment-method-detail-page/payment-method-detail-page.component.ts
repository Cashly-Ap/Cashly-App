import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
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
  StatusBadgeComponent,
} from '@shared/components/ui';
import { PaymentMethodApplicationService } from '@features/payment-methods/services/application/payment-method-application';

@Component({
  selector: 'app-payment-method-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    MainLayoutComponent,
    ButtonModule,
    ConfirmDialogModule,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './payment-method-detail-page.component.html',
})
export class PaymentMethodDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(PaymentMethodApplicationService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly paymentMethod = this.service.currentPaymentMethod;
  readonly loading = this.service.loading;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.loadPaymentMethodById(id).subscribe({
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el método de pago. Es posible que no exista.',
            life: 5000,
          });
          this.router.navigate(['/payment-methods']);
        },
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/payment-methods']);
  }

  onEdit(): void {
    const id = this.paymentMethod()?.id;
    if (id) {
      this.router.navigate(['/payment-methods', id, 'edit']);
    }
  }

  onDelete(): void {
    const pm = this.paymentMethod();
    if (!pm) return;

    this.confirmationService.confirm({
      header: 'Eliminar Método de Pago',
      message: `¿Estás seguro de que deseas eliminar "${pm.name}"? Esta acción no se puede deshacer.`,
      acceptIcon: 'pi pi-trash',
      acceptLabel: 'Eliminar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.service.deletePaymentMethod(pm.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Método de pago eliminado exitosamente',
              life: 3000,
            });
            this.router.navigate(['/payment-methods']);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || 'No se pudo eliminar el método de pago. Verifica que no tenga pagos asociados.',
              life: 5000,
            });
          },
        });
      },
    });
  }
}
