import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [PaginatorModule],
  templateUrl: './paginator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class PaginatorComponent {
  readonly first = input(0);
  readonly rows = input(10);
  readonly totalRecords = input(0);
  readonly rowsPerPageOptions = input<number[]>([10, 25, 50]);
  readonly showCurrentPageReport = input(true);
  readonly currentPageReportTemplate = input('');
  readonly styleClass = input('');
  readonly dropdownAppendTo = input<string | 'body'>('body');
  readonly showPageLinks = input(true);
  readonly showFirstLastIcon = input(true);

  readonly pageChange = output<PaginatorState>();
}
