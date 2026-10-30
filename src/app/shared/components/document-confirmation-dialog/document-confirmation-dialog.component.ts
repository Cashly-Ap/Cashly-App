import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import { DocumentConfirmationModel } from '@shared/models/document-confirmation';

@Component({
  selector: 'app-document-confirmation-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule, TranslatePipe, LocalizedNumberPipe, PermissionDirective],
  templateUrl: './document-confirmation-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentConfirmationDialogComponent {
  readonly visible = input(false);
  readonly model = input.required<DocumentConfirmationModel>();
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly submitting = input(false);
  readonly canAccept = input(true);
  readonly accepted = output<void>();
  readonly cancelled = output<void>();

  noticeClasses(): string {
    const severity = this.model().notice?.severity;
    const classes = {
      info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200',
      warning:
        'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
      danger:
        'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
      success:
        'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200',
    };
    return severity ? classes[severity] : classes.info;
  }

  noticeIcon(): string {
    const icons = {
      info: 'pi-info-circle',
      warning: 'pi-exclamation-triangle',
      danger: 'pi-times-circle',
      success: 'pi-check-circle',
    };
    return icons[this.model().notice?.severity ?? 'info'];
  }
}
