import { Injector } from '@angular/core';
import { Observable } from 'rxjs';

export interface LookupFilterOption {
  label: string;
  value: string;
}

export interface LookupFilterDefinition {
  key: string;
  label: string;
  options: readonly LookupFilterOption[];
  defaultValue: string;
}

export interface LookupFilterValueMap {
  readonly [key: string]: string;
}

export interface LookupFilterSources {
  values: LookupFilterValueMap;
  categories: readonly LookupFilterOption[];
  registers: readonly LookupFilterOption[];
  roles: readonly LookupFilterOption[];
}

export interface LookupQuery {
  label: string;
  search: string;
  page: number;
  size: number;
  filters: Readonly<Record<string, string>>;
}

export interface LookupItem {
  id: string;
  label: string;
  description: string;
}

export interface LookupResult {
  items: LookupItem[];
  total: number;
}

export interface LookupRecordRoutes {
  detail: (id: string) => readonly string[];
  edit: (id: string) => readonly string[];
}

export interface LookupDefinition {
  route: string;
  load: (injector: Injector, query: LookupQuery) => Observable<LookupResult>;
  filters: (sources: LookupFilterSources) => readonly LookupFilterDefinition[];
  loadFilterSources?: (injector: Injector, sources: LookupFilterSources) => void;
  recordRoutes: LookupRecordRoutes;
}
