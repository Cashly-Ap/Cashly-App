import { FormBuilder, Validators } from '@angular/forms';

const fb = new FormBuilder();

export function createDisplayNameForm() {
  return fb.group({
    displayName: ['', [Validators.required, Validators.minLength(3)]],
  });
}


