import { AuditAction } from '@features/platform/audit/models/audit-action.enum';
import { AuditEntityType } from '@features/platform/audit/models/audit-entity-type.enum';

export type AuditChangeType = 'ADDED' | 'REMOVED' | 'MODIFIED';

export interface AuditChange {
  targetType: AuditEntityType;
  targetId: string | null;
  targetLabel: string | null;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  changeType: AuditChangeType;
}

export interface AuditActor {
  id: string | null;
  name: string;
  photoUrl: string | null;
}

export interface AuditEvent {
  id: string;
  module: string;
  entityType: AuditEntityType;
  entityId: string;
  entityLabel: string;
  secondaryLabel: string | null;
  action: AuditAction;
  actor: AuditActor;
  occurredAt: string;
  descriptionKey: string;
  descriptionArgs: string[];
  changes: AuditChange[];
  metadata: Record<string, unknown> | null;
}

export interface AuditChangeGroup {
  key: string;
  label: string | null;
  changes: AuditChange[];
}
