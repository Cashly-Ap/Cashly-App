import { Component, inject, input, output, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { UserApplicationService } from '@features/users/services/application';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-change-email-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './change-email-dialog.component.html',
})
export class ChangeEmailDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(UserApplicationService);
  private messageService = inject(MessageService);

  userId = input.required<string>();
  visible = input.required<boolean>();
  visibleChange = output<boolean>();
  changed = output<string>();

  loading = this.service.loading;

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.value.email;

    this.service.changeEmail(this.userId(), email).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Correo electrónico actualizado exitosamente',
          life: 3000,
        });
        this.form.reset();
        this.visibleChange.emit(false);
        this.changed.emit(email);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al actualizar el correo electrónico. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onCancel(): void {
    this.form.reset();
    this.visibleChange.emit(false);
  }

  getEmailError(): string {
    const errors = this.form.get('email')?.errors;
    if (errors?.['required']) return 'El correo electrónico es requerido';
    if (errors?.['email']) return 'El formato del correo electrónico es inválido';
    return '';
  }
}
