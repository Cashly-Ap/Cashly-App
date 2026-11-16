import { map } from 'rxjs';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { LookupFilterSources } from '@core/layouts/models/lookup-definition.model';
import { UserApiService } from '@features/platform/auth/user/services/api/user-api.service';
import { AccessManagementService } from '@features/platform/auth/authorization/services/access-management.service';
import { documentListAction } from '@shared/models/document-list-action';
import {
  booleanLookupFilter,
  lookupOption,
  pageLookupResult,
  textLookupFilter,
} from '@shared/utils/navigation-lookup';

export const USER_LOOKUP: LookupDefinition = {
  route: '/platform/users',
  load: (injector, query) => {
    const action = documentListAction(query.label);
    return injector
      .get(UserApiService)
      .getAll({
        search: query.search || undefined,
        action: action === 'DELETE' ? 'DELETE' : undefined,
        page: query.page,
        size: query.size,
        role: textLookupFilter(query.filters['role']),
        active: booleanLookupFilter(query.filters['active']),
      })
      .pipe(
        map((response) =>
          pageLookupResult(response, (item) => ({
            id: item.id,
            label: item.userName,
            description: item.email,
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
      key: 'role',
      label: 'navigation.filters.role',
      options: [lookupOption('navigation.options.allRoles', ''), ...sources.roles],
      defaultValue: '',
    },
  ],
  loadFilterSources: (injector, sources) => {
    injector
      .get(AccessManagementService)
      .roleOptions()
      .subscribe({
        next: (roles) => {
          sources.roles = roles.map((role) => ({ label: role.name, value: role.id }));
        },
        error: () => undefined,
      });
  },
  recordRoutes: {
    detail: (id: string) => ['/platform/users', id],
    edit: (id: string) => ['/platform/users', id, 'edit'],
  },
};
