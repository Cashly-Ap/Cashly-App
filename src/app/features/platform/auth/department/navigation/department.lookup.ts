import { map } from 'rxjs';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { AccessManagementService } from '@features/platform/auth/authorization/services/access-management.service';
import { documentListAction } from '@shared/models/document-list-action';
import { arrayLookupResult } from '@shared/utils/navigation-lookup';

export const DEPARTMENT_LOOKUP: LookupDefinition = {
  route: '/platform/departments',
  load: (injector, query) => {
    const action = documentListAction(query.label);
    const requestedAction = action === 'DELETE' ? 'DELETE' : undefined;
    return injector
      .get(AccessManagementService)
      .departments(requestedAction)
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
    detail: (id: string) => ['/platform/departments', id],
    edit: (id: string) => ['/platform/departments', id, 'edit'],
  },
};
