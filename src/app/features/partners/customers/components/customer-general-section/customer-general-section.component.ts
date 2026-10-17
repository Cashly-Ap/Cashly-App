import { Component, input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TextareaModule } from 'primeng/textarea';
import {
  TabContentComponent,
  TextInputComponent,
  SelectInputComponent,
  NumberInputComponent,
} from '@core/forms/components';
import { CUSTOMER_TYPES } from '@features/partners/customers/models/enums/customer-type.enum';
import {
  PaymentType,
  PAYMENT_TYPES,
} from '@features/partners/customers/models/enums/payment-type.enum';

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-customer-general-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ToggleSwitchModule,
    TextareaModule,
    TabContentComponent,
    TextInputComponent,
    SelectInputComponent,
    NumberInputComponent,
  ],
  templateUrl: './customer-general-section.component.html',
})
export class CustomerGeneralSectionComponent implements OnInit {
  form = input.required<FormGroup>();
  isEditMode = input<boolean>(false);
  priceTypeOptions = input<SelectOption[]>([]);

  customerTypes = [...CUSTOMER_TYPES];
  paymentTypes = [...PAYMENT_TYPES];

  ngOnInit(): void {
    this.onPaymentTypeChange(this.paymentTypeControl().value);

    this.paymentTypeControl().valueChanges.subscribe((value: PaymentType) => {
      this.onPaymentTypeChange(value);
    });
  }

  control(name: string): FormControl {
    return this.form().get(name) as FormControl;
  }

  paymentTypeControl(): FormControl {
    return this.form().get('paymentType') as FormControl;
  }

  isCreditPayment(): boolean {
    return this.paymentTypeControl().value === PaymentType.CREDIT;
  }

  private onPaymentTypeChange(value: PaymentType): void {
    const creditDays = this.form().get('creditDays');
    const creditLimit = this.form().get('creditLimit');

    if (value === PaymentType.CASH) {
      creditDays?.setValue(null);
      creditLimit?.setValue(null);
      creditDays?.disable();
      creditLimit?.disable();
    } else {
      creditDays?.enable();
      creditLimit?.enable();
    }
  }
}
