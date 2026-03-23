import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageViewerDialogComponent } from './image-viewer-dialog.component';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileDownloadHelper } from '@shared/utils/file-download.helper';

describe('ImageViewerDialogComponent', () => {
  let component: ImageViewerDialogComponent;
  let fixture: ComponentFixture<ImageViewerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageViewerDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageViewerDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    fixture.componentRef.setInput('visible', false);
    fixture.componentRef.setInput('imageUrl', null);
    fixture.detectChanges();

    expect(component.title()).toBe('Visualizar Imagen');
    expect(component.downloadable()).toBe(true);
    expect(component.zoomLevel()).toBe(1);
  });

  it('should display image when url is provided', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('imageUrl', 'test.jpg');
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img');
    expect(img).toBeTruthy();
    expect(img.src).toContain('test.jpg');
  });

  it('should show empty state when no image url', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('imageUrl', null);
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('.pi-image');
    expect(emptyState).toBeTruthy();
  });

  it('should emit visibleChange when closing', () => {
    let emittedValue: boolean | undefined;
    
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('imageUrl', 'test.jpg');
    component.visibleChange.subscribe((value) => {
      emittedValue = value;
    });

    component.onHide();

    expect(emittedValue).toBe(false);
  });

  it('should handle custom title', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('imageUrl', 'test.jpg');
    fixture.componentRef.setInput('title', 'Justificante de Pago');
    fixture.detectChanges();

    expect(component.title()).toBe('Justificante de Pago');
  });

  it('should handle image load event', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('imageUrl', 'test.jpg');
    fixture.detectChanges();

    component.onImageLoad();

    expect(component.isImageLoaded()).toBe(true);
    expect(component.isImageError()).toBe(false);
  });

  it('should handle image error event', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('imageUrl', 'invalid.jpg');
    fixture.detectChanges();

    component.onImageError();

    expect(component.isImageError()).toBe(true);
    expect(component.isImageLoaded()).toBe(false);
  });

  it('should call FileDownloadHelper when downloading', async () => {
    const downloadSpy = vi.spyOn(FileDownloadHelper, 'downloadImage').mockResolvedValue();

    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('imageUrl', 'test.jpg');
    fixture.componentRef.setInput('downloadFilename', 'mi-imagen.jpg');
    fixture.detectChanges();

    await component.onDownload();

    expect(downloadSpy).toHaveBeenCalledWith('test.jpg', 'mi-imagen.jpg');
  });

  it('should zoom in correctly', () => {
    component.zoomIn();
    expect(component.zoomLevel()).toBe(1.25);

    component.zoomIn();
    expect(component.zoomLevel()).toBe(1.5);
  });

  it('should zoom out correctly', () => {
    component.zoomOut();
    expect(component.zoomLevel()).toBe(0.75);

    component.zoomOut();
    expect(component.zoomLevel()).toBe(0.5);
  });

  it('should not zoom in beyond max level', () => {
    component.zoomLevel.set(3);
    component.zoomIn();
    expect(component.zoomLevel()).toBe(3);
  });

  it('should not zoom out below min level', () => {
    component.zoomLevel.set(0.5);
    component.zoomOut();
    expect(component.zoomLevel()).toBe(0.5);
  });

  it('should reset zoom to 1', () => {
    component.zoomLevel.set(2);
    component.resetZoom();
    expect(component.zoomLevel()).toBe(1);
  });

  it('should reset zoom when closing dialog', () => {
    component.zoomLevel.set(2.5);
    component.onHide();
    expect(component.zoomLevel()).toBe(1);
  });

  it('should generate correct zoom style', () => {
    component.zoomLevel.set(1.5);
    const style = component.zoomStyle;

    expect(style.transform).toBe('scale(1.5)');
    expect(style.transition).toBe('transform 0.2s ease-in-out');
  });

  it('should handle downloadable false', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('imageUrl', 'test.jpg');
    fixture.componentRef.setInput('downloadable', false);
    fixture.detectChanges();

    expect(component.downloadable()).toBe(false);
  });
});
