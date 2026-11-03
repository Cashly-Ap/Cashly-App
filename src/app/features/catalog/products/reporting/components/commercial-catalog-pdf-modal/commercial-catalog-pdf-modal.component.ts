import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CategoryApplicationService } from '@features/catalog/categories/services/application/category-application.service';
import { PriceTypeApplicationService } from '@features/catalog/price-types/services/application/price-type-application.service';
import { CommercialCatalogPdfFilters } from '@features/catalog/products/reporting/models/interfaces/commercial-catalog-pdf-filters.interface';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';

import { ReportPdfModalComponent } from '@shared/components/ui/report-pdf-modal/report-pdf-modal.component';
@Component({
  selector: 'app-commercial-catalog-pdf-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReportPdfModalComponent,
    TranslateOptionsPipe,
    TranslatePipe,
    PermissionDirective,
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ProgressSpinnerModule,
    SearchFieldComponent,
  ],
  templateUrl: './commercial-catalog-pdf-modal.component.html',
})
export class CommercialCatalogPdfModalComponent {
  private readonly categoryService = inject(CategoryApplicationService);
  private readonly priceTypeService = inject(PriceTypeApplicationService);

  readonly visible = input(false);
  readonly visibleChange = output<boolean>();
  readonly onGeneratePdf = output<CommercialCatalogPdfFilters>();

  readonly search = signal('');
  readonly categoryId = signal<string | null>(null);
  readonly priceTypeId = signal<string | null>(null);
  readonly active = signal<boolean>(true);
  readonly loading = signal(false);

  readonly activeOptions = [
    { value: true, label: 'Solo activos' },
    { value: false, label: 'Solo inactivos' },
    { value: null, label: 'Todos' },
  ];

  readonly categoryOptions = computed(() => [
    { value: null, label: 'Todas las categorías' },
    ...this.categoryService.categories().map((c) => ({ value: c.id, label: c.name })),
  ]);

  readonly priceTypeOptions = computed(() => [
    { value: null, label: 'Sin precio' },
    ...this.priceTypeService.priceTypes().map((pt) => ({ value: pt.id, label: pt.name })),
  ]);

  loadFilters(): void {
    const needsCategories = this.categoryService.categories().length === 0;
    const needsPriceTypes = this.priceTypeService.priceTypes().length === 0;
    if (!needsCategories && !needsPriceTypes) return;
    this.loading.set(true);

    let completed = 0;
    const checkDone = () => {
      completed++;
      if (completed >= 2) this.loading.set(false);
    };

    if (needsCategories) {
      this.categoryService.loadAll({ size: 1000 }).subscribe({ next: checkDone, error: checkDone });
    } else {
      completed++;
    }
    if (needsPriceTypes) {
      this.priceTypeService
        .loadAll({ size: 1000 })
        .subscribe({ next: checkDone, error: checkDone });
    } else {
      completed++;
    }
  }

  generatePdf(): void {
    this.onGeneratePdf.emit({
      search: this.search() || undefined,
      categoryId: this.categoryId() ?? undefined,
      priceTypeId: this.priceTypeId() ?? undefined,
      active: this.active(),
    });
  }
}
