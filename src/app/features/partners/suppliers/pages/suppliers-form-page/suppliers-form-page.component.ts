import { TranslationService } from '@core/i18n/translation.service';
import { requiredFieldsMessage } from '@core/forms/utils/required-fields';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormArray, Validators } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import {
  FormContainerComponent,
  FormHeaderComponent,
  FormActionsComponent,
} from '@core/forms/components';
import { SupplierApplicationService } from '@features/partners/suppliers/services/application/supplier-application.service';
import { SupplierMapper } from '@features/partners/suppliers/services/mappers/supplier.mapper';
import {
  SupplierType,
  SUPPLIER_TYPES,
} from '@features/partners/suppliers/models/enums/supplier-type.enum';
import { SupplierValidators } from '@features/partners/suppliers/validators/supplier.validators';
import { SupplierGeneralSectionComponent } from '@features/partners/suppliers/components/supplier-general-section/supplier-general-section.component';
import { SupplierContactSectionComponent } from '@features/partners/suppliers/components/supplier-contact-section/supplier-contact-section.component';
import { SupplierAddressesSectionComponent } from '@features/partners/suppliers/components/supplier-addresses-section/supplier-addresses-section.component';
import { BaseFormComponent, FormConfig } from '@core/forms/base/base-form.component';

interface SupplierAddressFormData {
  address: string;
  state: string;
  municipality: string;
  postalCode: string;
  billing: boolean;
  active: boolean;
}

interface SupplierFormData {
  legalName: string;
  type: SupplierType | string;
  rif: string;
  alias: string;
  paymentType: 'CASH' | 'CREDIT';
  creditDays: number;
  creditLimit: number;
  active: boolean;
  emails: string[];
  phones: string[];
  addresses: SupplierAddressFormData[];
  notes: string;
}

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
@Component({
  selector: 'app-suppliers-form-page',
  standalone: true,
  imports: [
    PanelCardComponent,
    TranslatePipe,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TabsModule,
    ToggleSwitchModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormActionsComponent,
    SupplierGeneralSectionComponent,
    SupplierContactSectionComponent,
    SupplierAddressesSectionComponent,
  ],
  templateUrl: './suppliers-form-page.component.html',
})
export class SuppliersFormPageComponent extends BaseFormComponent<SupplierFormData> {
  private readonly translations = inject(TranslationService);
  private service = inject(SupplierApplicationService);
  private mapper = inject(SupplierMapper);
  private messageService = inject(MessageService);

  loading = this.service.loading;

  supplierTypes = [...SUPPLIER_TYPES];

  submitTooltip = signal('');

  private readonly FIELD_LABELS: Record<string, string> = {
    legalName: 'shared.fields.legalName',
    type: 'shared.fields.supplierType',
    rif: 'shared.fields.rif',
    creditDays: 'shared.fields.creditDays',
    creditLimit: 'shared.fields.creditLimit',
    emails: 'shared.fields.emails',
    phones: 'shared.fields.phones',
    addresses: 'shared.fields.addresses',
  };

  override ngOnInit(): void {
    super.ngOnInit();
    this.updateSubmitTooltip();
    this.form.statusChanges.subscribe(() => this.updateSubmitTooltip());
  }

  private updateSubmitTooltip(): void {
    const invalid = Object.entries(this.FIELD_LABELS)
      .filter(([key]) => this.form.get(key)?.invalid)
      .map(([, label]) => label);
    this.submitTooltip.set(requiredFieldsMessage(this.translations, invalid));
  }

  getConfig(): FormConfig {
    return {
      entityDisplayName: 'Proveedor',
      entityArticle: 'del',
      module: 'suppliers',
      routeBase: '/partners/suppliers',
    };
  }

  createForm(): FormGroup {
    return this.fb.group({
      legalName: ['', [Validators.required, SupplierValidators.legalName()]],
      type: [SupplierType.JURIDICO, Validators.required],
      rif: ['', [Validators.required, SupplierValidators.rif()]],
      alias: ['', [SupplierValidators.supplierAlias()]],
      paymentType: ['CASH', Validators.required],
      creditDays: [
        { value: 0, disabled: true },
        [Validators.required, Validators.min(0), Validators.max(365)],
      ],
      creditLimit: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
      active: [true],
      emails: this.fb.array([]),
      phones: this.fb.array([]),
      addresses: this.fb.array([this.createAddressGroup()], [SupplierValidators.minLengthArray(1)]),
      notes: [''],
    });
  }

  protected override getPendingTabTitle(formData: SupplierFormData): string {
    return formData.legalName?.trim() || super.getPendingTabTitle(formData);
  }

  protected override restoreFormData(data: SupplierFormData): void {
    const emailsArray = this.form.get('emails') as FormArray;
    emailsArray.clear();
    (data.emails ?? []).forEach((email) => {
      emailsArray.push(this.fb.control(email, [Validators.required, SupplierValidators.email()]));
    });

    const phonesArray = this.form.get('phones') as FormArray;
    phonesArray.clear();
    (data.phones ?? []).forEach((phone) => {
      phonesArray.push(
        this.fb.control(phone, [Validators.required, SupplierValidators.phoneNumber()]),
      );
    });

    const addressesArray = this.form.get('addresses') as FormArray;
    addressesArray.clear();
    (data.addresses ?? []).forEach((a) => {
      addressesArray.push(this.createAddressGroup(a));
    });

    this.form.patchValue({
      legalName: data.legalName,
      type: data.type,
      rif: data.rif,
      alias: data.alias,
      paymentType: data.paymentType ?? 'CASH',
      creditDays: data.creditDays ?? 0,
      creditLimit: data.creditLimit ?? 0,
      active: data.active,
      notes: data.notes ?? '',
    });
  }

  protected override onLoadEntity(id: string): void {
    this.service.loadById(id).subscribe({
      next: (supplier) => {
        const formModel = this.mapper.toFormModel(supplier);

        const emailsArray = this.form.get('emails') as FormArray;
        emailsArray.clear();
        formModel.emails.forEach((e) => {
          emailsArray.push(
            this.fb.control(e.email, [Validators.required, SupplierValidators.email()]),
          );
        });

        const phonesArray = this.form.get('phones') as FormArray;
        phonesArray.clear();
        formModel.phones.forEach((p) => {
          phonesArray.push(
            this.fb.control(p.phone, [Validators.required, SupplierValidators.phoneNumber()]),
          );
        });

        const addressesArray = this.form.get('addresses') as FormArray;
        addressesArray.clear();
        formModel.addresses.forEach((a) => {
          addressesArray.push(this.createAddressGroup(a));
        });

        this.form.patchValue({
          legalName: formModel.legalName,
          type: formModel.type,
          rif: formModel.rif,
          alias: formModel.alias,
          paymentType: (formModel.creditDays ?? 0) > 0 ? 'CREDIT' : 'CASH',
          creditDays: formModel.creditDays,
          creditLimit: formModel.creditLimit,
          active: formModel.active,
          notes: formModel.notes ?? '',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el proveedor. Es posible que no exista.',
          life: 5000,
        });
        this.router.navigate(['/partners/suppliers']);
      },
    });
  }

  override onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.getRawValue() as SupplierFormData;
      const formModel = this.mapper.toFormModel({
        id: this.entityId() ?? '',
        code: 0,
        createdAt: '',
        legalName: formValue.legalName,
        type: formValue.type as SupplierType,
        rif: formValue.rif,
        alias: formValue.alias,
        creditDays: formValue.paymentType === 'CREDIT' ? (formValue.creditDays ?? 0) : 0,
        creditLimit: formValue.paymentType === 'CREDIT' ? (formValue.creditLimit ?? 0) : 0,
        active: formValue.active,
        emails: formValue.emails.map((email) => ({ id: '', supplierId: '', email })),
        phones: formValue.phones.map((phone) => ({ id: '', supplierId: '', phone })),
        addresses: formValue.addresses.map((a) => ({ id: '', supplierId: '', ...a })),
        notes: formValue.notes || undefined,
      });

      if (this.isEditMode() && this.entityId()) {
        const updateData = this.mapper.toUpdateRequest(formModel);
        this.service.update(this.entityId()!, updateData).subscribe({
          next: () => {
            this.markAsSubmitted();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Proveedor actualizado exitosamente',
              life: 3000,
            });
            this.router.navigate(['/partners/suppliers', this.entityId()!]);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el proveedor. Por favor, intente nuevamente.',
              life: 5000,
            });
          },
        });
      } else {
        const createData = this.mapper.toCreateRequest(formModel);
        this.service.create(createData).subscribe({
          next: (created) => {
            this.markAsSubmitted();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Proveedor creado exitosamente',
              life: 3000,
            });
            this.router.navigate(['/partners/suppliers', created.id]);
          },
          error: (err: { error?: { message?: string } }) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail:
                err?.error?.message ||
                'Error al crear el proveedor. Por favor, intente nuevamente.',
              life: 5000,
            });
          },
        });
      }
    } else {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor, complete todos los campos requeridos correctamente',
        life: 5000,
      });
    }
  }

  private createEmailControl() {
    return this.fb.control('', [Validators.required, SupplierValidators.email()]);
  }

  private createPhoneControl() {
    return this.fb.control('', [Validators.required, SupplierValidators.phoneNumber()]);
  }

  private createAddressGroup(data?: Partial<SupplierAddressFormData>) {
    return this.fb.group({
      address: [data?.address ?? '', [Validators.required, SupplierValidators.address()]],
      state: [data?.state ?? ''],
      municipality: [data?.municipality ?? ''],
      postalCode: [data?.postalCode ?? ''],
      billing: [data?.billing ?? false],
      active: [data?.active ?? true],
    });
  }
}
