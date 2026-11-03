import { InjectionToken } from '@angular/core';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';

export const LOOKUP_DEFINITIONS = new InjectionToken<LookupDefinition[]>('LOOKUP_DEFINITIONS', {
  factory: () => [],
});
