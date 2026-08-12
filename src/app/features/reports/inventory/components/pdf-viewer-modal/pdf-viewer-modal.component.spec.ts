import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PdfViewerModalComponent } from './pdf-viewer-modal.component';

const mockSanitizer = {
  bypassSecurityTrustResourceUrl: vi.fn((url: string) => url as SafeResourceUrl),
};

@Component({
  template: `<app-pdf-viewer-modal
    [visible]="visible"
    [pdfUrl]="pdfUrl"
    [title]="title"
    [loading]="loading"
    (visibleChange)="onVisibleChange($event)"
  ></app-pdf-viewer-modal>`,
  imports: [PdfViewerModalComponent],
})
class HostComponent {
  visible = false;
  pdfUrl: string | null = null;
  title = '';
  loading = false;
  onVisibleChange = vi.fn();
}

function setup(
  overrides: { visible?: boolean; pdfUrl?: string | null; title?: string; loading?: boolean } = {},
) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [HostComponent],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [{ provide: DomSanitizer, useValue: mockSanitizer }],
  });
  TestBed.compileComponents();

  const fixture = TestBed.createComponent(HostComponent);
  const hostComponent = fixture.componentInstance;
  hostComponent.visible = overrides.visible ?? false;
  hostComponent.pdfUrl = overrides.pdfUrl ?? null;
  hostComponent.title = overrides.title ?? '';
  hostComponent.loading = overrides.loading ?? false;
  fixture.detectChanges();
  const component = fixture.debugElement.children[0].componentInstance;

  return { fixture, hostComponent, component };
}

describe('PdfViewerModalComponent', () => {
  let hostComponent: HostComponent;
  let component: PdfViewerModalComponent;

  beforeEach(() => {
    const result = setup();
    hostComponent = result.hostComponent;
    component = result.component;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default visible input as false', () => {
    expect(component.visible()).toBe(false);
  });

  it('should have default pdfUrl input as null', () => {
    expect(component.pdfUrl()).toBeNull();
  });

  it('should have default title input as empty string', () => {
    expect(component.title()).toBe('');
  });

  it('should have default loading input as false', () => {
    expect(component.loading()).toBe(false);
  });
});

describe.skip('PdfViewerModalComponent - visible', () => {
  let hostComponent: HostComponent;
  let component: PdfViewerModalComponent;

  beforeEach(() => {
    const result = setup({
      visible: true,
      pdfUrl: 'blob:test-url',
      title: 'Test PDF',
      loading: false,
    });
    hostComponent = result.hostComponent;
    component = result.component;
  });

  it('should have visible input as true', () => {
    expect(component.visible()).toBe(true);
  });

  it('should have pdfUrl input set', () => {
    expect(component.pdfUrl()).toBe('blob:test-url');
  });

  it('should have title input set', () => {
    expect(component.title()).toBe('Test PDF');
  });

  it('should have loading input as false', () => {
    expect(component.loading()).toBe(false);
  });

  it('should emit visibleChange event', () => {
    component.visibleChange.emit(false);
    expect(hostComponent.onVisibleChange).toHaveBeenCalledWith(false);
  });
});

describe('PdfViewerModalComponent - loading states', () => {
  let component: PdfViewerModalComponent;

  it('should reflect loading as true', () => {
    const result = setup({ loading: true });
    component = result.component;
    expect(component.loading()).toBe(true);
  });

  it('should reflect loading as false', () => {
    const result = setup({ loading: false });
    component = result.component;
    expect(component.loading()).toBe(false);
  });
});
