import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  DestroyRef,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule, FileSelectEvent, FileRemoveEvent } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-file-input',
  standalone: true,
  imports: [ReactiveFormsModule, FileUploadModule, ButtonModule],
  templateUrl: './file-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileInputComponent {
  control = input.required<FormControl<File | null>>();
  label = input.required<string>();
  accept = input<string>('image/*');
  optimizeImage = input(false);
  readonly optimizing = signal(false);
  readonly imageError = signal<string | null>(null);
  readonly optimizingChange = output<boolean>();
  private selectionVersion = 0;
  maxFileSize = input<number>(5000000);
  errorMessage = input<string>('');
  helpText = input<string>('');
  previewUrl = input<string | null>(null);

  fileSelected = output<File>();
  fileRemoved = output<void>();
  deleteExistingPhoto = output<void>();

  private selectedFileSignal = signal<File | null>(null);
  selectedFile = this.selectedFileSignal.asReadonly();

  private previewLoadErrorSignal = signal<boolean>(false);

  private readonly selectedPreviewUrl = signal<string | null>(null);
  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.selectionVersion++;
      this.revokePreview();
    });
    effect((onCleanup) => {
      const subscription = this.control().valueChanges.subscribe((value) => {
        if (!value) {
          this.cancelOptimization();
          this.revokePreview();
          this.selectedFileSignal.set(null);
        }
      });
      onCleanup(() => subscription.unsubscribe());
    });
    effect(() => {
      this.previewUrl();
      this.previewLoadErrorSignal.set(false);
    });
  }

  previewImageUrl = computed<string | null>(() => {
    if (this.previewLoadErrorSignal()) {
      return null;
    }
    const file = this.selectedFileSignal();
    if (file) {
      return this.selectedPreviewUrl();
    }
    return this.previewUrl();
  });

  onSelect(event: FileSelectEvent): void {
    const file = event.files[0];
    if (!file) return;
    this.cancelOptimization();
    this.imageError.set(null);
    if (!this.optimizeImage()) {
      this.acceptFile(file);
      return;
    }
    const version = ++this.selectionVersion;
    this.optimizing.set(true);
    this.optimizingChange.emit(true);
    void this.normalizeImage(file)
      .then((normalized) => {
        if (version === this.selectionVersion) this.acceptFile(normalized);
      })
      .catch(() => {
        if (version !== this.selectionVersion) return;
        this.imageError.set('No pudimos leer la imagen. Selecciona un archivo PNG o JPG válido.');
      })
      .finally(() => {
        if (version !== this.selectionVersion) return;
        this.optimizing.set(false);
        this.optimizingChange.emit(false);
      });
  }

  private async normalizeImage(file: File): Promise<File> {
    if (!['image/png', 'image/jpeg'].includes(file.type)) throw new Error('Invalid image');
    const bitmap = await createImageBitmap(file);
    try {
      const scale = Math.min(1, 2048 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Image processing unavailable');
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (result) => (result ? resolve(result) : reject(new Error('Image encoding failed'))),
          file.type,
          file.type === 'image/jpeg' ? 0.85 : undefined,
        ),
      );
      return new File([blob], file.name, { type: blob.type, lastModified: file.lastModified });
    } finally {
      bitmap.close();
    }
  }

  private acceptFile(file: File): void {
    this.revokePreview();
    this.previewLoadErrorSignal.set(false);
    this.selectedPreviewUrl.set(URL.createObjectURL(file));
    this.selectedFileSignal.set(file);
    this.control().setValue(file);
    this.control().markAsTouched();
    this.fileSelected.emit(file);
  }

  private cancelOptimization(): void {
    this.selectionVersion++;
    this.optimizing.set(false);
    this.optimizingChange.emit(false);
  }

  onRemove(_event: FileRemoveEvent): void {
    this.clearFile();
  }

  onClear(): void {
    this.clearFile();
  }

  private revokePreview(): void {
    const url = this.selectedPreviewUrl();
    if (url) URL.revokeObjectURL(url);
    this.selectedPreviewUrl.set(null);
  }

  private clearFile(): void {
    this.cancelOptimization();
    this.imageError.set(null);
    this.revokePreview();
    this.selectedFileSignal.set(null);
    this.previewLoadErrorSignal.set(false);
    this.control().setValue(null);
    this.control().markAsTouched();
    this.fileRemoved.emit();
  }

  onPreviewError(): void {
    this.previewLoadErrorSignal.set(true);
  }

  removeCurrentImage(): void {
    const hasExistingPhoto = !!this.previewUrl() && !this.selectedFileSignal();
    this.clearFile();
    if (hasExistingPhoto) {
      this.deleteExistingPhoto.emit();
    }
  }
}
