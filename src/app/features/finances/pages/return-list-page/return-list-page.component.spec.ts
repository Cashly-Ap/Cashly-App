import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReturnListPageComponent } from './return-list-page.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfirmationService, MessageService } from 'primeng/api';

describe('ReturnListPageComponent', () => {
  let component: ReturnListPageComponent;
  let fixture: ComponentFixture<ReturnListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnListPageComponent, RouterTestingModule],
      providers: [ConfirmationService, MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(ReturnListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.searchTerm()).toBe('');
    expect(component.first()).toBe(0);
    expect(component.rows()).toBe(10);
    expect(component.selectedReturnType()).toBe('');
  });

  it('should have return type options', () => {
    expect(component.returnTypeOptions.length).toBeGreaterThan(0);
  });

  it('should calculate active filter count', () => {
    expect(component.activeFilterCount()).toBe(0);
    component.selectedReturnType.set('MANUAL');
    expect(component.activeFilterCount()).toBe(1);
  });

  it('should clear filters', () => {
    component.selectedReturnType.set('MANUAL');
    component.filterDateFrom.set(new Date());
    component.clearFilters();
    expect(component.selectedReturnType()).toBe('');
    expect(component.filterDateFrom()).toBeNull();
  });

  it('should get return type label', () => {
    expect(component.getReturnTypeLabel('MANUAL')).toBe('Manual');
    expect(component.getReturnTypeLabel('AUTOMATIC')).toBe('Automática');
  });

  it('should check if can cancel', () => {
    expect(component.canCancel('PENDING')).toBe(true);
    expect(component.canCancel('CANCELLED')).toBe(false);
    expect(component.canCancel('COMPLETED')).toBe(false);
  });
});
