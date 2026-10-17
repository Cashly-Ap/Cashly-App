import { Component, input, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormArray,
  FormControl,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ListSectionComponent, ListItemComponent } from '@core/forms/components';
import { SupplierValidators } from '@features/partners/suppliers/validators/supplier.validators';

@Component({
  selector: 'app-supplier-contact-section',
  standalone: true,
  imports: [ReactiveFormsModule, ListSectionComponent, ListItemComponent],
  templateUrl: './supplier-contact-section.component.html',
})
export class SupplierContactSectionComponent {
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
    this.emailsArray.push(this.fb.control('', [Validators.required, SupplierValidators.email()]));
  }

  removeEmail(index: number): void {
    this.emailsArray.removeAt(index);
  }

  addPhone(): void {
    this.phonesArray.push(
      this.fb.control('', [Validators.required, SupplierValidators.phoneNumber()]),
    );
  }

  removePhone(index: number): void {
    this.phonesArray.removeAt(index);
  }
}
