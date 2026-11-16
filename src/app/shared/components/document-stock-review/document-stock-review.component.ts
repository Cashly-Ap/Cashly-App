import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { DocumentStockRow } from '@shared/utils/document-stock';

import { DataTableComponent } from '@shared/components/ui/data-table/data-table.component';

@Component({
  selector: 'app-document-stock-review',
  standalone: true,
  imports: [DataTableComponent, TranslatePipe, LocalizedNumberPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './document-stock-review.component.html',
})
export class DocumentStockReviewComponent {
  readonly rows = input<DocumentStockRow[]>([]);
}
