import { InjectionToken, Type } from '@angular/core';

export interface ReportActionHandlerRegistration {
  key: string;
  component: Type<unknown>;
  inputs?: Record<string, unknown>;
}

export const REPORT_ACTION_HANDLERS = new InjectionToken<ReportActionHandlerRegistration[]>(
  'REPORT_ACTION_HANDLERS',
  { factory: () => [] },
);
