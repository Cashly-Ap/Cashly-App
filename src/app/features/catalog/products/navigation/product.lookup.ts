import { map } from 'rxjs';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { LookupFilterSources } from '@core/layouts/models/lookup-definition.model';
import { ProductApiService } from '@features/catalog/products/services/api/product-api.service';
import { CategoryApiService } from '@features/catalog/categories/services/api/category-api.service';
import { documentListAction } from '@shared/models/document-list-action';
import {
  booleanLookupFilter,
  lookupDescription,
  lookupOption,
  pageLookupResult,
  textLookupFilter,
} from '@shared/utils/navigation-lookup';

export const PRODUCT_LOOKUP: LookupDefinition = {
  route: '/catalog/products',
  load: (injector, query) => {
    const action = documentListAction(query.label);
    return injector
      .get(ProductApiService)
      .getAll({
        search: query.search || undefined,
        action: action === 'DELETE' ? 'DELETE' : undefined,
        page: query.page,
        size: query.size,
        active: booleanLookupFilter(query.filters['active']),
        composite: booleanLookupFilter(query.filters['composite']),
        categoryId: textLookupFilter(query.filters['categoryId']),
      })
      .pipe(
        map((response) =>
          pageLookupResult(response, (item) => ({
            id: item.id,
            label: item.name,
            description: lookupDescription(item.code, item.categoryName),
          })),
        ),
      );
  },
  filters: (sources: LookupFilterSources) => [
    {
      key: 'active',
      label: 'navigation.filters.active',
      options: [
        lookupOption('navigation.options.active', 'true'),
        lookupOption('navigation.options.inactive', 'false'),
      ],
      defaultValue: 'true',
    },
    {
      key: 'composite',
      label: 'navigation.filters.composite',
      options: [
        lookupOption('navigation.options.all', ''),
        lookupOption('navigation.options.simple', 'false'),
        lookupOption('navigation.options.composite', 'true'),
      ],
      defaultValue: '',
    },
    {
      key: 'categoryId',
      label: 'navigation.filters.category',
      options: [lookupOption('navigation.options.allCategories', ''), ...sources.categories],
      defaultValue: '',
    },
  ],
  loadFilterSources: (injector, sources) => {
    injector
      .get(CategoryApiService)
      .getAll({ active: true, page: 0, size: 1000 })
      .subscribe({
        next: (response) => {
          sources.categories = response.content.map((category) => ({
            label: category.name,
            value: category.id,
          }));
        },
        error: () => undefined,
      });
  },
  recordRoutes: {
    detail: (id: string) => ['/catalog/products', id],
    edit: (id: string) => ['/catalog/products', id, 'edit'],
  },
};
