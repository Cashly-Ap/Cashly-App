import { map } from 'rxjs';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { LookupFilterSources } from '@core/layouts/models/lookup-definition.model';
import { CustomerApiService } from '@features/partners/customers/services/api/customer-api.service';
import { CustomerType } from '@features/partners/customers/models/enums/customer-type.enum';
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

const CUSTOMER_TYPE_OPTIONS = [
  lookupOption('navigation.options.allTypes', ''),
  lookupOption('navigation.options.customerIndividual', CustomerType.INDIVIDUAL),
  lookupOption('navigation.options.customerBusiness', CustomerType.BUSINESS),
  lookupOption('navigation.options.customerGovernment', CustomerType.GOVERNMENT),
  lookupOption('navigation.options.customerOther', CustomerType.NON_PROFIT),
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

export const CUSTOMER_LOOKUP: LookupDefinition = {
  route: '/partners/customers',
  load: (injector, query) => {
    const action = documentListAction(query.label);
    return injector
      .get(CustomerApiService)
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
      options: CUSTOMER_TYPE_OPTIONS,
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
    detail: (id: string) => ['/partners/customers', id],
    edit: (id: string) => ['/partners/customers', id, 'edit'],
  },
};
