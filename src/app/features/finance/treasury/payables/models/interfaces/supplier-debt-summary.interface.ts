import { SupplierPurchaseDebt } from '@features/finance/treasury/payables/models/interfaces/supplier-purchase-debt.interface';

export interface SupplierDebtSummary {
  supplierId: string;
  supplierName: string;
  supplierRif: string;
  supplierPhone: string | null;
  supplierEmail: string | null;
  totalDebt: number;
  pendingPaymentsAmount: number;
  availableDebt: number;
  creditDays: number;
  creditLimit: number;
  availableCredit: number;
  supplierBalance: number;
  purchasesWithDebt: SupplierPurchaseDebt[];
  pendingPaymentsCount: number;
}
