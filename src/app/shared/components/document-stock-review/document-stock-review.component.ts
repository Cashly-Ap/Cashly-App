import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { DocumentStockRow } from '@shared/utils/document-stock';

@Component({
  selector: 'app-document-stock-review',
  standalone: true,
  imports: [TranslatePipe, LocalizedNumberPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './document-stock-review.component.html',
})
export class DocumentStockReviewComponent {
  readonly rows = input<DocumentStockRow[]>([]);
}
