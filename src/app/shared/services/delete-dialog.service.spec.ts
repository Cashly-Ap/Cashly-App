import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { TranslationService } from '@core/i18n/translation.service';
import { DELETE_HANDLERS } from './delete-handlers.token';
import { DeleteDialogService } from './delete-dialog.service';

describe('DeleteDialogService', () => {
  const messages = { add: vi.fn() };
  const translations = { t: vi.fn((key: string) => key) };

  function create(handlers = [{ resource: 'customers', execute: vi.fn(() => of(void 0)) }]) {
    TestBed.configureTestingModule({
      providers: [
        DeleteDialogService,
        { provide: MessageService, useValue: messages },
        { provide: TranslationService, useValue: translations },
        { provide: DELETE_HANDLERS, useValue: handlers },
      ],
    });
    return { service: TestBed.inject(DeleteDialogService), handlers };
  }

  beforeEach(() => {
    messages.add.mockClear();
    translations.t.mockClear();
  });

  it('delegates confirmation to the registered resource handler', () => {
    const { service, handlers } = create();
    service.open('customers', 'customer-1', 'Acme');
    service.confirm();
    expect(handlers[0].execute).toHaveBeenCalledWith('customer-1');
    expect(service.request()).toBeNull();
  });

  it('cleans currency and quote characters from the displayed label', () => {
    const { service } = create();
    service.open('customers', 'customer-1', '«$Acme»');
    expect(service.request()?.label).toBe('Acme');
  });

  it('reports an error when the resource has no handler', () => {
    const { service } = create([]);
    service.open('customers', 'customer-1', 'Acme');
    service.confirm();
    expect(messages.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', detail: 'common.delete.missingHandler' }),
    );
  });

  it('keeps the request open when deletion fails', () => {
    const handler = { resource: 'customers', execute: vi.fn(() => throwError(() => new Error('fail'))) };
    const { service } = create([handler]);
    service.open('customers', 'customer-1', 'Acme');
    service.confirm();
    expect(service.request()).not.toBeNull();
    expect(service.loading()).toBe(false);
  });
});
