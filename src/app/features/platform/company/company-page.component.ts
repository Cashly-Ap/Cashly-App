import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PdfViewerModalComponent } from '@shared/components/pdf-viewer-modal';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { switchMap, of, finalize, Subscription } from 'rxjs';
import {
  FormContainerComponent,
  FormHeaderComponent,
  FormCardComponent,
  FormActionsComponent,
  TextInputComponent,
  TabContentComponent,
  FileInputComponent,
  CountryInputComponent,
} from '@core/forms/components';
import { CompanyService } from './company.service';
@Component({
  selector: 'app-company-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    TabsModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
    TextInputComponent,
    TabContentComponent,
    FileInputComponent,
    CountryInputComponent,
    PdfViewerModalComponent,
  ],
  templateUrl: './company-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyPageComponent {
  readonly service = inject(CompanyService);
  private readonly messages = inject(MessageService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);
  private previewRequest?: Subscription;
  private previewBlobUrl: string | null = null;
  readonly previewVisible = signal(false);
  readonly previewLoading = signal(false);
  readonly previewUrl = signal<SafeResourceUrl | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal(false);
  readonly removeLogo = signal(false);
  readonly logoOptimizing = signal(false);
  readonly pdfLogoOptimizing = signal(false);
  readonly removePdfLogo = signal(false);
  readonly pdfPhoto = new FormControl<File | null>(null);
  readonly photo = new FormControl<File | null>(null);
  readonly fields = [
    { key: 'legalName', label: 'Razón social' },
    { key: 'tradeName', label: 'Nombre comercial' },
    { key: 'taxId', label: 'NIF / CIF' },
    { key: 'email', label: 'Correo electrónico' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'website', label: 'Sitio web' },
  ];
  readonly addressFields = [
    { key: 'street', label: 'Calle y número' },
    { key: 'city', label: 'Ciudad' },
    { key: 'region', label: 'Provincia o región' },
    { key: 'country', label: 'País' },
    { key: 'postalCode', label: 'Código postal' },
  ];
  readonly form = new FormGroup({
    legalName: new FormControl('', [
      Validators.required,
      Validators.pattern(/\S/),
      Validators.maxLength(200),
    ]),
    tradeName: new FormControl('', Validators.maxLength(200)),
    taxId: new FormControl('', Validators.maxLength(50)),
    email: new FormControl('', [Validators.email, Validators.maxLength(254)]),
    phone: new FormControl('', Validators.maxLength(30)),
    website: new FormControl('', Validators.maxLength(255)),
    street: new FormControl('', Validators.maxLength(200)),
    city: new FormControl('', Validators.maxLength(100)),
    region: new FormControl('', Validators.maxLength(100)),
    country: new FormControl('', Validators.maxLength(100)),
    postalCode: new FormControl('', Validators.maxLength(20)),
  });
  constructor() {
    this.load();
    this.destroyRef.onDestroy(() => this.closePreview());
  }
  control(key: string): FormControl {
    return this.form.get(key) as FormControl;
  }
  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.service
      .load()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (company) => {
          this.form.patchValue({ ...company, ...company.address });
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set(true);
        },
      });
  }
  save(): void {
    if (this.saving() || this.logoOptimizing() || this.pdfLogoOptimizing() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const clean = (value: string | null) => value?.trim() || null;
    this.saving.set(true);
    this.service
      .update({
        legalName: v.legalName!.trim(),
        tradeName: clean(v.tradeName),
        taxId: clean(v.taxId),
        email: clean(v.email),
        phone: clean(v.phone),
        website: clean(v.website),
        address: {
          street: clean(v.street),
          city: clean(v.city),
          region: clean(v.region),
          country: clean(v.country),
          postalCode: clean(v.postalCode),
        },
      })
      .pipe(
        switchMap((company) =>
          this.photo.value
            ? this.service.upload(this.photo.value)
            : this.removeLogo()
              ? this.service.removeLogo()
              : of(company),
        ),
        switchMap((company) =>
          this.pdfPhoto.value
            ? this.service.uploadPdfLogo(this.pdfPhoto.value)
            : this.removePdfLogo()
              ? this.service.removePdfLogo()
              : of(company),
        ),
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.photo.reset();
          this.pdfPhoto.reset();
          this.removePdfLogo.set(false);
          this.removeLogo.set(false);
          void this.router.navigate(['/platform/company']);
          this.messages.add({
            severity: 'success',
            summary: 'Empresa actualizada',
            detail: 'La información y los logotipos se han guardado.',
          });
        },
        error: () =>
          this.messages.add({
            severity: 'error',
            summary: 'No se pudo completar el guardado',
            detail:
              'Revisa los datos. Si la información ya se guardó, puedes reintentar la imagen.',
          }),
      });
  }
  previewPdf(): void {
    if (this.previewLoading() || this.saving() || this.logoOptimizing() || this.pdfLogoOptimizing())
      return;
    this.closePreview();
    this.previewVisible.set(true);
    this.previewLoading.set(true);
    this.previewRequest = this.service
      .previewPdfLogo({
        file: this.pdfPhoto.value,
        companyLogo: this.photo.value,
        removePdfLogo: this.removePdfLogo(),
        removeLogo: this.removeLogo(),
      })
      .pipe(
        finalize(() => this.previewLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (blob) => {
          this.previewBlobUrl = URL.createObjectURL(blob);
          this.previewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.previewBlobUrl));
        },
        error: (error: HttpErrorResponse) => {
          this.closePreview();
          this.messages.add({
            severity: 'error',
            summary: 'No se pudo generar la vista previa',
            detail:
              error.status === 400
                ? 'Usa una imagen PNG o JPG válida. Los cambios no se han guardado.'
                : 'Revisa las imágenes y vuelve a intentarlo. Los cambios no se han guardado.',
          });
        },
      });
  }
  closePreview(): void {
    this.previewRequest?.unsubscribe();
    this.previewRequest = undefined;
    this.previewVisible.set(false);
    this.previewLoading.set(false);
    this.previewUrl.set(null);
    if (this.previewBlobUrl) URL.revokeObjectURL(this.previewBlobUrl);
    this.previewBlobUrl = null;
  }
  cancel(): void {
    void this.router.navigate(['/platform/company']);
  }
}
