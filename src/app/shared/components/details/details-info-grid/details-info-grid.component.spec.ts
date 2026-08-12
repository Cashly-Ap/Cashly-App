import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { DetailsInfoGridComponent } from '@shared/components/details/details-info-grid/details-info-grid.component';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [DetailsInfoGridComponent],
  template: `
    <app-details-info-grid>
      <div class="test-item-1">Item 1</div>
      <div class="test-item-2">Item 2</div>
    </app-details-info-grid>
  `,
})
class TestHostComponent {}

describe('DetailsInfoGridComponent', () => {
  let component: DetailsInfoGridComponent;
  let fixture: ComponentFixture<DetailsInfoGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DetailsInfoGridComponent],
    });

    fixture = TestBed.createComponent(DetailsInfoGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have responsive grid classes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const grid = compiled.querySelector('.grid');
    expect(grid).toBeTruthy();
    expect(grid?.classList.contains('grid-cols-1')).toBe(true);
    expect(grid?.classList.contains('sm:grid-cols-2')).toBe(true);
    expect(grid?.classList.contains('lg:grid-cols-3')).toBe(true);
  });

  it('should project content', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();

    const compiled = hostFixture.nativeElement as HTMLElement;
    const item1 = compiled.querySelector('.test-item-1');
    const item2 = compiled.querySelector('.test-item-2');

    expect(item1).toBeTruthy();
    expect(item2).toBeTruthy();
  });
});
