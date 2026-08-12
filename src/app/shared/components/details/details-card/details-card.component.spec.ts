import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { DetailsCardComponent } from './details-card.component';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [DetailsCardComponent],
  template: `<app-details-card><div class="test-content">Test Content</div></app-details-card>`,
})
class TestHostComponent {}

describe('DetailsCardComponent', () => {
  let component: DetailsCardComponent;
  let fixture: ComponentFixture<DetailsCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DetailsCardComponent],
    });

    fixture = TestBed.createComponent(DetailsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render card with backdrop styling', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('.backdrop-blur-sm');
    expect(card).toBeTruthy();
  });

  it('should project content', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();

    const compiled = hostFixture.nativeElement as HTMLElement;
    const content = compiled.querySelector('.test-content');
    expect(content).toBeTruthy();
    expect(content?.textContent).toBe('Test Content');
  });
});
