import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import { DocumentConfirmationModel } from '@shared/models/document-confirmation';
import { UserPreferencesService } from '@core/preferences/user-preferences.service';

import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';
@Component({
  selector: 'app-document-confirmation-dialog',
  standalone: true,
  imports: [
    CancelButtonComponent,
    DialogModule,
    ButtonModule,
    TranslatePipe,
    LocalizedNumberPipe,
    PermissionDirective,
  ],
  templateUrl: './document-confirmation-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentConfirmationDialogComponent {
  private readonly preferences = inject(UserPreferencesService);
  readonly visible = input(false);
  readonly model = input.required<DocumentConfirmationModel>();
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly submitting = input(false);
  readonly canAccept = input(true);
  readonly acceptSeverity = computed(() =>
    this.preferences.colorMode() === 'minimal'
      ? 'contrast'
      : (this.model().acceptSeverity ?? 'contrast'),
  );
  readonly accepted = output<void>();
  readonly cancelled = output<void>();

  noticeClasses(): string {
    const neutral =
      'border-surface-200 bg-surface-50 text-surface-800 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100';
    const severity = this.model().notice?.severity ?? 'info';
    const classes = {
      info: 'in-[.cashly-informative]:border-blue-200 in-[.cashly-informative]:bg-blue-50 in-[.cashly-informative]:text-blue-800 dark:in-[.cashly-informative]:border-blue-800 dark:in-[.cashly-informative]:bg-blue-950 dark:in-[.cashly-informative]:text-blue-200',
      warning:
        'in-[.cashly-informative]:border-blue-200 in-[.cashly-informative]:bg-blue-50 in-[.cashly-informative]:text-blue-800 dark:in-[.cashly-informative]:border-blue-800 dark:in-[.cashly-informative]:bg-blue-950 dark:in-[.cashly-informative]:text-blue-200',
      danger: '',
      success:
        'in-[.cashly-informative]:border-green-200 in-[.cashly-informative]:bg-green-50 in-[.cashly-informative]:text-green-800 dark:in-[.cashly-informative]:border-green-800 dark:in-[.cashly-informative]:bg-green-950 dark:in-[.cashly-informative]:text-green-200',
    };
    return `${neutral} ${classes[severity]}`;
  }

  noticeIcon(): string {
    const icons = {
      info: 'pi-info-circle',
      warning: 'pi-exclamation-triangle',
      danger: 'pi-exclamation-triangle',
      success: 'pi-check-circle',
    };
    return icons[this.model().notice?.severity ?? 'info'];
  }
}
