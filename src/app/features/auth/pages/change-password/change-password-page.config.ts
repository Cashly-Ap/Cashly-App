import { FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { AuthValidators } from '@features/auth/validators/auth-validators';

const fb = new FormBuilder();

function passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    return { passwordMismatch: true };
  }

  return null;
}

export function createPasswordForm() {
  return fb.group(
    {
      newPassword: ['', AuthValidators.password],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );
}
