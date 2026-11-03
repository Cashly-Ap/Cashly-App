import { map } from 'rxjs';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { AccessManagementService } from '@features/platform/auth/authorization/services/access-management.service';
import { documentListAction } from '@shared/models/document-list-action';
import { arrayLookupResult } from '@shared/utils/navigation-lookup';

export const ROLE_LOOKUP: LookupDefinition = {
  route: '/platform/roles',
  load: (injector, query) => {
    const action = documentListAction(query.label);
    const requestedAction = action === 'DELETE' ? 'DELETE' : undefined;
    return injector
      .get(AccessManagementService)
      .roles(action === 'EDIT' ? 'EDIT' : requestedAction)
      .pipe(
        map((items) =>
          arrayLookupResult(
            items,
            (item) => ({
              id: item.id,
              label: item.name,
              description: item.description ?? '',
            }),
            query.search,
            query.page,
            query.size,
          ),
        ),
      );
  },
  filters: () => [],
  recordRoutes: {
    detail: (id: string) => ['/platform/roles', id],
    edit: (id: string) => ['/platform/roles', id, 'edit'],
  },
};
