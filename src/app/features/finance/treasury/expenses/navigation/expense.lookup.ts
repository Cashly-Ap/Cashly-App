import { map } from 'rxjs';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { TranslationService } from '@core/i18n/translation.service';
import { ExpenseApiService } from '@features/finance/treasury/expenses/services/api/expense-api.service';
import { PaymentMethodApiService } from '@features/finance/treasury/payment-methods/services/api/payment-method-api.service';
import {
  lookupDescription,
  lookupOption,
  pageLookupResult,
  textLookupFilter,
} from '@shared/utils/navigation-lookup';

export const EXPENSE_LOOKUP: LookupDefinition = {
  route: '/finance/treasury/expenses',
  load: (injector, query) => {
    const range = periodRange(query.filters['period']);
    return injector
      .get(ExpenseApiService)
      .list({
        page: query.page,
        size: query.size,
        search: query.search || undefined,
        paymentMethodId: textLookupFilter(query.filters['paymentMethodId']),
        registerId: textLookupFilter(query.filters['registerId']),
        ...range,
        orderBy: 'occurredAt',
        orderDir: 'desc',
      })
      .pipe(
        map((response) =>
          pageLookupResult(response, (item) => ({
            id: item.id,
            label: item.description,
            description: lookupDescription(item.paymentMethodName, `${item.amount}$`),
          })),
        ),
      );
  },
  filters: (sources) => [
    {
      key: 'period',
      label: 'navigation.filters.period',
      options: [
        lookupOption('navigation.options.allTime', 'all'),
        lookupOption('navigation.options.today', 'today'),
        lookupOption('navigation.options.last7Days', 'last7'),
        lookupOption('navigation.options.thisMonth', 'month'),
      ],
      defaultValue: 'all',
    },
    {
      key: 'paymentMethodId',
      label: 'navigation.filters.paymentMethod',
      options: [lookupOption('navigation.options.allPaymentMethods', ''), ...sources.categories],
      defaultValue: '',
    },
    {
      key: 'registerId',
      label: 'navigation.filters.register',
      options: [lookupOption('navigation.options.allRegisters', ''), ...sources.registers],
      defaultValue: '',
    },
  ],
  loadFilterSources: (injector, sources) => {
    injector
      .get(PaymentMethodApiService)
      .getAll({ active: true, page: 0, size: 100 })
      .subscribe({
        next: (response) => {
          sources.categories = response.content.map((method) => ({
            label: method.name,
            value: method.id,
          }));
        },
        error: () => undefined,
      });
    injector
      .get(ExpenseApiService)
      .listRegisters()
      .subscribe({
        next: (registers) => {
          const translation = injector.get(TranslationService, null);
          sources.registers = registers.map((register) => ({
            label: `${formatDateTime(register.openedAt)} · ${
              translation?.t(
                register.status === 'OPEN'
                  ? 'finance.treasury.expenses.openRegister'
                  : 'finance.treasury.expenses.closedRegister',
              ) ?? register.status
            }`,
            value: register.id,
          }));
        },
        error: () => undefined,
      });
  },
  recordRoutes: {
    detail: (id: string) => ['/finance/treasury/expenses', id],
    edit: (id: string) => ['/finance/treasury/expenses', id],
  },
};

function formatDateTime(value: string): string {
  const date = new Date(value);
  const pad = (part: number): string => String(part).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function periodRange(period: string | undefined): { dateFrom?: string; dateTo?: string } {
  if (!period || period === 'all') return {};
  const today = new Date();
  const toIso = (value: Date): string =>
    `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  if (period === 'today') return { dateFrom: toIso(today), dateTo: toIso(today) };
  if (period === 'last7') {
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    return { dateFrom: toIso(from), dateTo: toIso(today) };
  }
  if (period === 'month') {
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    return { dateFrom: toIso(from), dateTo: toIso(today) };
  }
  return {};
}
