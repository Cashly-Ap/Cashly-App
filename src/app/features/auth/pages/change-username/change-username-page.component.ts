import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { FormContainerComponent, FormCardComponent } from '@core/forms/components/cards';
import { FormHeaderComponent, FormActionsComponent } from '@core/forms/components/headers';
import { TextInputComponent } from '@core/forms/components/inputs';
import { AuthService } from '@features/auth/services/application';
import { AUTH_SUCCESS_MESSAGES, AUTH_ERROR_MESSAGES } from '@features/auth/messages';
import { createUserNameForm } from '@features/auth/pages/change-username/change-username-page.config';

@Component({
  selector: 'app-change-username-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MainLayoutComponent,
    FormContainerComponent,
    FormCardComponent,
    FormHeaderComponent,
    FormActionsComponent,
    TextInputComponent,
  ],
  templateUrl: './change-username-page.component.html',
})
export class ChangeUsernamePageComponent implements OnInit {
  private router = inject(Router);
  protected authService = inject(AuthService);
  private messageService = inject(MessageService);

  form: FormGroup = createUserNameForm();

  protected control(field: string): AbstractControl | null {
    return this.form.get(field);
  }

  protected asFormControl(control: AbstractControl | null): FormControl {
    return control as FormControl;
  }

  ngOnInit(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.form.patchValue({ userName: currentUser.userName });
    }
  }

  onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const username = this.form.value.userName!;

    this.authService.changeUsername({ username }).subscribe({
      next: () => {
        this.messageService.add(AUTH_SUCCESS_MESSAGES.usernameChanged);
        this.router.navigate(['/auth/configuration']);
      },
      error: () => this.messageService.add(AUTH_ERROR_MESSAGES.changeUsername),
    });
  }

  onCancel(): void {
    this.router.navigate(['/auth/configuration']);
  }

  getUserNameError(): string {
    const control = this.form.controls['userName'];
    if (control.hasError('required')) {
      return 'El nombre es requerido';
    }
    if (control.hasError('minlength')) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    return '';
  }
}


