import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
    });

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('icon', 'pi-inbox');
    fixture.componentRef.setInput('message', 'No items found');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display icon', () => {
    const compiled = fixture.nativeElement;
    const icon = compiled.querySelector('i');
    expect(icon).toBeTruthy();
    expect(icon.className).toContain('pi-inbox');
  });

  it('should display message', () => {
    const compiled = fixture.nativeElement;
    const message = compiled.querySelector('p');
    expect(message).toBeTruthy();
    expect(message.textContent).toContain('No items found');
  });

  it('should update when inputs change', () => {
    fixture.componentRef.setInput('icon', 'pi-search');
    fixture.componentRef.setInput('message', 'Search yielded no results');
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const icon = compiled.querySelector('i');
    const message = compiled.querySelector('p');

    expect(icon.className).toContain('pi-search');
    expect(message.textContent).toContain('Search yielded no results');
  });

  describe('title', () => {
    it('should display title when provided', () => {
      fixture.componentRef.setInput('title', 'No Data');
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const title = compiled.querySelector('h3');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('No Data');
    });

    it('should not display title when not provided', () => {
      const compiled = fixture.nativeElement;
      const title = compiled.querySelector('h3');
      expect(title).toBeNull();
    });
  });

  describe('button', () => {
    it('should display button when buttonLabel is provided', () => {
      fixture.componentRef.setInput('buttonLabel', 'Create New');
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const button = compiled.querySelector('p-button');
      expect(button).toBeTruthy();
    });

    it('should not display button when buttonLabel is not provided', () => {
      const compiled = fixture.nativeElement;
      const button = compiled.querySelector('p-button');
      expect(button).toBeNull();
    });

    it('should use default icon pi-plus when buttonIcon is not provided', () => {
      fixture.componentRef.setInput('buttonLabel', 'Create New');
      fixture.detectChanges();

      expect(component.buttonIcon()).toBe('pi pi-plus');
    });

    it('should use custom icon when buttonIcon is provided', () => {
      fixture.componentRef.setInput('buttonLabel', 'Search');
      fixture.componentRef.setInput('buttonIcon', 'pi pi-search');
      fixture.detectChanges();

      expect(component.buttonIcon()).toBe('pi pi-search');
    });

    it('should emit buttonClick when button is clicked', () => {
      fixture.componentRef.setInput('buttonLabel', 'Create New');
      fixture.detectChanges();

      const emitSpy = vi.spyOn(component.buttonClick, 'emit');
      const compiled = fixture.nativeElement;
      const button = compiled.querySelector('p-button button');

      if (button) {
        button.click();
        expect(emitSpy).toHaveBeenCalled();
      }
    });
  });
});
