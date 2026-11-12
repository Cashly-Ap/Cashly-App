import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Component, OnInit, input, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TextareaModule } from 'primeng/textarea';
import {
  TabContentComponent,
  TextInputComponent,
  SelectInputComponent,
  NumberInputComponent,
} from '@core/forms/components';
import { SUPPLIER_TYPES } from '@features/partners/suppliers/models/enums/supplier-type.enum';
import { PAYMENT_TYPES } from '@features/partners/customers/models/enums/payment-type.enum';

@Component({
  selector: 'app-supplier-general-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    ToggleSwitchModule,
    TextareaModule,
    TabContentComponent,
    TextInputComponent,
    SelectInputComponent,
    NumberInputComponent,
  ],
  templateUrl: './supplier-general-section.component.html',
})
export class SupplierGeneralSectionComponent implements OnInit {
  form = input.required<FormGroup>();
  isEditMode = input<boolean>(false);

  supplierTypes = [...SUPPLIER_TYPES];
  paymentTypes = [...PAYMENT_TYPES];

  ngOnInit(): void {
    this.onPaymentTypeChange(this.paymentTypeControl().value);
    this.paymentTypeControl().valueChanges.subscribe((value: string) =>
      this.onPaymentTypeChange(value),
    );
  }

  paymentTypeControl(): FormControl {
    return this.form().get('paymentType') as FormControl;
  }

  isCreditPayment(): boolean {
    return this.paymentTypeControl().value === 'CREDIT';
  }

  private onPaymentTypeChange(value: string): void {
    const creditDays = this.form().get('creditDays');
    const creditLimit = this.form().get('creditLimit');
    if (value === 'CASH') {
      creditDays?.setValue(0);
      creditLimit?.setValue(0);
      creditDays?.disable();
      creditLimit?.disable();
    } else {
      creditDays?.enable();
      creditLimit?.enable();
    }
  }

  control(name: string): FormControl {
    return this.form().get(name) as FormControl;
  }
}
