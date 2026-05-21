import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CreditStatusPageComponent } from './credit-status-page.component';
import { FinanceApplicationService } from '../../services/application/finance-application.service';
import { CreditApiService } from '../../services/api/credit-api.service';

describe('CreditStatusPageComponent', () => {
  let component: CreditStatusPageComponent;
  let fixture: ComponentFixture<CreditStatusPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditStatusPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        FinanceApplicationService,
        CreditApiService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreditStatusPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty customer balances', () => {
    expect(component.customerBalances().length).toBe(0);
  });

  it('should show initial loading when loadingCredit is true and no status', () => {
    component.loadingCredit.set(true);
    fixture.detectChanges();
    expect(component.showInitialLoading()).toBe(true);
  });
});
