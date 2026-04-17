import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import {
  DetailsCardComponent,
  DetailsCardHeaderComponent,
  DetailsInfoFieldComponent,
  DetailsInfoGridComponent,
} from '@shared/components/details';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { MessageService } from 'primeng/api';
import { CustomerApplicationService } from '@features/customers/services/application';
import { CustomerDetails } from '@features/customers/models/interfaces';
import { getCustomerTypeLabel } from '@features/customers/models/enums';

@Component({
  selector: 'app-customers-details-page',
  standalone: true,
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
  templateUrl: './customers-details-page.component.html',
  providers: [MessageService],
})
export class CustomersDetailsPageComponent implements OnInit {
  private service = inject(CustomerApplicationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  customer = signal<CustomerDetails | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCustomer(id);
    }
  }

  private loadCustomer(id: string): void {
    this.loading.set(true);
    this.service.loadById(id).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el cliente. Es posible que no exista.',
          life: 5000,
        });
        this.router.navigate(['/customers']);
      },
    });
  }

  onEdit(): void {
    const id = this.customer()?.id;
    if (id) {
      this.router.navigate(['/customers', id, 'edit']);
    }
  }

  onBack(): void {
    this.router.navigate(['/customers']);
  }

  getTypeLabel(type: string): string {
    return getCustomerTypeLabel(type as Parameters<typeof getCustomerTypeLabel>[0]);
  }

  getInitials(): string {
    const name = this.customer()?.legalName || '';
    return name.charAt(0).toUpperCase();
  }
}
