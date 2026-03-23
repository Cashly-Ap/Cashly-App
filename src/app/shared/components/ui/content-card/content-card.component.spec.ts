import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentCardComponent } from './content-card.component';

describe('ContentCardComponent', () => {
  let component: ContentCardComponent;
  let fixture: ComponentFixture<ContentCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ContentCardComponent],
    });

    fixture = TestBed.createComponent(ContentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct base styling', () => {
    const compiled = fixture.nativeElement;
    const container = compiled.querySelector('div');

    expect(container).toBeTruthy();
    expect(container.className).toContain('bg-surface-0/80');
    expect(container.className).toContain('dark:bg-surface-900/80');
    expect(container.className).toContain('backdrop-blur-sm');
    expect(container.className).toContain('rounded-2xl');
    expect(container.className).toContain('shadow-2xl');
    expect(container.className).toContain('border-2');
  });

  it('should not have margin by default', () => {
    const compiled = fixture.nativeElement;
    const container = compiled.querySelector('div');

    expect(container.className).not.toContain('mt-');
    expect(container.className).not.toContain('mb-');
    expect(container.className).not.toContain('my-');
  });
});
