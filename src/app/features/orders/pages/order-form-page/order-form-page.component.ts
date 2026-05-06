import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { FormContainerComponent } from '@core/forms/components/cards/form-container/form-container.component';
import { FormHeaderComponent } from '@core/forms/components/headers/form-header/form-header.component';
import { FormCardComponent } from '@core/forms/components/cards/form-card/form-card.component';
import { FormActionsComponent } from '@core/forms/components/headers/form-actions/form-actions.component';
import { OrderApplicationService } from '@features/orders/services/application/order-application.service';
import { OrderItemsTableComponent } from '@features/orders/components/order-items-table/order-items-table.component';
import { OrderItemFormData } from '@features/orders/models/interfaces';
import { CustomerApiService } from '@features/customers/services/api/customer-api.service';
import { CustomerList } from '@features/customers/models/interfaces';
import { ProductApiService } from '@features/products/services/api/product-api.service';
import { ProductList } from '@features/products/models/interfaces';

@Component({
  selector: 'app-order-form-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    TextareaModule,
    SelectModule,
    MainLayoutComponent,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
    OrderItemsTableComponent,
  ],
  templateUrl: './order-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderFormPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderApplicationService);
  private readonly customerApi = inject(CustomerApiService);
  private readonly productApi = inject(ProductApiService);
  private readonly messageService = inject(MessageService);

  readonly isEditMode = signal<boolean>(false);
  readonly orderId = signal<string | null>(null);
  readonly isSubmitting = signal<boolean>(false);
  readonly customers = signal<CustomerList[]>([]);
  readonly products = signal<ProductList[]>([]);

  readonly items = signal<OrderItemFormData[]>([{ productId: '', quantity: 1, unitPrice: 0 }]);

  readonly total = computed(() =>
    this.items().reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
  );

  readonly form = this.fb.group({
    customerId: ['', [Validators.required]],
    notes: [''],
  });

  ngOnInit(): void {
    this.loadCustomers();
    this.loadProducts();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.orderId.set(id);
      this.loadOrder(id);
    }
  }

  private loadCustomers(): void {
    this.customerApi.getAll({ active: true, size: 200 }).subscribe({
      next: (page) => this.customers.set(page.content),
    });
  }

  private loadProducts(): void {
    this.productApi.getAllSimple().subscribe({
      next: (products) => this.products.set(products),
    });
  }

  private loadOrder(id: string): void {
    this.orderService.loadById(id).subscribe({
      next: (order) => {
        this.form.patchValue({
          customerId: order.customerId,
          notes: order.notes ?? '',
        });
        this.items.set(
          order.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        );
      },
    });
  }

  onItemsChange(updated: OrderItemFormData[]): void {
    this.items.set(updated);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.items().length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Debes agregar al menos un producto al pedido.', life: 4000 });
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.form.value;

    if (this.isEditMode() && this.orderId()) {
      this.orderService
        .update(this.orderId()!, {
          notes: formValue.notes ?? null,
          items: this.items().map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        })
        .subscribe({
          next: (order) => {
            this.isSubmitting.set(false);
            this.router.navigate(['/pedidos', order.id]);
          },
          error: () => {
            this.isSubmitting.set(false);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el pedido. Por favor, intente nuevamente.', life: 5000 });
          },
        });
    } else {
      this.orderService
        .create({
          customerId: formValue.customerId ?? '',
          notes: formValue.notes ?? null,
          items: this.items().map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        })
        .subscribe({
          next: (order) => {
            this.isSubmitting.set(false);
            this.router.navigate(['/pedidos', order.id]);
          },
          error: () => {
            this.isSubmitting.set(false);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear el pedido. Por favor, intente nuevamente.', life: 5000 });
          },
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/pedidos']);
  }
}
