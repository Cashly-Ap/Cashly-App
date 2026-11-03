import { map } from 'rxjs';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { PriceTypeApiService } from '@features/catalog/price-types/services/api/price-type-api.service';
import { documentListAction } from '@shared/models/document-list-action';
import {
  booleanLookupFilter,
  lookupOption,
  pageLookupResult,
} from '@shared/utils/navigation-lookup';

export const PRICE_TYPE_LOOKUP: LookupDefinition = {
  route: '/catalog/price-types',
  load: (injector, query) => {
    const action = documentListAction(query.label);
    return injector
      .get(PriceTypeApiService)
      .getAll({
        search: query.search || undefined,
        action: action === 'DELETE' ? 'DELETE' : undefined,
        page: query.page,
        size: query.size,
        active: booleanLookupFilter(query.filters['active']),
      })
      .pipe(
        map((response) =>
          pageLookupResult(response, (item) => ({
            id: item.id,
            label: item.name,
            description: item.active ? 'Activo' : 'Inactivo',
          })),
        ),
      );
  },
  filters: () => [
    {
      key: 'active',
      label: 'navigation.filters.active',
      options: [
        lookupOption('navigation.options.active', 'true'),
        lookupOption('navigation.options.inactive', 'false'),
      ],
      defaultValue: 'true',
    },
  ],
  recordRoutes: {
    detail: (id: string) => ['/catalog/price-types', id],
    edit: (id: string) => ['/catalog/price-types', id, 'edit'],
  },
};
