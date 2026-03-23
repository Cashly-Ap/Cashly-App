import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService } from './theme.service';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let themeServiceMock: any;

  beforeEach(async () => {
    themeServiceMock = {
      isDarkMode: signal(false),
      toggleTheme: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
      providers: [{ provide: ThemeService, useValue: themeServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have theme service injected', () => {
    expect(component['themeService']).toBeDefined();
    expect(component['themeService']).toBe(themeServiceMock);
  });

  it('should access isDarkMode from theme service', () => {
    expect(component['themeService'].isDarkMode()).toBe(false);

    themeServiceMock.isDarkMode.set(true);
    expect(component['themeService'].isDarkMode()).toBe(true);
  });

  it('should render theme toggle button', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
  });

  it('should call toggleTheme when button is clicked', () => {
    const button = fixture.nativeElement.querySelector('button');
    button?.click();

    expect(themeServiceMock.toggleTheme).toHaveBeenCalled();
  });
});
