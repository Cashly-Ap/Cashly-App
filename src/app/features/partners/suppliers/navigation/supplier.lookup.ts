import { map } from 'rxjs';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { LookupFilterSources } from '@core/layouts/models/lookup-definition.model';
import { SupplierApiService } from '@features/partners/suppliers/services/api/supplier-api.service';
import { SupplierType } from '@features/partners/suppliers/models/enums/supplier-type.enum';
import {
  getMunicipalitiesForState,
  VENEZUELA_STATE_NAMES,
} from '@features/partners/customers/data/venezuela-geo.data';
import { documentListAction } from '@shared/models/document-list-action';
import {
  booleanLookupFilter,
  lookupDescription,
  lookupOption,
  pageLookupResult,
  textLookupFilter,
} from '@shared/utils/navigation-lookup';

const SUPPLIER_TYPE_OPTIONS = [
  lookupOption('navigation.options.allTypes', ''),
  lookupOption('navigation.options.supplierNatural', SupplierType.NATURAL),
  lookupOption('navigation.options.supplierLegal', SupplierType.JURIDICO),
];

const stateOptions = () => [
  lookupOption('navigation.options.allStates', ''),
  ...VENEZUELA_STATE_NAMES.map((state) => lookupOption(state, state)),
];

const municipalityOptions = (sources: LookupFilterSources) => {
  const state = sources.values['state'];
  if (!state) return [lookupOption('navigation.options.allMunicipalities', '')];
  return [
    lookupOption('navigation.options.allMunicipalities', ''),
    ...getMunicipalitiesForState(state).map((municipality) =>
      lookupOption(municipality, municipality),
    ),
  ];
};

export const SUPPLIER_LOOKUP: LookupDefinition = {
  route: '/partners/suppliers',
  load: (injector, query) => {
    const action = documentListAction(query.label);
    return injector
      .get(SupplierApiService)
      .getAll({
        search: query.search || undefined,
        action: action === 'DELETE' ? 'DELETE' : undefined,
        page: query.page,
        size: query.size,
        type: textLookupFilter(query.filters['type']),
        active: booleanLookupFilter(query.filters['active']),
        state: textLookupFilter(query.filters['state']),
        municipality: textLookupFilter(query.filters['municipality']),
      })
      .pipe(
        map((response) =>
          pageLookupResult(response, (item) => ({
            id: item.id,
            label: item.legalName,
            description: lookupDescription(`#${item.code}`, item.rif),
          })),
        ),
      );
  },
  filters: (sources: LookupFilterSources) => [
    {
      key: 'type',
      label: 'navigation.filters.type',
      options: SUPPLIER_TYPE_OPTIONS,
      defaultValue: '',
    },
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
      key: 'state',
      label: 'navigation.filters.state',
      options: stateOptions(),
      defaultValue: '',
    },
    {
      key: 'municipality',
      label: 'navigation.filters.municipality',
      options: municipalityOptions(sources),
      defaultValue: '',
    },
  ],
  recordRoutes: {
    detail: (id: string) => ['/partners/suppliers', id],
    edit: (id: string) => ['/partners/suppliers', id, 'edit'],
  },
};
