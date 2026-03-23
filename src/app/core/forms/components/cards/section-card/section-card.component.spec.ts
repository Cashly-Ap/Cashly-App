import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { SectionCardComponent } from './section-card.component';

describe('SectionCardComponent', () => {
  let component: SectionCardComponent;
  let fixture: ComponentFixture<SectionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply default colSpan of 1', () => {
    fixture.detectChanges();

    expect(component.colSpan()).toBe(1);
  });

  it('should apply custom colSpan when provided', () => {
    fixture.componentRef.setInput('colSpan', 2);
    fixture.detectChanges();

    expect(component.colSpan()).toBe(2);
  });

  it('should apply default padding class', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const wrapper = compiled.querySelector('div');
    expect(wrapper?.className).toContain('p-4');
  });

  it('should apply custom padding when provided', () => {
    fixture.componentRef.setInput('padding', 'p-6');
    fixture.detectChanges();

    expect(component.padding()).toBe('p-6');
  });

  it('should render with consistent styling classes', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const wrapper = compiled.querySelector('div');
    expect(wrapper?.className).toContain('bg-white');
    expect(wrapper?.className).toContain('dark:bg-surface-950');
    expect(wrapper?.className).toContain('rounded-lg');
    expect(wrapper?.className).toContain('border');
  });

  it('should project content through ng-content', () => {
    const testContent = '<p>Test Content</p>';
    fixture.nativeElement.innerHTML = testContent;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Test Content');
  });
});
