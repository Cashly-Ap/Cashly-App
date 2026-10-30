import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { afterEach, describe, expect, it } from 'vitest';
import { DocumentConfirmationDialogComponent } from './document-confirmation-dialog.component';
import { DocumentConfirmationModel } from '@shared/models/document-confirmation';

describe('DocumentConfirmationDialogComponent', () => {
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
});
