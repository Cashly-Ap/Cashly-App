import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormHeaderComponent } from '@core/forms/components/headers/form-header/form-header.component';

describe('FormHeaderComponent', () => {
  let component: FormHeaderComponent;
  let fixture: ComponentFixture<FormHeaderComponent>;
  let compiled: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormHeaderComponent],
    });

    fixture = TestBed.createComponent(FormHeaderComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();

    const title = compiled.querySelector('h1');
    expect(title?.textContent?.trim()).toBe('Test Title');
  });

  it('should display subtitle when provided', () => {
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.componentRef.setInput('subtitle', 'Test Subtitle');
    fixture.detectChanges();

    const subtitle = compiled.querySelector('p');
    expect(subtitle?.textContent?.trim()).toBe('Test Subtitle');
  });

  it('should not display subtitle when not provided', () => {
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();

    const subtitle = compiled.querySelector('p');
    expect(subtitle).toBeFalsy();
  });
});
