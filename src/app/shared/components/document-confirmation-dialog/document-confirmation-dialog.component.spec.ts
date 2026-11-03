import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { ColorMode, UserPreferencesService } from '@core/preferences/user-preferences.service';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { DocumentConfirmationDialogComponent } from './document-confirmation-dialog.component';
import { DocumentConfirmationModel } from '@shared/models/document-confirmation';

describe('DocumentConfirmationDialogComponent', () => {
  const colorMode = signal<ColorMode>('minimal');
  beforeEach(() => {
    colorMode.set('minimal');
    TestBed.configureTestingModule({
      providers: [
        {
          provide: UserPreferencesService,
          useValue: {
            colorMode,
            ready: () => true,
            shortcutsEnabled: () => true,
            showShortcutHints: () => false,
          },
        },
      ],
    });
  });
  const model: DocumentConfirmationModel = {
    title: 'Confirm document',
    icon: 'pi-check',
    acceptLabel: 'Accept',
    cancelLabel: 'Cancel',
    summaryFields: [{ label: 'Number', value: 'DOC-1' }],
    inventory: {
      blocking: false,
      rows: [
        {
          productName: 'Product',
          warehouseName: 'Main',
          quantity: 2,
          available: 5,
          availableAfter: 3,
          sufficient: true,
        },
      ],
    },
  };

  afterEach(() =>
    document.querySelectorAll('.p-dialog-mask').forEach((element) => element.remove()),
  );

  it('renders cancel before accept and the responsive inventory review', () => {
    TestBed.configureTestingModule({
      imports: [DocumentConfirmationDialogComponent],
      providers: [provideNoopAnimations()],
    });
    const fixture = TestBed.createComponent(DocumentConfirmationDialogComponent);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('model', model);
    fixture.detectChanges();

    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>('.p-dialog-footer button'),
    );
    expect(buttons.map((button) => button.textContent?.trim())).toEqual(['Cancel', 'Accept']);
    expect(document.body.textContent).toContain('DOC-1');
    expect(document.body.textContent).toContain('Product');
    expect(document.body.textContent).toContain('3');
  });

  it('disables acceptance while submitting', () => {
    TestBed.configureTestingModule({
      imports: [DocumentConfirmationDialogComponent],
      providers: [provideNoopAnimations()],
    });
    const fixture = TestBed.createComponent(DocumentConfirmationDialogComponent);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('model', model);
    fixture.componentRef.setInput('submitting', true);
    fixture.detectChanges();

    const buttons = document.querySelectorAll<HTMLButtonElement>('.p-dialog-footer button');
    expect(buttons[1].disabled).toBe(true);
  });

  it('keeps notices neutral by default and enables blue only in informative mode', () => {
    TestBed.configureTestingModule({ imports: [DocumentConfirmationDialogComponent] });
    const fixture = TestBed.createComponent(DocumentConfirmationDialogComponent);
    fixture.componentRef.setInput('model', {
      ...model,
      notice: { severity: 'warning', title: 'Review this document' },
    });
    const classes = fixture.componentInstance.noticeClasses().split(' ');
    expect(classes).toContain('bg-surface-50');
    expect(classes).not.toContain('bg-blue-50');
    expect(classes).not.toContain('bg-amber-50');
    expect(classes).toContain('in-[.cashly-informative]:bg-blue-50');
  });

  it('keeps the accept action visible when the page module differs from the action module', () => {
    TestBed.configureTestingModule({
      imports: [DocumentConfirmationDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: Router, useValue: { url: '/analytics/dashboard', events: EMPTY } },
        {
          provide: AuthorizationService,
          useValue: {
            can: (module: string, action: string) =>
              action === 'CONFIRM' && module === 'SALES_ORDERS',
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(DocumentConfirmationDialogComponent);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('model', {
      ...model,
      permissionAction: 'CONFIRM',
      permissionModule: BusinessModule.SALES_ORDERS,
    });
    fixture.detectChanges();

    const hosts = Array.from(document.querySelectorAll<HTMLElement>('.p-dialog-footer p-button'));
    expect(hosts).toHaveLength(2);
    expect(hosts[1].style.display).not.toBe('none');
  });

  it('uses a monochrome accept button in minimal mode and restores semantic color in informative mode', () => {
    TestBed.configureTestingModule({ imports: [DocumentConfirmationDialogComponent] });
    const fixture = TestBed.createComponent(DocumentConfirmationDialogComponent);
    fixture.componentRef.setInput('model', { ...model, acceptSeverity: 'success' });
    expect(fixture.componentInstance.acceptSeverity()).toBe('contrast');
    colorMode.set('informative');
    expect(fixture.componentInstance.acceptSeverity()).toBe('success');
  });
});
