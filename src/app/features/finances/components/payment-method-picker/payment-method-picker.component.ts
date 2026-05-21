import { Component, inject, signal, output, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FinanceApplicationService } from '@features/finances/services/application';
import { PaymentMethodList } from '@features/finances/models/interfaces';

@Component({
  selector: 'app-payment-method-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './payment-method-picker.component.html',
})
export class PaymentMethodPickerComponent implements OnInit {
  private service = inject(FinanceApplicationService);

  visible = signal(false);
  selectedPaymentMethod = signal<PaymentMethodList | null>(null);
  searchTerm = signal('');

  paymentMethods = this.service.paymentMethods;
  loading = this.service.loading;

  selected = output<PaymentMethodList>();

  ngOnInit(): void {
    this.service.loadPaymentMethods({ active: true }).subscribe();
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
