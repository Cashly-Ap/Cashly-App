import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { PageHeaderComponent } from './page-header.component';
import { ComponentRef } from '@angular/core';

describe('PageHeaderComponent', () => {
  let component: PageHeaderComponent;
  let fixture: ComponentFixture<PageHeaderComponent>;
  let componentRef: ComponentRef<PageHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PageHeaderComponent],
    });

    fixture = TestBed.createComponent(PageHeaderComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
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

  it('should have centered text styling', () => {
    componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.text-center');
    expect(container).toBeTruthy();
  });
});
