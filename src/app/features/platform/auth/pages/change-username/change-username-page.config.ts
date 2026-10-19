import { FormBuilder, Validators } from '@angular/forms';
import { UserValidators } from '../../user/validators/user.validators';
const fb = new FormBuilder();
export function createUserNameForm() {
  const name = [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)];
  return fb.group({
    firstName: ['', name],
    lastName: ['', name],
    userName: ['', [...name, Validators.minLength(3)]],
    email: [{ value: '', disabled: true }],
    phone: ['', UserValidators.phoneNumber()],
    street: ['', Validators.maxLength(200)],
    city: ['', Validators.maxLength(100)],
    region: ['', Validators.maxLength(100)],
    country: ['', Validators.maxLength(100)],
    postalCode: ['', Validators.maxLength(20)],
  });
}
