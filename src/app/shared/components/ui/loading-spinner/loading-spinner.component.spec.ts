import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
    });

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render spinner icon', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const spinner = compiled.querySelector('.pi-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should have spin animation class', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const spinner = compiled.querySelector('.pi-spin');
    expect(spinner).toBeTruthy();
  });

  it('should render loading container with backdrop', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.backdrop-blur-sm');
    expect(container).toBeTruthy();
  });
});
