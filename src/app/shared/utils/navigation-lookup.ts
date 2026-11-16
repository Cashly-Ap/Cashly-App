import { LookupItem, LookupResult } from '@core/layouts/models/lookup-definition.model';

export const lookupOption = (label: string, value: string): { label: string; value: string } => ({
  label,
  value,
});

export function lookupDescription(
  ...parts: (string | number | null | undefined)[]
): string {
  return parts.filter((part) => part !== null && part !== undefined && part !== '').join(' · ');
}

export function lookupStatusKey(status: string | null | undefined): string {
  const keys: Record<string, string> = {
    DRAFT: 'navigation.options.draft',
    CONFIRMED: 'navigation.options.confirmed',
    CANCELLED: 'navigation.options.cancelled',
    INVOICED: 'navigation.options.invoiced',
    CONVERTED_TO_ORDER: 'navigation.options.convertedToOrder',
    CONVERTED_TO_INVOICE: 'navigation.options.convertedToInvoice',
    PENDING_PAYMENT: 'navigation.options.pendingPayment',
    PARTIALLY_PAID: 'navigation.options.partiallyPaid',
    PAID: 'navigation.options.paid',
    FULLY_RETURNED: 'navigation.options.fullyReturned',
  };
  return keys[status ?? ''] ?? status ?? '';
}

export function pageLookupResult<T>(
  response: { content: T[]; totalElements: number },
  toItem: (item: T) => LookupItem,
): LookupResult {
  return { items: response.content.map(toItem), total: response.totalElements };
}

export function arrayLookupResult<T>(
  records: readonly T[],
  toItem: (record: T) => LookupItem,
  search: string,
  page: number,
  size: number,
): LookupResult {
  const term = search.trim().toLocaleLowerCase();
  const items = records
    .map(toItem)
    .filter((item) => `${item.label} ${item.description}`.toLocaleLowerCase().includes(term));
  return { items: items.slice(page * size, (page + 1) * size), total: items.length };
}

export function booleanLookupFilter(value: string | undefined): boolean | undefined {
  if (value === undefined || value === '') return undefined;
  return value === 'true';
}

export function textLookupFilter(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}
