import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextBadgeComponent, TextBadgeVariant } from './text-badge.component';

describe('TextBadgeComponent', () => {
  let component: TextBadgeComponent;
  let fixture: ComponentFixture<TextBadgeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TextBadgeComponent],
    });

    fixture = TestBed.createComponent(TextBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('label', 'Test Badge');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display the label text', () => {
    fixture.componentRef.setInput('label', 'Facturación');
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector('span');
    expect(span.textContent.trim()).toBe('Facturación');
  });

  it('should apply default variant classes by default', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector('span');
    expect(span.className).toContain('bg-surface-900');
    expect(span.className).toContain('text-surface-0');
  });

  it('should apply secondary variant classes', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('variant', 'secondary' as TextBadgeVariant);
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector('span');
    expect(span.className).toContain('bg-surface-200');
    expect(span.className).toContain('text-surface-600');
  });

  it('should apply info variant classes', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('variant', 'info' as TextBadgeVariant);
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector('span');
    expect(span.className).toContain('bg-blue-100');
    expect(span.className).toContain('text-blue-700');
  });

  it('should apply success variant classes', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('variant', 'success' as TextBadgeVariant);
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector('span');
    expect(span.className).toContain('bg-green-100');
    expect(span.className).toContain('text-green-700');
  });

  it('should apply warning variant classes', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('variant', 'warning' as TextBadgeVariant);
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector('span');
    expect(span.className).toContain('bg-yellow-100');
    expect(span.className).toContain('text-yellow-700');
  });

  it('should apply danger variant classes', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('variant', 'danger' as TextBadgeVariant);
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector('span');
    expect(span.className).toContain('bg-red-100');
    expect(span.className).toContain('text-red-700');
  });

  it('should have base styling classes', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector('span');
    expect(span.className).toContain('text-xs');
    expect(span.className).toContain('font-medium');
    expect(span.className).toContain('rounded-lg');
    expect(span.className).toContain('px-3');
    expect(span.className).toContain('py-1.5');
  });
});
