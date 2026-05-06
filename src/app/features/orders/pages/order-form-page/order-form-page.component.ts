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
import { MessageService } from 'primeng/api';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { FormContainerComponent } from '@core/forms/components/cards/form-container/form-container.component';
import { FormHeaderComponent } from '@core/forms/components/headers/form-header/form-header.component';
import { FormCardComponent } from '@core/forms/components/cards/form-card/form-card.component';
import { FormActionsComponent } from '@core/forms/components/headers/form-actions/form-actions.component';
import { OrderApplicationService } from '@features/orders/services/application/order-application.service';
import { OrderItemsTableComponent } from '@features/orders/components/order-items-table/order-items-table.component';
import { OrderItemFormData } from '@features/orders/models/interfaces';
import { CustomerList } from '@features/customers/models/interfaces';
import { ProductApiService } from '@features/products/services/api/product-api.service';
import { ProductList } from '@features/products/models/interfaces';
import { CustomerPickerDialogComponent } from '@features/orders/components/customer-picker-dialog/customer-picker-dialog.component';

@Component({
  selector: 'app-order-form-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    TextareaModule,
    MainLayoutComponent,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
    OrderItemsTableComponent,
    CustomerPickerDialogComponent,
  ],
  templateUrl: './order-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderFormPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderApplicationService);
  private readonly productApi = inject(ProductApiService);
  private readonly messageService = inject(MessageService);

  readonly isEditMode = signal<boolean>(false);
  readonly orderId = signal<string | null>(null);
  readonly isSubmitting = signal<boolean>(false);
  readonly products = signal<ProductList[]>([]);
  readonly selectedCustomer = signal<CustomerList | null>(null);
  readonly selectedCustomerLabel = signal<{ alias: string; legalName: string } | null>(null);
  readonly pickerVisible = signal<boolean>(false);

  readonly submitTooltip = signal('');

  private readonly FIELD_LABELS: Record<string, string> = {
    customerId: 'Cliente',
  };

  readonly items = signal<OrderItemFormData[]>([{ productId: '', quantity: 1, unitPrice: 0 }]);

  readonly total = computed(() =>
    this.items().reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
  );

  readonly form = this.fb.group({
    customerId: ['', [Validators.required]],
    notes: [''],
  });

  ngOnInit(): void {
    this.loadProducts();
    this.form.statusChanges.subscribe(() => this.updateSubmitTooltip());
    this.updateSubmitTooltip();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.orderId.set(id);
      this.loadOrder(id);
    }
  }

  private loadProducts(): void {
    this.productApi.getAllSimple().subscribe({
      next: (products) => this.products.set(products),
    });
  }

  private updateSubmitTooltip(): void {
    const invalid = Object.entries(this.FIELD_LABELS)
      .filter(([key]) => this.form.get(key)?.invalid)
      .map(([, label]) => label);
    this.submitTooltip.set(invalid.length ? `Campos requeridos: ${invalid.join(', ')}` : '');
  }

  private loadOrder(id: string): void {
    this.orderService.loadById(id).subscribe({
      next: (order) => {
        this.form.patchValue({ notes: order.notes ?? '' });
        this.selectedCustomerLabel.set({
          alias: order.customerAlias,
          legalName: order.customerLegalName,
        });
        this.form.patchValue({ customerId: order.customerId });
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

  openPicker(): void {
    this.pickerVisible.set(true);
  }

  onCustomerSelected(customer: CustomerList): void {
    this.selectedCustomer.set(customer);
    this.selectedCustomerLabel.set({ alias: customer.alias, legalName: customer.legalName });
    this.form.patchValue({ customerId: customer.id });
    this.pickerVisible.set(false);
  }

  onPickerCancelled(): void {
    this.pickerVisible.set(false);
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
