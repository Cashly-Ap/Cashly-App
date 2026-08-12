import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';

const fb = new FormBuilder();

function notNullNumber(control: AbstractControl): ValidationErrors | null {
  return control.value === null || control.value === undefined ? { required: true } : null;
}

export function createCommissionDeductionForm() {
  return fb.group({
    commissionDeductionPercentage: [0, [notNullNumber, Validators.min(0), Validators.max(100)]],
  });
}
