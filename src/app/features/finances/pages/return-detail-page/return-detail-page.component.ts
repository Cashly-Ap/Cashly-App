import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import {
  DetailsCardComponent,
  DetailsCardHeaderComponent,
  DetailsInfoGridComponent,
  DetailsInfoFieldComponent,
} from '@shared/components/details';
import { FinanceApplicationService } from '@features/finances/services/application/finance-application.service';
import { ReturnDetail } from '@features/finances/models/interfaces';
import { ReturnType, getReturnTypeLabel } from '@features/finances/models/enums/return-type.enum';

@Component({
  selector: 'app-return-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MainLayoutComponent,
    ButtonModule,
    TableModule,
    LoadingSpinnerComponent,
    TextBadgeComponent,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    DetailsInfoGridComponent,
    DetailsInfoFieldComponent,
    PageHeaderComponent,
  ],
  templateUrl: './return-detail-page.component.html',
})
export class ReturnDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly financeService = inject(FinanceApplicationService);

  readonly returnData = signal<ReturnDetail | null>(null);
  readonly loading = this.financeService.loading;

  readonly showLoading = computed(() => this.loading() && !this.returnData());

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.financeService.loadReturnById(id).subscribe({
        next: (ret) => this.returnData.set(ret),
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/returns']);
  }

  getReturnTypeLabel(type: string): string {
    return getReturnTypeLabel(type as ReturnType);
  }

  getReturnTypeVariant(type: string): 'info' | 'label' {
    return type === ReturnType.AUTOMATIC ? 'info' : 'label';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    };
    return labels[status] ?? status;
  }

  getStatusVariant(status: string): 'success' | 'danger' | 'info' | 'label' {
    const variants: Record<string, 'success' | 'danger' | 'info' | 'label'> = {
      PENDING: 'info',
      COMPLETED: 'success',
      CANCELLED: 'danger',
    };
    return variants[status] ?? 'label';
  }

}
