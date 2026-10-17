import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { DetailActionsMenuComponent } from '@shared/components/details/detail-actions-menu/detail-actions-menu.component';
import { DetailsCardComponent } from '@shared/components/details/details-card/details-card.component';
import { DetailsCardHeaderComponent } from '@shared/components/details/details-card-header/details-card-header.component';
import { DetailsInfoFieldComponent } from '@shared/components/details/details-info-field/details-info-field.component';
import { DetailsInfoGridComponent } from '@shared/components/details/details-info-grid/details-info-grid.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '@shared/components/ui/status-badge/status-badge.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { ProductApplicationService } from '@features/catalog/products/services/application/product-application.service';
import { ProductPhotoService } from '@features/catalog/products/services/api/product-photo.service';
import { ProductDetails } from '@features/catalog/products/models/interfaces/product-details.interface';
import { ProductStockByWarehouse } from '@features/catalog/products/models/interfaces/product-stock-by-warehouse.interface';

@Component({
  selector: 'app-products-details-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ButtonModule,
    DetailActionsMenuComponent,
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
  stockByWarehouse = signal<ProductStockByWarehouse[]>([]);
  totalStock = computed(() => this.stockByWarehouse().reduce((sum, s) => sum + s.quantity, 0));
  loading = signal(false);
  photoUrl = this.photoService.photoUrl;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadProduct(id);
  }

  private loadProduct(id: string): void {
    this.loading.set(true);
    forkJoin({
      product: this.service.loadById(id),
      stock: this.service.getStock(id).pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ product, stock }) => {
        this.product.set(product);
        this.stockByWarehouse.set(stock);
        this.photoService.loadPhoto(product.photo);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el producto.',
          life: 5000,
        });
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
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Producto ${updated.active ? 'activado' : 'desactivado'} exitosamente`,
          life: 3000,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cambiar el estado.',
          life: 5000,
        });
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/products']);
  }
}
