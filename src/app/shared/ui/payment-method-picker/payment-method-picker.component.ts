import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Component, inject, signal, output, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { PaymentMethodApiService } from '@features/finance/treasury/payment-methods/services/api/payment-method-api.service';
import { PaymentMethodList } from '@features/finance/treasury/payment-methods/models/interfaces/payment-method.interface';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';

@Component({
  selector: 'app-payment-method-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe,
    CommonModule,
    FormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    IconFieldModule,
    InputIconModule,
    SearchFieldComponent,
  ],
  templateUrl: './payment-method-picker.component.html',
})
export class PaymentMethodPickerComponent implements OnInit {
  private readonly paymentMethodApi = inject(PaymentMethodApiService);

  visible = signal(false);
  selectedPaymentMethod = signal<PaymentMethodList | null>(null);
  searchTerm = signal('');

  readonly paymentMethods = signal<PaymentMethodList[]>([]);
  readonly loading = signal(false);

  selected = output<PaymentMethodList>();

  ngOnInit(): void {
    this.loading.set(true);
    this.paymentMethodApi.getAll({ active: true }).subscribe({
      next: (items) => {
        this.paymentMethods.set(items.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  open(): void {
    this.visible.set(true);
    this.searchTerm.set('');
  }

  close(): void {
    this.visible.set(false);
  }

  onSelect(paymentMethod: PaymentMethodList): void {
    this.selectedPaymentMethod.set(paymentMethod);
    this.selected.emit(paymentMethod);
    this.close();
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
  }

  filteredPaymentMethods(): PaymentMethodList[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.paymentMethods();
    return this.paymentMethods().filter(
      (pm) => pm.name.toLowerCase().includes(term) || pm.code.toLowerCase().includes(term),
    );
  }
}
