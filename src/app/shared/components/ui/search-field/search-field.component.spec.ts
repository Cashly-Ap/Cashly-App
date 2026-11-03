import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Tooltip } from 'primeng/tooltip';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';

describe('SearchFieldComponent', () => {
  let fixture: ComponentFixture<SearchFieldComponent>;
  let component: SearchFieldComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SearchFieldComponent],
    });

    fixture = TestBed.createComponent(SearchFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('value', 'inicial');
    fixture.componentRef.setInput('placeholder', 'Buscar registros...');
    fixture.detectChanges();
  });

  it('does not search while the user is typing', () => {
    const searchSpy = vi.fn();
    component.search.subscribe(searchSpy);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = 'nuevo término';
    input.dispatchEvent(new Event('input'));

    expect(searchSpy).not.toHaveBeenCalled();
  });

  it('emits the draft only when the search button is pressed', () => {
    const searchSpy = vi.fn();
    component.search.subscribe(searchSpy);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Buscar"]',
    ) as HTMLButtonElement;

    input.value = 'nuevo término';
    input.dispatchEvent(new Event('input'));
    button.click();

    expect(searchSpy).toHaveBeenCalledOnce();
    expect(searchSpy).toHaveBeenCalledWith('nuevo término');
  });

  it('searches when Enter is pressed in the input', () => {
    const searchSpy = vi.fn();
    component.search.subscribe(searchSpy);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = 'buscar con enter';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(searchSpy).toHaveBeenCalledOnce();
    expect(searchSpy).toHaveBeenCalledWith('buscar con enter');
  });

  it('clears the draft and restores the default search when clear is pressed', () => {
    const searchSpy = vi.fn();
    component.search.subscribe(searchSpy);
    const clearButton = fixture.nativeElement.querySelector(
      'button[aria-label="Limpiar búsqueda"]',
    ) as HTMLButtonElement;

    clearButton.click();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(component.draft()).toBe('');
    expect(input.value).toBe('');
    expect(searchSpy).toHaveBeenCalledOnce();
    expect(searchSpy).toHaveBeenCalledWith('');
  });

  it('hides the clear button when the search is empty', () => {
    component.clear();
    fixture.detectChanges();

    const clearButton = fixture.nativeElement.querySelector(
      'button[aria-label="Limpiar búsqueda"]',
    );
    expect(clearButton).toBeNull();
  });

  it('renders an accessible icon button with light and dark mode colors', () => {
    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Buscar"]',
    ) as HTMLButtonElement;

    expect(button.getAttribute('aria-label')).toBe('Buscar');
    expect(button.textContent?.trim()).toBe('');
    expect(button.className).toContain('text-black');
    expect(button.className).toContain('dark:!text-white');
  });

  it('emits on every keystroke when live mode is enabled', () => {
    const searchSpy = vi.fn();
    component.search.subscribe(searchSpy);
    fixture.componentRef.setInput('live', true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = 'mod';
    input.dispatchEvent(new Event('input'));
    input.value = 'modules';
    input.dispatchEvent(new Event('input'));

    expect(searchSpy).toHaveBeenCalledTimes(2);
    expect(searchSpy).toHaveBeenLastCalledWith('modules');
  });

  it('hides the search button when showButton is disabled', () => {
    fixture.componentRef.setInput('showButton', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button[aria-label="Buscar"]')).toBeNull();
  });

  it('does not submit on Enter when submitOnEnter is disabled', () => {
    const searchSpy = vi.fn();
    component.search.subscribe(searchSpy);
    fixture.componentRef.setInput('submitOnEnter', false);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = 'combobox';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));

    expect(searchSpy).not.toHaveBeenCalled();
  });

  it('shows Buscar as the search button tooltip', () => {
    const tooltip = fixture.debugElement
      .queryAll(By.directive(Tooltip))
      .find((element) => element.injector.get(Tooltip).content === 'Buscar');

    expect(tooltip).toBeTruthy();
    expect(tooltip.injector.get(Tooltip).content).toBe('Buscar');
  });
});
