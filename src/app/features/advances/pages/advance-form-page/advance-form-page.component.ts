import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { FormContainerComponent } from '@core/forms/components/cards/form-container/form-container.component';
import { FormHeaderComponent } from '@core/forms/components/headers/form-header/form-header.component';
import { FormCardComponent } from '@core/forms/components/cards/form-card/form-card.component';
import { FormActionsComponent } from '@core/forms/components/headers/form-actions/form-actions.component';
import { AdvanceApplicationService } from '../../services/application/advance-application.service';
import { AdvanceCreate } from '../../models/interfaces';
import { CustomerList } from '@features/customers/models/interfaces';
import { CustomerPickerDialogComponent } from '@features/orders/components/customer-picker-dialog/customer-picker-dialog.component';

@Component({
  selector: 'app-advance-form-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputNumberModule,
    TextareaModule,
    MainLayoutComponent,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
    CustomerPickerDialogComponent,
  ],
  templateUrl: './advance-form-page.component.html',
})
export class AdvanceFormPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AdvanceApplicationService);
  private readonly messageService = inject(MessageService);

  readonly isSubmitting = signal<boolean>(false);
  readonly selectedCustomer = signal<CustomerList | null>(null);
  readonly selectedCustomerLabel = signal<{ alias: string; legalName: string } | null>(null);
  readonly pickerVisible = signal<boolean>(false);

  readonly submitTooltip = signal('');

  private readonly FIELD_LABELS: Record<string, string> = {
    customerId: 'Cliente',
    amount: 'Monto',
  };

  readonly form = this.fb.group({
    customerId: ['', [Validators.required]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    notes: ['', [Validators.maxLength(1000)]],
  });

  ngOnInit(): void {
    this.form.statusChanges.subscribe(() => this.updateSubmitTooltip());
    this.updateSubmitTooltip();
  }

  private updateSubmitTooltip(): void {
    const invalid = Object.entries(this.FIELD_LABELS)
      .filter(([key]) => this.form.get(key)?.invalid)
      .map(([, label]) => label);
    this.submitTooltip.set(invalid.length ? `Campos requeridos: ${invalid.join(', ')}` : '');
  }

  openPicker(): void {
    this.pickerVisible.set(true);
  }

  onCustomerSelected(customer: CustomerList): void {
    this.selectedCustomer.set(customer);
    this.selectedCustomerLabel.set({ alias: customer.alias, legalName: customer.legalName });
    this.form.patchValue({ customerId: customer.id });
    this.pickerVisible.set(false);
  }

  onPickerCancelled(): void {
    this.pickerVisible.set(false);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.form.value;

    const payload: AdvanceCreate = {
      customerId: formValue.customerId ?? '',
      amount: formValue.amount ?? 0,
      notes: formValue.notes || undefined,
    };

    this.service.create(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Anticipo creado exitosamente',
          life: 3000,
        });
        this.router.navigate(['/advances']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.isSubmitting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Error al crear el anticipo',
          life: 5000,
        });
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/advances']);
  }
}
