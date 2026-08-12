import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListSectionComponent } from '@core/forms/components/dynamic-lists/list-section/list-section.component';
import { By } from '@angular/platform-browser';

describe('ListSectionComponent', () => {
  let component: ListSectionComponent;
  let fixture: ComponentFixture<ListSectionComponent>;
  let compiled: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListSectionComponent],
    });

    fixture = TestBed.createComponent(ListSectionComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();

    const title = compiled.querySelector('h3');
    expect(title?.textContent?.trim()).toContain('Test Title');
  });

  it('should display icon when provided', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.componentRef.setInput('icon', 'pi-envelope');
    fixture.detectChanges();

    const icon = compiled.querySelector('h3 i');
    expect(icon?.className).toContain('pi-envelope');
  });

  it('should display add button with default label', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.detectChanges();

    expect(component.addButtonLabel()).toBe('Agregar');
  });

  it('should display custom add button label', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.componentRef.setInput('addButtonLabel', 'Añadir Nuevo');
    fixture.detectChanges();

    expect(component.addButtonLabel()).toBe('Añadir Nuevo');
  });

  it('should emit add event when button is clicked', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.detectChanges();

    let emitted = false;
    component.add.subscribe(() => {
      emitted = true;
    });

    const button = fixture.debugElement.query(By.css('p-button'));
    button.triggerEventHandler('onClick', null);

    expect(emitted).toBe(true);
  });

  it('should display empty state when isEmpty is true', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.componentRef.setInput('isEmpty', true);
    fixture.detectChanges();

    const emptyState = compiled.querySelector('.border-dashed');
    expect(emptyState).toBeTruthy();
  });

  it('should not display empty state when isEmpty is false', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.componentRef.setInput('isEmpty', false);
    fixture.detectChanges();

    const emptyState = compiled.querySelector('.border-dashed');
    expect(emptyState).toBeFalsy();
  });

  it('should display default empty message', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.componentRef.setInput('isEmpty', true);
    fixture.detectChanges();

    const message = compiled.querySelector('.border-dashed p');
    expect(message?.textContent?.trim()).toBe('No hay elementos registrados');
  });

  it('should display custom empty message', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.componentRef.setInput('isEmpty', true);
    fixture.componentRef.setInput('emptyMessage', 'No hay emails');
    fixture.detectChanges();

    const message = compiled.querySelector('.border-dashed p');
    expect(message?.textContent?.trim()).toBe('No hay emails');
  });

  it('should display empty icon when provided', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.componentRef.setInput('isEmpty', true);
    fixture.componentRef.setInput('emptyIcon', 'pi-inbox');
    fixture.detectChanges();

    const icon = compiled.querySelector('.border-dashed i');
    expect(icon?.className).toContain('pi-inbox');
  });

  it('should apply default container class', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.detectChanges();

    const container = compiled.querySelector('div');
    expect(container?.className).toContain('bg-surface-50');
    expect(container?.className).toContain('rounded-xl');
    expect(container?.className).toContain('border');
  });

  it('should apply custom container class', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.componentRef.setInput('containerClass', 'custom-class');
    fixture.detectChanges();

    const container = compiled.querySelector('div');
    expect(container?.className).toContain('custom-class');
  });

  it('should render content container', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.detectChanges();

    const contentDivs = compiled.querySelectorAll('div');
    expect(contentDivs.length).toBeGreaterThan(0);
  });
});
