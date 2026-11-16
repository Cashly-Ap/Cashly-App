import { TranslationService } from '@core/i18n/translation.service';

const FIELD_LABEL_KEYS: Readonly<Record<string, string>> = {
  name: 'shared.fields.name',
  legalName: 'shared.fields.legalName',
  customerName: 'shared.fields.customer',
  customerId: 'shared.fields.customer',
  supplierId: 'shared.fields.supplier',
  invoiceId: 'shared.fields.invoice',
  categoryId: 'shared.fields.category',
  amount: 'shared.fields.amount',
  reason: 'shared.fields.reason',
  type: 'shared.fields.type',
  rif: 'shared.fields.rif',
  paymentType: 'shared.fields.paymentType',
  creditDays: 'shared.fields.creditDays',
  creditLimit: 'shared.fields.creditLimit',
  priceTypeId: 'shared.fields.priceType',
  emails: 'shared.fields.emails',
  phones: 'shared.fields.phones',
  addresses: 'shared.fields.addresses',
  warehouses: 'shared.fields.warehouses',
  warehouseId: 'shared.fields.warehouse',
  state: 'shared.fields.state',
  municipality: 'shared.fields.municipality',
  returnType: 'shared.fields.returnType',
  userName: 'shared.fields.userName',
  email: 'shared.fields.email',
  password: 'shared.fields.password',
  currentPassword: 'shared.fields.password',
  newPassword: 'shared.fields.password',
  confirmPassword: 'shared.fields.password',
  firstName: 'shared.fields.firstName',
  lastName: 'shared.fields.lastName',
  roleId: 'shared.fields.role',
  departmentId: 'shared.fields.department',
  language: 'shared.fields.language',
};

export function fieldLabelKey(name: string): string | null {
  return FIELD_LABEL_KEYS[name] ?? null;
}

export function requiredFieldsMessage(
  translations: TranslationService,
  fieldKeys: readonly string[],
): string {
  if (fieldKeys.length === 0) return '';
  const fields = fieldKeys.map((key) => translations.t(key)).join(', ');
  return translations.t('shared.requiredFields', { fields });
}
