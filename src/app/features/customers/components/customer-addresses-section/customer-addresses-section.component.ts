import { Component, input, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ListSectionComponent } from '@core/forms/components';
import { CustomerValidators } from '@features/customers/validators';

@Component({
  selector: 'app-customer-addresses-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ListSectionComponent, ButtonModule, InputTextModule, CheckboxModule],
  templateUrl: './customer-addresses-section.component.html',
})
export class CustomerAddressesSectionComponent {
  form = input.required<FormGroup>();

  private fb = inject(FormBuilder);

  get addressesArray(): FormArray {
    return this.form().get('addresses') as FormArray;
  }

  addressGroup(index: number): FormGroup {
    return this.addressesArray.at(index) as FormGroup;
  }

  addAddress(): void {
    this.addressesArray.push(
      this.fb.group({
        address: ['', [Validators.required, CustomerValidators.address()]],
        billing: [false],
        active: [true],
      }),
    );
  }

  removeAddress(index: number): void {
    this.addressesArray.removeAt(index);
  }

  onBillingChange(index: number): void {
    const isBilling = this.addressGroup(index).get('billing')?.value;
    if (isBilling) {
      this.addressesArray.controls.forEach((ctrl, i) => {
        if (i !== index) {
          ctrl.get('billing')?.setValue(false, { emitEvent: false });
        }
      });
    }
  }
}
