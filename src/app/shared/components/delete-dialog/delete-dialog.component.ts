import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';

@Component({
  selector: 'app-delete-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule, TranslatePipe],
  templateUrl: './delete-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteDialogComponent {
  readonly deletion = inject(DeleteDialogService);
}
