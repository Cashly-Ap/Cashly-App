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
import { StatusBadgeComponent } from '@shared/components/ui/status-badge/status-badge.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { ProductApplicationService } from '@features/products/services/application';
import { ProductPhotoService } from '@features/products/services/api';
import { ProductDetails } from '@features/products/models/interfaces';

@Component({
  selector: 'app-products-details-page',
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
    StatusBadgeComponent,
    TextBadgeComponent,
  ],
  templateUrl: './products-details-page.component.html',
})
export class ProductsDetailsPageComponent implements OnInit {
  private service = inject(ProductApplicationService);
  private photoService = inject(ProductPhotoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  product = signal<ProductDetails | null>(null);
  loading = signal(false);
  photoUrl = this.photoService.photoUrl;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadProduct(id);
  }

  private loadProduct(id: string): void {
    this.loading.set(true);
    this.service.loadById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.photoService.loadPhoto(product.photo);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el producto.', life: 5000 });
        this.router.navigate(['/products']);
      },
    });
  }

  onEdit(): void {
    const id = this.product()?.id;
    if (id) this.router.navigate(['/products', id, 'edit']);
  }

  onToggleActive(): void {
    const p = this.product();
    if (!p) return;
    this.service.toggleActive(p.id, !p.active).subscribe({
      next: (updated) => {
        this.product.set(updated);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Producto ${updated.active ? 'activado' : 'desactivado'} exitosamente`, life: 3000 });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cambiar el estado.', life: 5000 });
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/products']);
  }
}
