import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NotificationDestinationResolver } from './notification-destination.resolver';

describe('NotificationDestinationResolver', () => {
  let resolver: NotificationDestinationResolver;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    resolver = TestBed.inject(NotificationDestinationResolver);
    router = TestBed.inject(Router);
  });

  it.each([
    [
      'PAYMENT',
      'payment-1',
      ['/receivables'],
      { queryParams: { tab: 'pending', focus: 'payment-1' } },
    ],
    ['QUOTE', 'quote-1', ['/quotes', 'quote-1']],
    ['ORDER', 'order-1', ['/orders', 'order-1']],
  ])(
    'should navigate a %s reference to its detail route',
    async (referenceType, referenceId, commands, extras) => {
      const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      await resolver.navigate(referenceType, referenceId);

      expect(navigate).toHaveBeenCalledWith(commands, ...(extras ? [extras] : []));
    },
  );

  it('should open the quote origin for conversion notifications', async () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await resolver.navigate('QUOTE', 'quote-origin');

    expect(navigate).toHaveBeenCalledWith(['/quotes', 'quote-origin']);
  });

  it('should fall back to the known collection when the id is absent', async () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await resolver.navigate('PAYMENT', null);

    expect(navigate).toHaveBeenCalledWith(['/receivables'], { queryParams: { tab: 'pending' } });
  });

  it('should fall back to the collection when detail navigation is rejected', async () => {
    const navigate = vi
      .spyOn(router, 'navigate')
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    await resolver.navigate('ORDER', 'order-1');

    expect(navigate).toHaveBeenNthCalledWith(1, ['/orders', 'order-1']);
    expect(navigate).toHaveBeenNthCalledWith(2, ['/orders']);
  });

  it('should not navigate for an unknown reference type', async () => {
    const navigate = vi.spyOn(router, 'navigate');

    await resolver.navigate('INVOICE', 'invoice-1');

    expect(navigate).not.toHaveBeenCalled();
  });
});
