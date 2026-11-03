import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { PanelCardComponent } from './panel-card.component';

@Component({
  standalone: true,
  imports: [PanelCardComponent],
  template: '<app-panel-card><span class="projected">Contenido</span></app-panel-card>',
})
class PanelCardHostComponent {}

describe('PanelCardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PanelCardComponent, PanelCardHostComponent] });
  });

  it('renders a plain panel by default', () => {
    const fixture = TestBed.createComponent(PanelCardComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.cashly-panel')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.cashly-panel')?.className).toBe('cashly-panel');
  });

  it('applies padding, extra classes and hidden overflow', () => {
    const fixture = TestBed.createComponent(PanelCardComponent);
    fixture.componentRef.setInput('padding', 'p-5');
    fixture.componentRef.setInput('extraClass', 'mb-6');
    fixture.componentRef.setInput('overflowHidden', true);
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('.cashly-panel') as HTMLElement;
    expect(panel.classList.contains('p-5')).toBe(true);
    expect(panel.classList.contains('mb-6')).toBe(true);
    expect(panel.classList.contains('overflow-hidden')).toBe(true);
  });

  it('renders a translated header when a title is provided', () => {
    const fixture = TestBed.createComponent(PanelCardComponent);
    fixture.componentRef.setInput('title', 'shared.filters');
    fixture.componentRef.setInput('icon', 'pi-list');
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('.cashly-panel') as HTMLElement;
    expect(panel.querySelector('h3')?.textContent?.trim().length).toBeGreaterThan(0);
    expect(panel.querySelector('i')?.className).toContain('pi-list');
  });

  it('projects content', () => {
    const fixture = TestBed.createComponent(PanelCardHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.cashly-panel .projected')?.textContent).toBe(
      'Contenido',
    );
  });
});
