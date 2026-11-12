import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { describe, it, beforeEach, expect } from 'vitest';
import { TranslationService } from '@core/i18n/translation.service';
import { LanguageService } from '@core/i18n/language.service';
import { english, spanish } from '@core/i18n/dictionaries';
import { languageInterceptor } from '@core/i18n/language.interceptor';
import {
  TranslatedConfirmationService,
  TranslatedMessageService,
} from '@core/i18n/translated-feedback.service';
import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import {
  LocalizedNumberPipe,
  LocalizedCurrencyPipe,
  LocalizedDatePipe,
} from '@core/i18n/localized-format.pipe';

describe('runtime language', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([languageInterceptor])),
        provideHttpClientTesting(),
        TranslatedConfirmationService,
        TranslatedMessageService,
      ],
    }),
  );

  it('starts in Spanish and translates the same labels after changing language', () => {
    const service = TestBed.inject(TranslationService);
    const language = TestBed.inject(LanguageService);
    expect(language.language()).toBe('es');
    expect(service.t('Clientes')).toBe('Clientes');
    language.setLanguage('en');
    expect(service.t('Clientes')).toBe('Customers');
    expect(service.t('Ver detalle de cliente')).toBe('View details of customer');
    language.setLanguage('es');
    expect(service.t('Clientes')).toBe('Clientes');
  });

  it('translates dynamic pending tab titles in English', () => {
    const service = TestBed.inject(TranslationService);
    const language = TestBed.inject(LanguageService);
    language.setLanguage('en');
    expect(service.t('Editar Factura INV-2025-0016')).toBe('Edit Invoice INV-2025-0016');
    expect(service.t('Editar Compra PUR-2025-0015')).toBe('Edit Purchase PUR-2025-0015');
    expect(service.t('Editar Pedido ORD-2025-0001')).toBe('Edit Order ORD-2025-0001');
    expect(service.t('Editar Presupuesto QUO-2025-0001')).toBe('Edit Quote QUO-2025-0001');
    expect(service.t('Hace 2 min')).toBe('2 min ago');
    expect(service.t('Hace un momento')).toBe('Just now');
  });

  it('keeps every dictionary key in both languages with nonempty translations', () => {
    expect(Object.keys(english).sort()).toEqual(Object.keys(spanish).sort());
    for (const [key, value] of Object.entries(english)) {
      expect(value.trim(), key).not.toBe('');
      expect(spanish[key]?.trim(), key).not.toBe('');
    }
  });

  it('translates parameterized messages without changing user names or document identifiers', () => {
    const service = TestBed.inject(TranslationService);
    TestBed.inject(LanguageService).setLanguage('en');
    expect(service.t('¿Está seguro de que desea eliminar el pedido #ORD.001?')).toBe(
      'Are you sure you want to delete order #ORD.001?',
    );
    expect(service.t('Hola {name}', { name: 'José {VIP}' })).toBe('Hola José {VIP}');
    expect(service.t('¿Está seguro de que desea eliminar el pedido #ORDX001!')).toBe(
      '¿Está seguro de que desea eliminar el pedido #ORDX001!',
    );
  });

  it('adds the active language only at request time without loading preferences in the interceptor', () => {
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);
    const language = TestBed.inject(LanguageService);
    for (const code of ['es', 'en'] as const) {
      language.setLanguage(code);
      http.get('/api/products').subscribe();
      const request = controller.expectOne('/api/products');
      expect(request.request.headers.get('Accept-Language')).toBe(code);
      request.flush([]);
    }
    controller.verify();
  });

  it('translates toast and confirmation copies while preserving callbacks and original inputs', () => {
    TestBed.inject(LanguageService).setLanguage('en');
    const messages = TestBed.inject(TranslatedMessageService);
    const confirmation = TestBed.inject(TranslatedConfirmationService);
    const original = { summary: 'Éxito', detail: 'Pedido creado exitosamente' };
    const received: unknown[] = [];
    messages.messageObserver.subscribe((message) => received.push(message));
    messages.add(original);
    expect(received).toEqual([{ summary: 'Success', detail: 'Order created successfully' }]);
    expect(original.summary).toBe('Éxito');
    let accepted = false;
    confirmation.requireConfirmation$.subscribe((value) => {
      expect(value?.header).toBe('Confirm deletion');
      expect(value?.message).toBe('Are you sure you want to delete order #ORD.001?');
      value?.accept?.();
    });
    confirmation.confirm({
      header: 'Confirmar Eliminación',
      message: '¿Está seguro de que desea eliminar el pedido #ORD.001?',
      accept: () => {
        accepted = true;
      },
    });
    expect(accepted).toBe(true);
  });

  it('translates controlled option labels and preserves user data and values in placeholder mode', () => {
    TestBed.inject(LanguageService).setLanguage('en');
    const pipe = TestBed.runInInjectionContext(() => new TranslateOptionsPipe());
    const original = [
      { label: 'Todos', value: null },
      { label: 'Clientes', value: 'user-id' },
    ];
    expect(pipe.transform(original, true)).toEqual([
      { label: 'All', value: null },
      { label: 'Clientes', value: 'user-id' },
    ]);
    expect(original[0].label).toBe('Todos');
    expect(pipe.transform([{ label: 'Borrador', value: 'DRAFT' }])).toEqual([
      { label: 'Draft', value: 'DRAFT' },
    ]);
  });

  it('translates generated cash movement descriptions while preserving free-text notes', () => {
    const service = TestBed.inject(TranslationService);
    TestBed.inject(LanguageService).setLanguage('en');
    expect(service.t('Pago parcial de deuda del cliente')).toBe('Partial customer debt payment');
    expect(service.t('Pago de factura F-001')).toBe('Invoice payment F-001');
    expect(service.t('Nota de crédito NC-10')).toBe('Credit note NC-10');
    expect(service.t('Gasto')).toBe('Expense');
    expect(service.t('Pago de luz')).toBe('Pago de luz');
  });

  it('formats numbers, currency and dates using the active language', () => {
    const language = TestBed.inject(LanguageService);
    const number = TestBed.runInInjectionContext(() => new LocalizedNumberPipe());
    const currency = TestBed.runInInjectionContext(() => new LocalizedCurrencyPipe());
    const date = TestBed.runInInjectionContext(() => new LocalizedDatePipe());
    language.setLanguage('es');
    expect(number.transform(1234.5, '1.2-2')).toContain('1.234,50');
    expect(date.transform('2026-10-30', 'dd/MM/yyyy')).toBe('30/10/2026');
    language.setLanguage('en');
    expect(number.transform(1234.5, '1.2-2')).toBe('1,234.50');
    expect(currency.transform(1234.5, 'USD')).toBe('1,234.50$');
    expect(date.transform('2026-10-30', 'dd/MM/yyyy')).toBe('10/30/2026');
  });
});
