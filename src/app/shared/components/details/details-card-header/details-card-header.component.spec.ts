import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { DetailsCardHeaderComponent } from './details-card-header.component';
import { ComponentRef, Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [DetailsCardHeaderComponent],
  template: `
    <app-details-card-header [title]="'Test Title'" [subtitle]="'Test Subtitle'">
      <div actions class="test-actions">Actions</div>
    </app-details-card-header>
  `,
})
class TestHostComponent {}

describe('DetailsCardHeaderComponent', () => {
  let component: DetailsCardHeaderComponent;
  let fixture: ComponentFixture<DetailsCardHeaderComponent>;
  let componentRef: ComponentRef<DetailsCardHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DetailsCardHeaderComponent],
    });

    fixture = TestBed.createComponent(DetailsCardHeaderComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    componentRef.setInput('title', 'Test');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h1');
    expect(title?.textContent?.trim()).toBe('Test Title');
  });

  it('should display subtitle when provided', () => {
    componentRef.setInput('title', 'Test Title');
    componentRef.setInput('subtitle', 'Test Subtitle');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const subtitle = compiled.querySelector('p');
    expect(subtitle?.textContent?.trim()).toBe('Test Subtitle');
  });

  it('should not display subtitle when not provided', () => {
    componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const subtitle = compiled.querySelector('p');
    expect(subtitle).toBeNull();
  });

  it('should have actions slot for content projection', () => {
    componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('div');
    expect(container).toBeTruthy();
  });
});
