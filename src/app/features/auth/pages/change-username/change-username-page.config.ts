import { FormBuilder, Validators } from '@angular/forms';

const fb = new FormBuilder();

export function createUserNameForm() {
  return fb.group({
    userName: ['', [Validators.required, Validators.minLength(3)]],
  });
}


