import { AuditAction } from '@features/platform/audit/models/audit-action.enum';
import { AuditEntityType } from '@features/platform/audit/models/audit-entity-type.enum';

export interface AuditFilters {
  entityType?: AuditEntityType;
  entityId?: string;
  module?: string;
  action?: AuditAction[];
  actorId?: string;
  from?: string;
  to?: string;
  page: number;
  size: number;
}

export interface AuditActionOption {
  value: AuditAction;
  labelKey: string;
  count: number;
}

export interface AuditActorOption {
  id: string | null;
  name: string;
  photoUrl: string | null;
  count: number;
}

export interface AuditDateRange {
  min: string | null;
  max: string | null;
}

export interface AuditFilterOptions {
  actions: AuditActionOption[];
  actors: AuditActorOption[];
  dateRange: AuditDateRange | null;
}

export interface AuditFilterScope {
  entityType?: AuditEntityType;
  entityId?: string;
  module?: string;
}

export interface AuditTrailRequest {
  entityType?: AuditEntityType;
  entityId?: string;
  module?: string;
  label: string;
  subtitle?: string;
}
