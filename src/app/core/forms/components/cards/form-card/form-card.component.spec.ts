import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormCardComponent } from './form-card.component';
import { Component } from '@angular/core';

@Component({
  template: '<app-form-card><div class="test-content">Test Content</div></app-form-card>',
  imports: [FormCardComponent],
})
class TestHostComponent {}

describe('FormCardComponent', () => {
  let component: FormCardComponent;
  let fixture: ComponentFixture<FormCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render content inside card', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    const compiled = hostFixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.test-content')).toBeTruthy();
    expect(compiled.querySelector('.test-content')?.textContent).toContain('Test Content');
  });

  it('should apply background classes', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const cardDiv = compiled.querySelector('div');
    expect(cardDiv?.className).toContain('bg-white');
    expect(cardDiv?.className).toContain('dark:bg-surface-950');
  });

  it('should apply rounded class', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const cardDiv = compiled.querySelector('div');
    expect(cardDiv?.className).toContain('rounded-xl');
  });

  it('should apply border classes', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const cardDiv = compiled.querySelector('div');
    expect(cardDiv?.className).toContain('border');
    expect(cardDiv?.className).toContain('border-surface-200');
    expect(cardDiv?.className).toContain('dark:border-surface-800');
  });
});
