import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormContainerComponent } from '@core/forms/components/cards/form-container/form-container.component';

describe('FormContainerComponent', () => {
  let component: FormContainerComponent;
  let fixture: ComponentFixture<FormContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default maxWidth', () => {
    expect(component.maxWidth()).toBe('max-w-[1800px]');
  });

  it('should accept custom maxWidth', () => {
    fixture.componentRef.setInput('maxWidth', 'max-w-4xl');
    fixture.detectChanges();
    expect(component.maxWidth()).toBe('max-w-4xl');
  });
});
