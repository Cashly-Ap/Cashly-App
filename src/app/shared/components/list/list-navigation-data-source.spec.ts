import { Injector } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ProductApiService } from '@features/catalog/products/services/api/product-api.service';
import { loadNavigationLookup } from './list-navigation-data-source';

describe('loadNavigationLookup', () => {
  it('requests DELETE and presents every backend record without local eligibility filtering', async () => {
    const getAll = vi.fn().mockReturnValue(
      of({
        content: [
          { id: 'protected', name: 'Protected', code: 'P-1', categoryName: null, deletable: false },
          { id: 'associated', name: 'Associated', code: 'P-2', categoryName: null, hasAssociatedRecords: true },
        ],
        totalElements: 2,
      }),
    );
    const injector = {
      get: vi.fn().mockReturnValue({ getAll }),
    } as unknown as Injector;

    const result = await firstValueFrom(
      loadNavigationLookup(injector, '/catalog/products', 'Eliminar', '', 0, 10),
    );

    expect(injector.get).toHaveBeenCalledWith(ProductApiService);
    expect(getAll).toHaveBeenCalledWith({
      search: undefined,
      page: 0,
      size: 10,
      action: 'DELETE',
      active: undefined,
      composite: undefined,
      categoryId: undefined,
    });
    expect(result.items.map((item) => item.id)).toEqual(['protected', 'associated']);
  });
});
