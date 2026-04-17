import { Component, input, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormArray, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ListSectionComponent, ListItemComponent } from '@core/forms/components';
import { CustomerValidators } from '@features/customers/validators';

@Component({
  selector: 'app-customer-contact-section',
  standalone: true,
  imports: [ReactiveFormsModule, ListSectionComponent, ListItemComponent],
  templateUrl: './customer-contact-section.component.html',
})
export class CustomerContactSectionComponent {
  form = input.required<FormGroup>();

  private fb = inject(FormBuilder);

  get emailsArray(): FormArray {
    return this.form().get('emails') as FormArray;
  }

  get phonesArray(): FormArray {
    return this.form().get('phones') as FormArray;
  }

  emailControl(index: number): FormControl {
    return this.emailsArray.at(index) as FormControl;
  }

  phoneControl(index: number): FormControl {
    return this.phonesArray.at(index) as FormControl;
  }

  addEmail(): void {
    this.emailsArray.push(this.fb.control('', [Validators.required, CustomerValidators.email()]));
  }

  removeEmail(index: number): void {
    this.emailsArray.removeAt(index);
  }

  addPhone(): void {
    this.phonesArray.push(this.fb.control('', [Validators.required, CustomerValidators.phoneNumber()]));
  }

  removePhone(index: number): void {
    this.phonesArray.removeAt(index);
  }
}
