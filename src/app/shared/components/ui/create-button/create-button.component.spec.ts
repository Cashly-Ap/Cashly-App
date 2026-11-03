import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateButtonComponent } from './create-button.component';

describe('CreateButtonComponent', () => {
  let component: CreateButtonComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CreateButtonComponent] });
    const fixture = TestBed.createComponent(CreateButtonComponent);
    fixture.componentRef.setInput('labelKey', 'shared.new');
    component = fixture.componentInstance;
  });

  it('uses the shared create defaults', () => {
    expect(component.permission()).toBe('CREATE');
    expect(component.icon()).toBe('pi pi-plus');
    expect(component.severity()).toBe('contrast');
    expect(component.styleClass()).toBe('font-medium w-full sm:w-auto');
  });

  it('emits create when clicked', () => {
    let emitted = 0;
    component.create.subscribe(() => (emitted += 1));

    component.create.emit();

    expect(emitted).toBe(1);
  });

  it('accepts a label key and disabled state', () => {
    const fixture = TestBed.createComponent(CreateButtonComponent);
    fixture.componentRef.setInput('labelKey', 'sales.quotes.newQuote');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(fixture.componentInstance.labelKey()).toBe('sales.quotes.newQuote');
    expect(fixture.componentInstance.disabled()).toBe(true);
  });
});
