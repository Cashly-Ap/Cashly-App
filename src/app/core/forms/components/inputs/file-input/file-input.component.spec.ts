import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FileInputComponent } from '@core/forms/components/inputs/file-input/file-input.component';
import { FileSelectEvent } from 'primeng/fileupload';

describe('FileInputComponent', () => {
  let component: FileInputComponent;
  let fixture: ComponentFixture<FileInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileInputComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FileInputComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('control', new FormControl<File | null>(null));
    fixture.componentRef.setInput('label', 'Test File');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct default values', () => {
    expect(component.accept()).toBe('image/*');
    expect(component.maxFileSize()).toBe(5000000);
    expect(component.errorMessage()).toBe('');
    expect(component.helpText()).toBe('');
    expect(component.previewUrl()).toBeNull();
  });

  it('should update control value when file is selected', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent: FileSelectEvent = {
      files: [mockFile],
      originalEvent: new Event('select'),
      currentFiles: [mockFile],
    };

    component.onSelect(mockEvent);

    expect(component.control().value).toBe(mockFile);
    expect(component.selectedFile()).toBe(mockFile);
  });

  it('should emit fileSelected when file is selected', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent: FileSelectEvent = {
      files: [mockFile],
      originalEvent: new Event('select'),
      currentFiles: [mockFile],
    };

    let emittedFile: File | undefined;
    component.fileSelected.subscribe((file) => {
      emittedFile = file;
    });

    component.onSelect(mockEvent);

    expect(emittedFile).toBe(mockFile);
  });

  it('should clear file when onClear is called', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent: FileSelectEvent = {
      files: [mockFile],
      originalEvent: new Event('select'),
      currentFiles: [mockFile],
    };

    component.onSelect(mockEvent);
    expect(component.control().value).toBe(mockFile);

    component.onClear();

    expect(component.control().value).toBeNull();
    expect(component.selectedFile()).toBeNull();
  });

  it('should emit fileRemoved when file is cleared', () => {
    let emitted = false;
    component.fileRemoved.subscribe(() => {
      emitted = true;
    });

    component.onClear();

    expect(emitted).toBe(true);
  });

  it('should mark control as touched when file is selected', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent: FileSelectEvent = {
      files: [mockFile],
      originalEvent: new Event('select'),
      currentFiles: [mockFile],
    };

    expect(component.control().touched).toBe(false);

    component.onSelect(mockEvent);

    expect(component.control().touched).toBe(true);
  });

  it('should use previewUrl when no file is selected', () => {
    fixture.componentRef.setInput('previewUrl', 'https://example.com/image.jpg');
    fixture.detectChanges();

    expect(component.previewImageUrl()).toBe('https://example.com/image.jpg');
  });

  it('clears the selected preview when the parent resets a saved file', () => {
    const file = new File(['photo'], 'avatar.png', { type: 'image/png' });
    component.onSelect({ files: [file], currentFiles: [file], originalEvent: new Event('select') });
    component.control().reset();
    expect(component.selectedFile()).toBeNull();
    expect(component.previewImageUrl()).toBeNull();
  });

  it('should generate object URL for selected file', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent: FileSelectEvent = {
      files: [mockFile],
      originalEvent: new Event('select'),
      currentFiles: [mockFile],
    };

    component.onSelect(mockEvent);

    expect(component.previewImageUrl()).toContain('blob:');
  });
  afterEach(() => vi.unstubAllGlobals());

  it('optimizes large images with bounded dimensions and preserves PNG transparency', async () => {
    fixture.componentRef.setInput('optimizeImage', true);
    const close = vi.fn();
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue({ width: 6000, height: 3000, close }),
    );
    const draw = vi.fn();
    const context = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({ drawImage: draw } as unknown as CanvasRenderingContext2D);
    const encode = vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (
      this: HTMLCanvasElement,
      callback,
      type,
    ) {
      expect(this.width).toBe(2048);
      expect(this.height).toBe(1024);
      expect(type).toBe('image/png');
      callback(new Blob(['optimized'], { type: 'image/png' }));
    });
    const file = new File([new Uint8Array(6000000)], 'large.png', { type: 'image/png' });
    component.onSelect({ files: [file], currentFiles: [file], originalEvent: new Event('select') });
    expect(component.optimizing()).toBe(true);
    await vi.waitFor(() => expect(component.optimizing()).toBe(false));
    expect(component.control().value?.size).toBeLessThan(file.size);
    expect(component.control().value?.type).toBe('image/png');
    expect(close).toHaveBeenCalled();
    context.mockRestore();
    encode.mockRestore();
  });

  it('shows an image error and cancels pending optimization on reset', async () => {
    fixture.componentRef.setInput('optimizeImage', true);
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('corrupt')));
    const file = new File(['bad'], 'bad.png', { type: 'image/png' });
    component.onSelect({ files: [file], currentFiles: [file], originalEvent: new Event('select') });
    await vi.waitFor(() => expect(component.imageError()).toContain('PNG o JPG válido'));
    expect(component.control().value).toBeNull();
    let reject!: (error: Error) => void;
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockReturnValue(new Promise((_resolve, rejectPromise) => (reject = rejectPromise))),
    );
    component.onSelect({ files: [file], currentFiles: [file], originalEvent: new Event('select') });
    component.onClear();
    reject(new Error('late failure'));
    await Promise.resolve();
    await Promise.resolve();
    expect(component.optimizing()).toBe(false);
    expect(component.imageError()).toBeNull();
    expect(component.control().value).toBeNull();
  });
  it('does not restore files or previews after a newer selection, reset or destruction', async () => {
    fixture.componentRef.setInput('optimizeImage', true);
    const pending: Array<(bitmap: ImageBitmap) => void> = [];
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockImplementation(() => new Promise((resolve) => pending.push(resolve))),
    );
    const context = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
    const encode = vi
      .spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation((callback) => callback(new Blob(['image'], { type: 'image/png' })));
    const bitmap = { width: 10, height: 5, close: vi.fn() } as unknown as ImageBitmap;
    const a = new File(['a'], 'a.png', { type: 'image/png' });
    const b = new File(['b'], 'b.png', { type: 'image/png' });
    const select = (file: File) =>
      component.onSelect({
        files: [file],
        currentFiles: [file],
        originalEvent: new Event('select'),
      });
    select(a);
    select(b);
    pending[1](bitmap);
    await vi.waitFor(() => expect(component.control().value?.name).toBe('b.png'));
    pending[0](bitmap);
    await Promise.resolve();
    await Promise.resolve();
    expect(component.control().value?.name).toBe('b.png');
    select(a);
    component.control().reset();
    pending[2](bitmap);
    await vi.waitFor(() => expect(bitmap.close).toHaveBeenCalledTimes(3));
    expect(component.control().value).toBeNull();
    expect(component.previewImageUrl()).toBeNull();
    select(b);
    fixture.destroy();
    const create = vi.spyOn(URL, 'createObjectURL');
    pending[3](bitmap);
    await vi.waitFor(() => expect(bitmap.close).toHaveBeenCalledTimes(4));
    expect(create).not.toHaveBeenCalled();
    create.mockRestore();
    context.mockRestore();
    encode.mockRestore();
  });
});
