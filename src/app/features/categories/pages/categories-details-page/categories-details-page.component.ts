import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import {
  DetailsCardComponent,
  DetailsCardHeaderComponent,
  DetailsInfoFieldComponent,
  DetailsInfoGridComponent,
} from '@shared/components/details';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { CategoryApplicationService } from '@features/categories/services/application';
import { CategoryDetails } from '@features/categories/models/interfaces';

@Component({
  selector: 'app-categories-details-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MainLayoutComponent,
    ButtonModule,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
  ],
  templateUrl: './categories-details-page.component.html',
  providers: [MessageService],
})
export class CategoriesDetailsPageComponent implements OnInit {
  private service = inject(CategoryApplicationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

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
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar la categoría.', life: 5000 });
        this.router.navigate(['/categories']);
      },
    });
  }

  onEdit(): void {
    const id = this.category()?.id;
    if (id) {
      this.router.navigate(['/categories', id, 'edit']);
    }
  }

  onToggleActive(): void {
    const cat = this.category();
    if (!cat) return;
    this.service.toggleActive(cat.id, !cat.active).subscribe({
      next: (updated) => {
        this.category.set(updated);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Categoría ${updated.active ? 'activada' : 'desactivada'} exitosamente`, life: 3000 });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cambiar el estado.', life: 5000 });
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/categories']);
  }
}
