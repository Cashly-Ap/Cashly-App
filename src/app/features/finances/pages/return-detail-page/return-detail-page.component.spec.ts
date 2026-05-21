import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReturnDetailPageComponent } from './return-detail-page.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { FinanceApplicationService } from '@features/finances/services/application/finance-application.service';

describe('ReturnDetailPageComponent', () => {
  let component: ReturnDetailPageComponent;
  let fixture: ComponentFixture<ReturnDetailPageComponent>;

  const mockFinanceService = {
    loading: { subscribe: () => ({}) },
    loadReturnById: jasmine.createSpy('loadReturnById').and.returnValue(of({
      id: '1',
      returnNumber: 'RET-001',
      invoiceId: 'inv-1',
      invoiceNumber: 'INV-001',
      customerId: 'cust-1',
      customerName: 'Test Customer',
      customerRif: 'J-12345678-9',
      returnType: 'MANUAL',
      reason: 'Test reason',
      status: 'PENDING',
      totalAmount: 100,
      createdBy: 'user-1',
      createdByName: 'Test User',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      lines: [],
    })),
    cancelReturn: jasmine.createSpy('cancelReturn'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnDetailPageComponent, RouterTestingModule],
      providers: [
        ConfirmationService,
        MessageService,
        { provide: FinanceApplicationService, useValue: mockFinanceService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReturnDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load return data on init', () => {
    expect(mockFinanceService.loadReturnById).toHaveBeenCalledWith('1');
  });

  it('should get return type label', () => {
    expect(component.getReturnTypeLabel('MANUAL')).toBe('Manual');
    expect(component.getReturnTypeLabel('AUTOMATIC')).toBe('Automática');
  });

  it('should get status label', () => {
    expect(component.getStatusLabel('PENDING')).toBe('Pendiente');
    expect(component.getStatusLabel('COMPLETED')).toBe('Completada');
    expect(component.getStatusLabel('CANCELLED')).toBe('Cancelada');
  });

  it('should check if can cancel', () => {
    expect(component.canCancel('PENDING')).toBe(true);
    expect(component.canCancel('CANCELLED')).toBe(false);
    expect(component.canCancel('COMPLETED')).toBe(false);
  });
});
