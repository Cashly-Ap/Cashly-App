import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { TabContentComponent } from '@core/forms/components/cards/tab-content/tab-content.component';
import { Component } from '@angular/core';

@Component({
  template: `
    <app-tab-content>
      <div class="test-content">Test Content</div>
    </app-tab-content>
  `,
  imports: [TabContentComponent],
})
class TestHostComponent {}

@Component({
  template: `
    <app-tab-content [columns]="3" [gap]="'gap-4'" [padding]="'p-8'">
      <div class="custom-content">Custom Content</div>
    </app-tab-content>
  `,
  imports: [TabContentComponent],
})
class TestHostWithCustomPropsComponent {}

describe('TabContentComponent', () => {
  let component: TabContentComponent;
  let fixture: ComponentFixture<TabContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TabContentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default columns of 2', () => {
    expect(component.columns()).toBe(2);
  });

  it('should have default gap of "gap-6"', () => {
    expect(component.gap()).toBe('gap-6');
  });

  it('should have default padding of "p-6"', () => {
    expect(component.padding()).toBe('p-6');
  });

  it('should accept custom value for columns', () => {
    const hostFixture = TestBed.createComponent(TestHostWithCustomPropsComponent);
    hostFixture.detectChanges();
    const wrapperElement = hostFixture.nativeElement.querySelector('app-tab-content');
    expect(wrapperElement).toBeTruthy();
  });

  it('should project content correctly', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    const contentElement = hostFixture.nativeElement.querySelector('.test-content');
    expect(contentElement).toBeTruthy();
    expect(contentElement.textContent).toBe('Test Content');
  });

  it('should compute grid classes correctly with default values', () => {
    fixture.detectChanges();
    const expectedClasses = 'p-6 grid grid-cols-1 md:grid-cols-2 gap-6';
    expect(component.gridClasses()).toBe(expectedClasses);
  });

  it('should compute grid classes correctly with custom values', () => {
    fixture.componentRef.setInput('columns', 3);
    fixture.componentRef.setInput('gap', 'gap-4');
    fixture.componentRef.setInput('padding', 'p-8');
    fixture.detectChanges();
    const expectedClasses = 'p-8 grid grid-cols-1 md:grid-cols-3 gap-4';
    expect(component.gridClasses()).toBe(expectedClasses);
  });

  it('should apply grid classes to wrapper div', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    const wrapperDiv = hostFixture.nativeElement.querySelector('div');
    expect(wrapperDiv.className).toContain('p-6');
    expect(wrapperDiv.className).toContain('grid');
    expect(wrapperDiv.className).toContain('grid-cols-2');
    expect(wrapperDiv.className).toContain('gap-6');
  });
});
