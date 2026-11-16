import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { PickerTriggerComponent } from '@shared/components/ui/picker-trigger/picker-trigger.component';

describe('PickerTriggerComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PickerTriggerComponent] });
  });

  it('renders the translated label and icon', () => {
    const fixture = TestBed.createComponent(PickerTriggerComponent);
    fixture.componentRef.setInput(
      'labelKey',
      'finance.billing.creditnotes.searchAndSelectACustomer',
    );
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.textContent?.trim().length).toBeGreaterThan(0);
    expect(button.querySelector('i')?.className).toContain('pi-search');
  });

  it('emits open when clicked', () => {
    const fixture = TestBed.createComponent(PickerTriggerComponent);
    fixture.componentRef.setInput('labelKey', 'shared.search');
    fixture.detectChanges();
    let emitted = 0;
    fixture.componentInstance.open.subscribe(() => (emitted += 1));

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

    expect(emitted).toBe(1);
  });
});
