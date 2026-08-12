import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { SectionHeaderComponent } from './section-header.component';
import { Component } from '@angular/core';

@Component({
  template: ` <app-section-header [title]="'Test Header'"> </app-section-header> `,
  imports: [SectionHeaderComponent],
})
class TestHostComponent {}

@Component({
  template: `
    <app-section-header [title]="'Header with Icon'" [icon]="'pi-user'"> </app-section-header>
  `,
  imports: [SectionHeaderComponent],
})
class TestHostWithIconComponent {}

@Component({
  template: `
    <app-section-header
      [title]="'Header with Button'"
      [buttonLabel]="'Add'"
      [buttonIcon]="'pi-plus'"
      (buttonClick)="onButtonClick()"
    >
    </app-section-header>
  `,
  imports: [SectionHeaderComponent],
})
class TestHostWithButtonComponent {
  buttonClicked = false;
  onButtonClick() {
    this.buttonClicked = true;
  }
}

@Component({
  template: `
    <app-section-header
      [title]="'Header with Disabled Button'"
      [buttonLabel]="'Add'"
      [buttonIcon]="'pi-plus'"
      [buttonDisabled]="true"
      (buttonClick)="onButtonClick()"
    >
    </app-section-header>
  `,
  imports: [SectionHeaderComponent],
})
class TestHostWithDisabledButtonComponent {
  buttonClicked = false;
  onButtonClick() {
    this.buttonClicked = true;
  }
}

describe('SectionHeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHeaderComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    const component = hostFixture.debugElement.children[0].componentInstance;
    expect(component).toBeTruthy();
  });

  it('should have title as required input', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    const component = hostFixture.debugElement.children[0].componentInstance;
    expect(component.title).toBeDefined();
  });

  it('should render title text', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    const titleElement = hostFixture.nativeElement.querySelector('h3');
    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent.trim()).toContain('Test Header');
  });

  it('should not render icon by default', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    const iconElement = hostFixture.nativeElement.querySelector('i');
    expect(iconElement).toBeNull();
  });

  it('should render icon when provided', () => {
    const hostFixture = TestBed.createComponent(TestHostWithIconComponent);
    hostFixture.detectChanges();
    const iconElement = hostFixture.nativeElement.querySelector('i');
    expect(iconElement).toBeTruthy();
    expect(iconElement.className).toContain('pi');
    expect(iconElement.className).toContain('pi-user');
  });

  it('should not render button by default', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    const buttonElement = hostFixture.nativeElement.querySelector('p-button');
    expect(buttonElement).toBeNull();
  });

  it('should render button when buttonLabel is provided', () => {
    const hostFixture = TestBed.createComponent(TestHostWithButtonComponent);
    hostFixture.detectChanges();
    const buttonElement = hostFixture.nativeElement.querySelector('p-button');
    expect(buttonElement).toBeTruthy();
  });

  it('should emit buttonClick event when button is clicked', () => {
    const hostFixture = TestBed.createComponent(TestHostWithButtonComponent);
    const hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();

    const buttonElement = hostFixture.nativeElement.querySelector('button');
    buttonElement.click();
    hostFixture.detectChanges();

    expect(hostComponent.buttonClicked).toBe(true);
  });

  it('should accept buttonIcon input', () => {
    const hostFixture = TestBed.createComponent(TestHostWithButtonComponent);
    hostFixture.detectChanges();
    const component = hostFixture.debugElement.children[0].componentInstance;
    expect(component.buttonIcon()).toBe('pi-plus');
  });

  it('should have flex container with correct classes', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    const containerDiv = hostFixture.nativeElement.querySelector('div');
    expect(containerDiv.className).toContain('flex');
    expect(containerDiv.className).toContain('items-center');
    expect(containerDiv.className).toContain('justify-between');
  });

  it('should default buttonDisabled to false', () => {
    const hostFixture = TestBed.createComponent(TestHostWithButtonComponent);
    hostFixture.detectChanges();
    const component = hostFixture.debugElement.children[0].componentInstance;
    expect(component.buttonDisabled()).toBe(false);
  });

  it('should accept buttonDisabled input', () => {
    const hostFixture = TestBed.createComponent(TestHostWithDisabledButtonComponent);
    hostFixture.detectChanges();
    const component = hostFixture.debugElement.children[0].componentInstance;
    expect(component.buttonDisabled()).toBe(true);
  });
});
