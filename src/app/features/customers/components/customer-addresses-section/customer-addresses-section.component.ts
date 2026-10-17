import {
  Component,
  input,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  effect,
} from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { ListSectionComponent } from '@core/forms/components';
import { CustomerValidators } from '@features/customers/validators/customer.validators';
import {
  VENEZUELA_STATE_NAMES,
  getMunicipalitiesForState,
} from '@features/customers/data/venezuela-geo.data';

@Component({
  selector: 'app-customer-addresses-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ListSectionComponent,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    SelectModule,
  ],
  templateUrl: './customer-addresses-section.component.html',
})
export class CustomerAddressesSectionComponent {
  form = input.required<FormGroup>();

  readonly stateOptions = VENEZUELA_STATE_NAMES;

  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    effect(() => {
      const form = this.form();
      const addressesArray = form.get('addresses') as FormArray;
      addressesArray.valueChanges.subscribe(() => this.cdr.markForCheck());
    });
  }

  get addressesArray(): FormArray {
    return this.form().get('addresses') as FormArray;
  }

  addressGroup(index: number): FormGroup {
    return this.addressesArray.at(index) as FormGroup;
  }

  municipalityOptions(index: number): string[] {
    const state = this.addressGroup(index).get('state')?.value;
    return state ? getMunicipalitiesForState(state) : [];
  }

  onStateChange(index: number): void {
    this.addressGroup(index).get('municipality')?.setValue('');
  }

  addAddress(): void {
    this.addressesArray.push(
      this.fb.group({
        address: ['', [Validators.required, CustomerValidators.address()]],
        state: [''],
        municipality: [''],
        postalCode: [''],
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
