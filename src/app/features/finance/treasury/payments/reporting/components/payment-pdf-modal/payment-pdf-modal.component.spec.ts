import { provideRouter } from '@angular/router';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PaymentPdfModalComponent } from '@features/finance/treasury/payments/reporting/components/payment-pdf-modal/payment-pdf-modal.component';
import { MessageService } from 'primeng/api';

@Component({
  template: `<app-payment-pdf-modal
    [visible]="visible"
    [paymentId]="paymentId"
    (visibleChange)="onVisibleChange($event)"
  ></app-payment-pdf-modal>`,
  imports: [PaymentPdfModalComponent],
})
class HostComponent {
  visible = false;
  paymentId: string | null = null;
  onVisibleChange = vi.fn();
}

function setup(overrides: { visible?: boolean; paymentId?: string | null } = {}) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [HostComponent],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [
      provideRouter([]),
      { provide: AuthorizationService, useValue: { can: () => true } },
      provideHttpClient(),
      provideHttpClientTesting(),
      MessageService,
    ],
  });
  TestBed.compileComponents();

  const fixture = TestBed.createComponent(HostComponent);
  const hostComponent = fixture.componentInstance;
  const httpTesting = TestBed.inject(HttpTestingController);

  hostComponent.visible = overrides.visible ?? false;
  hostComponent.paymentId = overrides.paymentId ?? null;
  fixture.detectChanges();

  const component = fixture.debugElement.children[0].componentInstance;

  return { fixture, hostComponent, component, httpTesting };
}

describe('PaymentPdfModalComponent', () => {
  let hostComponent: HostComponent;
  let component: PaymentPdfModalComponent;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    const result = setup();
    hostComponent = result.hostComponent;
    component = result.component;
    httpTesting = result.httpTesting;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default visible input as false', () => {
    expect(component.visible()).toBe(false);
  });

  it('should have default paymentId input as null', () => {
    expect(component.paymentId()).toBeNull();
  });

  it('should have default loading signal as false', () => {
    expect(component.loading()).toBe(false);
  });

  it('should have default pdfUrl signal as null', () => {
    expect(component.pdfUrl()).toBeNull();
  });

  it('should emit visibleChange with false on onHide', () => {
    component.onHide();
    expect(hostComponent.onVisibleChange).toHaveBeenCalledWith(false);
  });

  it('should reset pdfUrl on onHide', () => {
    component.pdfUrl.set('blob:http://test');
    component.onHide();
    expect(component.pdfUrl()).toBeNull();
  });
});

describe('PaymentPdfModalComponent - generatePdf', () => {
  let hostComponent: HostComponent;
  let component: PaymentPdfModalComponent;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    const result = setup({ visible: true, paymentId: 'pay-001' });
    hostComponent = result.hostComponent;
    component = result.component;
    httpTesting = result.httpTesting;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should call API and set pdfUrl on success', () => {
    const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });

    component.generatePdf();

    const req = httpTesting.expectOne('/api/reports/finance/payments/pay-001/pdf');
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);

    expect(component.loading()).toBe(false);
    expect(component.pdfUrl()).toBeTruthy();
  });

  it('should set loading to true while fetching', () => {
    component.generatePdf();
    expect(component.loading()).toBe(true);
    const req = httpTesting.expectOne('/api/reports/finance/payments/pay-001/pdf');
    req.flush(new Blob());
  });
});

describe('PaymentPdfModalComponent - generatePdf without paymentId', () => {
  let component: PaymentPdfModalComponent;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    const result = setup({ visible: true, paymentId: null });
    component = result.component;
    httpTesting = result.httpTesting;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should not call API when paymentId is null', () => {
    component.generatePdf();
    expect(component.loading()).toBe(false);
  });
});
