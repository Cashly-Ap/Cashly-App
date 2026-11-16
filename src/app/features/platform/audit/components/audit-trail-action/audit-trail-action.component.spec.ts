import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuditTrailActionComponent } from '@features/platform/audit/components/audit-trail-action/audit-trail-action.component';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { AuditTrailDialogService } from '@shared/services/audit-trail-dialog.service';
import { AuditPermission } from '@features/platform/audit/permissions';

describe('AuditTrailActionComponent', () => {
  let fixture: ComponentFixture<AuditTrailActionComponent>;
  let component: AuditTrailActionComponent;
  let authorization: { can: ReturnType<typeof vi.fn> };
  let dialog: AuditTrailDialogService;

  beforeEach(() => {
    authorization = { can: vi.fn(() => true) };

    TestBed.configureTestingModule({
      imports: [AuditTrailActionComponent],
      providers: [{ provide: AuthorizationService, useValue: authorization }],
    });

    fixture = TestBed.createComponent(AuditTrailActionComponent);
    component = fixture.componentInstance;
    dialog = TestBed.inject(AuditTrailDialogService);
    fixture.componentRef.setInput('entityType', 'INVOICE');
    fixture.componentRef.setInput('entityId', 'inv-001');
    fixture.componentRef.setInput('label', 'FAC-001');
    fixture.componentRef.setInput('subtitle', 'Acme');
  });

  it('is visible only with the audit trail view permission', () => {
    fixture.detectChanges();
    expect(authorization.can).toHaveBeenCalledWith(AuditPermission.VIEW_LIST);
    expect(fixture.nativeElement.querySelector('button')).not.toBeNull();

    authorization.can.mockReturnValue(false);
    expect(component.visible()).toBe(false);
    fixture.componentRef.setInput('label', 'FAC-002');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('opens the audit dialog with the entity context', () => {
    fixture.detectChanges();

    component.open();

    expect(dialog.request()).toEqual({
      entityType: 'INVOICE',
      entityId: 'inv-001',
      label: 'FAC-001',
      subtitle: 'Acme',
    });
  });

  it('omits optional fields when they are not provided', () => {
    fixture.componentRef.setInput('entityId', undefined);
    fixture.componentRef.setInput('subtitle', undefined);
    fixture.detectChanges();

    component.open();

    expect(dialog.request()).toEqual({ entityType: 'INVOICE', label: 'FAC-001' });
  });
});
