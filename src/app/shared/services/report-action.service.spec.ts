import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReportActionService } from '@shared/services/report-action.service';
import { REPORT_ACTION_HANDLERS } from '@shared/services/report-action-handlers.token';

class FirstReportComponent {}
class SecondReportComponent {}

describe('ReportActionService', () => {
  let service: ReportActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReportActionService,
        {
          provide: REPORT_ACTION_HANDLERS,
          useValue: [
            {
              key: 'first',
              inputs: { reportKey: 'first' },
              load: vi.fn().mockResolvedValue(FirstReportComponent),
            },
            {
              key: 'second',
              load: vi.fn().mockResolvedValue(SecondReportComponent),
            },
          ],
        },
      ],
    });
    service = TestBed.inject(ReportActionService);
  });

  it('returns false for an unknown report', () => {
    expect(service.open('missing')).toBe(false);
    expect(service.request()).toBeNull();
  });

  it('loads the report component before publishing the request', async () => {
    expect(service.open('first')).toBe(true);
    expect(service.request()).toBeNull();

    await Promise.resolve();

    expect(service.request()).toEqual({
      component: FirstReportComponent,
      inputs: { reportKey: 'first' },
    });
  });

  it('ignores a report load that finishes after closing', async () => {
    service.open('first');
    service.close();

    await Promise.resolve();

    expect(service.request()).toBeNull();
  });
});
