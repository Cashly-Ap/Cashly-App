import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListActionButtonsComponent } from '@shared/components/list/list-action-buttons/list-action-buttons.component';

describe('ListActionButtonsComponent', () => {
  let component: ListActionButtonsComponent;
  let fixture: ComponentFixture<ListActionButtonsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListActionButtonsComponent],
    });

    fixture = TestBed.createComponent(ListActionButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show all buttons by default', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('p-button');
    expect(buttons.length).toBe(3);
  });

  it('should hide view button when showView is false', () => {
    fixture.componentRef.setInput('showView', false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('p-button');
    expect(buttons.length).toBe(2);
  });

  it('should emit view event when called', () => {
    const viewSpy = vi.fn();
    component.view.subscribe(viewSpy);

    component.view.emit();

    expect(viewSpy).toHaveBeenCalled();
  });

  it('should have correct button container styles', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('div');
    expect(container?.classList.contains('flex')).toBe(true);
    expect(container?.classList.contains('gap-2')).toBe(true);
  });
});
