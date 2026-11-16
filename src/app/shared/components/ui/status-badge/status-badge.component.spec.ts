import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from '@shared/components/ui/status-badge/status-badge.component';

describe('StatusBadgeComponent', () => {
  let component: StatusBadgeComponent;
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
    });

    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display active badge when active is true', () => {
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const badge = compiled.querySelector('span');
    expect(badge).toBeTruthy();
    expect(badge.textContent?.trim()).toBe('Activo');
    expect(badge.className).toContain('bg-surface-900');
  });

  it('should display inactive badge when active is false', () => {
    fixture.componentRef.setInput('active', false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const badge = compiled.querySelector('span');
    expect(badge).toBeTruthy();
    expect(badge.textContent?.trim()).toBe('Inactivo');
    expect(badge.className).toContain('bg-surface-300');
    expect(badge.className).toContain('text-surface-700');
  });

  it('should use custom labels', () => {
    fixture.componentRef.setInput('active', true);
    fixture.componentRef.setInput('activeLabel', 'Enabled');
    fixture.componentRef.setInput('inactiveLabel', 'Disabled');
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    let badge = compiled.querySelector('span');
    expect(badge.textContent?.trim()).toBe('Enabled');

    fixture.componentRef.setInput('active', false);
    fixture.detectChanges();
    badge = compiled.querySelector('span');
    expect(badge.textContent?.trim()).toBe('Disabled');
  });
});
