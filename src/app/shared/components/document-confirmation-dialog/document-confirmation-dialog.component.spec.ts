import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { signal } from '@angular/core';
import { ColorMode, UserPreferencesService } from '@core/preferences/user-preferences.service';
import { DocumentConfirmationDialogComponent } from './document-confirmation-dialog.component';
import { DocumentConfirmationModel } from '@shared/models/document-confirmation';

describe('DocumentConfirmationDialogComponent', () => {
  const colorMode = signal<ColorMode>('minimal');
  beforeEach(() => {
    colorMode.set('minimal');
    TestBed.configureTestingModule({
      providers: [{ provide: UserPreferencesService, useValue: { colorMode } }],
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

  it('uses a monochrome accept button in minimal mode and restores semantic color in informative mode', () => {
    TestBed.configureTestingModule({ imports: [DocumentConfirmationDialogComponent] });
    const fixture = TestBed.createComponent(DocumentConfirmationDialogComponent);
    fixture.componentRef.setInput('model', { ...model, acceptSeverity: 'success' });
    expect(fixture.componentInstance.acceptSeverity()).toBe('contrast');
    colorMode.set('informative');
    expect(fixture.componentInstance.acceptSeverity()).toBe('success');
  });
});
