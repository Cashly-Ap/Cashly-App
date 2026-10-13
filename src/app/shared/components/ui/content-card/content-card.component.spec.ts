import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [ContentCardComponent],
  template: '<app-content-card><p>Account overview</p></app-content-card>',
})
class TestHostComponent {}

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

  it('should project content', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();

    const compiled = hostFixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-content-card p')?.textContent).toBe('Account overview');
  });

  it('should not have margin by default', () => {
    const compiled = fixture.nativeElement;
    const container = compiled.querySelector('div');

    expect(container.className).not.toContain('mt-');
    expect(container.className).not.toContain('mb-');
    expect(container.className).not.toContain('my-');
  });
});
