import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormArray, Validators } from '@angular/forms';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import {
  FormContainerComponent,
  FormHeaderComponent,
  FormCardComponent,
  FormActionsComponent,
} from '@core/forms/components';
import { CustomerApplicationService } from '@features/customers/services/application';
import { CustomerApiService } from '@features/customers/services/api/customer-api.service';
import { CustomerMapper } from '@features/customers/services/mappers';
import { CustomerType, CUSTOMER_TYPES, PaymentType } from '@features/customers/models/enums';
import { CustomerValidators } from '@features/customers/validators';
import { CustomerWarehouseAccessItem } from '@features/customers/models/interfaces';
import { CustomerGeneralSectionComponent } from '@features/customers/components/customer-general-section/customer-general-section.component';
import { CustomerContactSectionComponent } from '@features/customers/components/customer-contact-section/customer-contact-section.component';
import { CustomerAddressesSectionComponent } from '@features/customers/components/customer-addresses-section/customer-addresses-section.component';
import { BaseFormComponent, FormConfig } from '@core/forms/base/base-form.component';
import { WarehouseApplicationService } from '@features/warehouses/services/application/warehouse-application.service';

interface CustomerAddressFormData {
  address: string;
  state: string;
  municipality: string;
  postalCode: string;
  billing: boolean;
  active: boolean;
}

interface CustomerFormData {
  legalName: string;
  type: CustomerType | string;
  rif: string;
  alias: string;
  paymentType: PaymentType | string;
  creditDays: number | null;
  creditLimit: number | null;
  active: boolean;
  portalAccess: boolean;
  emails: string[];
  phones: string[];
  addresses: CustomerAddressFormData[];
}

@Component({
  selector: 'app-customers-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MainLayoutComponent,
    TabsModule,
    ToggleSwitchModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    DialogModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
    CustomerGeneralSectionComponent,
    CustomerContactSectionComponent,
    CustomerAddressesSectionComponent,
  ],
  templateUrl: './customers-form-page.component.html',
  providers: [MessageService],
})
export class CustomersFormPageComponent extends BaseFormComponent<CustomerFormData> {
  private service = inject(CustomerApplicationService);
  private customerApi = inject(CustomerApiService);
  private warehouseService = inject(WarehouseApplicationService);
  private mapper = inject(CustomerMapper);
  private messageService = inject(MessageService);

  loading = this.service.loading;

  customerTypes = [...CUSTOMER_TYPES];

  warehouseAccess = signal<CustomerWarehouseAccessItem[]>([]);
  warehouseAccessLoading = signal(false);
  showGrantDialog = signal(false);
  selectedWarehouseId = signal<string | null>(null);
  grantLoading = signal(false);

  warehouseOptions = computed(() => {
    const assigned = new Set(this.warehouseAccess().map((w) => w.warehouseId));
    return this.warehouseService.simpleWarehouses()
      .filter((w) => !assigned.has(w.id))
      .map((w) => ({ label: w.name, value: w.id }));
  });

  getConfig(): FormConfig {
    return {
      entityDisplayName: 'Cliente',
      entityArticle: 'del',
      module: 'customers',
      routeBase: '/customers',
    };
  }

  createForm(): FormGroup {
    return this.fb.group({
      legalName: ['', [Validators.required, CustomerValidators.legalName()]],
      type: [CustomerType.BUSINESS, Validators.required],
      rif: ['', [Validators.required, CustomerValidators.rif()]],
      alias: ['', [Validators.required, CustomerValidators.customerAlias()]],
      paymentType: [PaymentType.CASH, Validators.required],
      creditDays: [{ value: null, disabled: true }, [Validators.required, Validators.min(0), Validators.max(365)]],
      creditLimit: [{ value: null, disabled: true }, [Validators.required, Validators.min(0)]],
      active: [true],
      portalAccess: [false],
      emails: this.fb.array([this.createEmailControl()]),
      phones: this.fb.array([this.createPhoneControl()]),
      addresses: this.fb.array([this.createAddressGroup()]),
    });
  }

  protected override getPendingTabTitle(formData: CustomerFormData): string {
    return formData.legalName?.trim() || super.getPendingTabTitle(formData);
  }

  protected override restoreFormData(data: CustomerFormData): void {
    const emailsArray = this.form.get('emails') as FormArray;
    emailsArray.clear();
    (data.emails ?? []).forEach((email) => {
      emailsArray.push(this.fb.control(email, [Validators.required, CustomerValidators.email()]));
    });

    const phonesArray = this.form.get('phones') as FormArray;
    phonesArray.clear();
    (data.phones ?? []).forEach((phone) => {
      phonesArray.push(this.fb.control(phone, [Validators.required, CustomerValidators.phoneNumber()]));
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
      paymentType: data.paymentType,
      creditDays: data.creditDays,
      creditLimit: data.creditLimit,
      active: data.active,
      portalAccess: data.portalAccess ?? false,
    });
  }

  protected override onLoadEntity(id: string): void {
    this.warehouseService.loadSimpleWarehouses().subscribe();
    this.loadWarehouseAccess(id);
    this.service.loadById(id).subscribe({
      next: (customer) => {
        const formModel = this.mapper.toFormModel(customer);

        const emailsArray = this.form.get('emails') as FormArray;
        emailsArray.clear();
        formModel.emails.forEach((e) => {
          emailsArray.push(this.fb.control(e.email, [Validators.required, CustomerValidators.email()]));
        });

        const phonesArray = this.form.get('phones') as FormArray;
        phonesArray.clear();
        formModel.phones.forEach((p) => {
          phonesArray.push(this.fb.control(p.phone, [Validators.required, CustomerValidators.phoneNumber()]));
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
          paymentType: (formModel.creditDays ?? 0) > 0 ? PaymentType.CREDIT : PaymentType.CASH,
          creditDays: formModel.creditDays,
          creditLimit: formModel.creditLimit,
          active: formModel.active,
          portalAccess: formModel.portalAccess ?? false,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el cliente. Es posible que no exista.',
          life: 5000,
        });
        this.router.navigate(['/customers']);
      },
    });
  }

  override onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.getRawValue() as CustomerFormData;
      const formModel = this.mapper.toFormModel({
        id: this.entityId() ?? '',
        code: 0,
        createdAt: '',
        legalName: formValue.legalName,
        type: formValue.type as CustomerType,
        rif: formValue.rif,
        alias: formValue.alias,
        creditDays: formValue.creditDays ?? 0,
        creditLimit: formValue.creditLimit ?? 0,
        active: formValue.active,
        portalAccess: formValue.portalAccess,
        emails: formValue.emails.map((email) => ({ id: '', customerId: '', email })),
        phones: formValue.phones.map((phone) => ({ id: '', customerId: '', phone })),
        addresses: formValue.addresses.map((a) => ({ id: '', customerId: '', ...a })),
      });

      if (this.isEditMode() && this.entityId()) {
        const updateData = this.mapper.toUpdateRequest(formModel);
        this.service.update(this.entityId()!, updateData).subscribe({
          next: () => {
            this.markAsSubmitted();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Cliente actualizado exitosamente',
              life: 3000,
            });
            this.router.navigate(['/customers']);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el cliente. Por favor, intente nuevamente.',
              life: 5000,
            });
          },
        });
      } else {
        const createData = this.mapper.toCreateRequest(formModel);
        this.service.create(createData).subscribe({
          next: () => {
            this.markAsSubmitted();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Cliente creado exitosamente',
              life: 3000,
            });
            this.router.navigate(['/customers']);
          },
          error: (err: { error?: { message?: string } }) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || 'Error al crear el cliente. Por favor, intente nuevamente.',
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

  loadWarehouseAccess(id: string): void {
    this.warehouseAccessLoading.set(true);
    this.customerApi.getWarehouseAccess(id).subscribe({
      next: (res) => this.warehouseAccess.set(res.items),
      error: () => this.warehouseAccess.set([]),
      complete: () => this.warehouseAccessLoading.set(false),
    });
  }

  onGrantWarehouse(): void {
    const warehouseId = this.selectedWarehouseId();
    const id = this.entityId();
    if (!warehouseId || !id) return;
    this.grantLoading.set(true);
    this.customerApi.grantWarehouseAccess(id, warehouseId).subscribe({
      next: (res) => {
        this.warehouseAccess.set(res.items);
        this.showGrantDialog.set(false);
        this.selectedWarehouseId.set(null);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Almacén asignado correctamente', life: 3000 });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al asignar el almacén', life: 5000 });
      },
      complete: () => this.grantLoading.set(false),
    });
  }

  onRevokeWarehouse(warehouseId: string): void {
    const id = this.entityId();
    if (!id) return;
    this.customerApi.revokeWarehouseAccess(id, warehouseId).subscribe({
      next: (res) => {
        this.warehouseAccess.set(res.items);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Acceso revocado correctamente', life: 3000 });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al revocar el acceso', life: 5000 });
      },
    });
  }

  private createEmailControl() {
    return this.fb.control('', [Validators.required, CustomerValidators.email()]);
  }

  private createPhoneControl() {
    return this.fb.control('', [Validators.required, CustomerValidators.phoneNumber()]);
  }

  private createAddressGroup(data?: Partial<CustomerAddressFormData>) {
    return this.fb.group({
      address: [data?.address ?? '', [Validators.required, CustomerValidators.address()]],
      state: [data?.state ?? ''],
      municipality: [data?.municipality ?? ''],
      postalCode: [data?.postalCode ?? ''],
      billing: [data?.billing ?? false],
      active: [data?.active ?? true],
    });
  }
}
