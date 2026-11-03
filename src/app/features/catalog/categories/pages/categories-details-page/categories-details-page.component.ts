import { LocalizedDatePipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { NavigationHistoryService } from '@core/navigation/navigation-history.service';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { DetailActionsMenuComponent } from '@shared/components/details/detail-actions-menu/detail-actions-menu.component';

import { DetailsCardHeaderComponent } from '@shared/components/details/details-card-header/details-card-header.component';
import { DetailsInfoFieldComponent } from '@shared/components/details/details-info-field/details-info-field.component';
import { DetailsInfoGridComponent } from '@shared/components/details/details-info-grid/details-info-grid.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '@shared/components/ui/status-badge/status-badge.component';
import { CategoryApplicationService } from '@features/catalog/categories/services/application/category-application.service';
import { CategoryDetails } from '@features/catalog/categories/models/interfaces/category-details.interface';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { BackButtonComponent } from '@shared/components/ui/back-button/back-button.component';
@Component({
  selector: 'app-categories-details-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BackButtonComponent,
    PanelCardComponent,
    TranslatePipe,
    LocalizedDatePipe,
    PermissionDirective,
    CommonModule,
    ButtonModule,
    DetailActionsMenuComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './categories-details-page.component.html',
})
export class CategoriesDetailsPageComponent implements OnInit {
  private readonly navigationHistory = inject(NavigationHistoryService);
  private service = inject(CategoryApplicationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private readonly deletion = inject(DeleteDialogService);

  category = signal<CategoryDetails | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCategory(id);
    }
  }

  private loadCategory(id: string): void {
    this.loading.set(true);
    this.service.loadById(id).subscribe({
      next: (category) => {
        this.category.set(category);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar la categoría.',
          life: 5000,
        });
        this.router.navigate(['/catalog/categories']);
      },
    });
  }

  onEdit(): void {
    const id = this.category()?.id;
    if (id) {
      this.router.navigate(['/catalog/categories', id, 'edit']);
    }
  }

  onDelete(): void {
    const item = this.category();
    if (!item) return;
    this.deletion.open('categories', item.id, item.name, () => this.router.navigate(['/catalog/categories']));
  }

  onBack(): void {
    this.navigationHistory.back(['/catalog/categories']);
  }
}
