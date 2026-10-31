import { LanguageService } from '@core/i18n/language.service';
import { LocalizedCurrencyPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  model,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CashRegisterApplicationService } from '@features/finance/treasury/cash-register/services/application/cash-register-application.service';

@Component({
  selector: 'app-cash-register-close-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    LocalizedCurrencyPipe,
    PermissionDirective,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    TextareaModule,
  ],
  templateUrl: './cash-register-close-dialog.component.html',
})
export class CashRegisterCloseDialogComponent {
  readonly visible = model(false);
  readonly locale = inject(LanguageService).locale;

  private readonly service = inject(CashRegisterApplicationService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly closure = this.service.activeClosure;
  readonly expectedBalance = computed(() => this.closure()?.expectedBalance ?? 0);
  readonly isSubmitting = signal(false);

  readonly closeForm = this.formBuilder.group({
    closedByName: ['', Validators.required],
    declaredBalance: [0, [Validators.required, Validators.min(0)]],
    closingNotes: [''],
  });

  constructor() {
    effect(() => {
      if (!this.visible()) return;
      this.closeForm.reset({
        closedByName: this.service.currentUserName(),
        declaredBalance: this.expectedBalance(),
        closingNotes: '',
      });
    });
  }

  submit(): void {
    if (this.closeForm.invalid) return;

    const id = this.closure()?.id;
    if (!id) return;

    this.isSubmitting.set(true);
    this.service
      .closeRegister(id, {
        closedByName: this.closeForm.get('closedByName')?.value ?? '',
        declaredBalance: this.closeForm.get('declaredBalance')?.value ?? 0,
        closingNotes: this.closeForm.get('closingNotes')?.value ?? '',
      })
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          if (!result) return;
          this.visible.set(false);
          this.closeForm.reset();
        },
      });
  }
}
