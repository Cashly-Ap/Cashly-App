import { Injectable, inject } from '@angular/core';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { LOOKUP_DEFINITIONS } from '@shared/services/lookup-definition.token';

@Injectable({ providedIn: 'root' })
export class LookupDefinitionRegistry {
  private readonly definitions = inject(LOOKUP_DEFINITIONS);

  find(route: string): LookupDefinition | undefined {
    return this.definitions.find((definition) => definition.route === route);
  }

  get(route: string): LookupDefinition | undefined {
    return this.find(route);
  }
}
