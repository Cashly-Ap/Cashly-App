import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormArray, Validators } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
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
import { PriceTypeApplicationService } from '@features/price-types/services/application/price-type-application.service';

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
  emails: string[];
  phones: string[];
  addresses: CustomerAddressFormData[];
  notes: string;
  priceTypeId: string | null;
}

@Component({
  selector: 'app-customers-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TabsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
    CustomerGeneralSectionComponent,
    CustomerContactSectionComponent,
    CustomerAddressesSectionComponent,
  ],
  templateUrl: './customers-form-page.component.html',
})
export class CustomersFormPageComponent extends BaseFormComponent<CustomerFormData> {
  private service = inject(CustomerApplicationService);
  private customerApi = inject(CustomerApiService);
  private warehouseService = inject(WarehouseApplicationService);
  private priceTypeService = inject(PriceTypeApplicationService);
  private mapper = inject(CustomerMapper);
  private messageService = inject(MessageService);

  loading = this.service.loading;

  customerTypes = [...CUSTOMER_TYPES];
  priceTypeOptions = computed(() =>
    this.priceTypeService
      .priceTypes()
      .filter((pt) => pt.active)
      .map((pt) => ({ label: pt.name, value: pt.id })),
  );

  warehouseAccess = signal<CustomerWarehouseAccessItem[]>([]);
  warehouseAccessLoading = signal(false);
  initialWarehouseIds = signal<Set<string>>(new Set());
  selectedWarehouseId = signal<string | null>(null);

  warehouseOptions = computed(() => {
    const assigned = new Set(this.warehouseAccess().map((w) => w.warehouseId));
    return this.warehouseService
      .simpleWarehouses()
      .filter((w) => !assigned.has(w.id))
      .map((w) => ({ label: w.name, value: w.id }));
  });

  submitTooltip = signal('');

  private readonly FIELD_LABELS: Record<string, string> = {
    legalName: 'Razón social',
    type: 'Tipo de cliente',
    rif: 'RIF',
    paymentType: 'Tipo de pago',
    creditDays: 'Días de crédito',
    creditLimit: 'Límite de crédito',
    priceTypeId: 'Tipo de precio',
    emails: 'Correos electrónicos',
    phones: 'Teléfonos',
    addresses: 'Direcciones',
  };

  override ngOnInit(): void {
    super.ngOnInit();
    this.warehouseService.loadSimpleWarehouses().subscribe();
    this.priceTypeService.loadAll({ size: 1000 }).subscribe();
    this.updateSubmitTooltip();
    this.form.statusChanges.subscribe(() => this.updateSubmitTooltip());
  }

  private updateSubmitTooltip(): void {
    const invalid = Object.entries(this.FIELD_LABELS)
      .filter(([key]) => this.form.get(key)?.invalid)
      .map(([, label]) => label);
    if (this.warehouseAccess().length === 0) {
      invalid.push('Almacenes');
    }
    this.submitTooltip.set(invalid.length ? `Campos requeridos: ${invalid.join(', ')}` : '');
  }

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
      alias: ['', [CustomerValidators.customerAlias()]],
      paymentType: [PaymentType.CASH, Validators.required],
      creditDays: [
        { value: null, disabled: true },
        [Validators.required, Validators.min(0), Validators.max(365)],
      ],
      creditLimit: [{ value: null, disabled: true }, [Validators.required, Validators.min(0)]],
      active: [true],
      emails: this.fb.array([]),
      phones: this.fb.array([]),
      addresses: this.fb.array([this.createAddressGroup()], [CustomerValidators.minLengthArray(1)]),
      notes: [''],
      priceTypeId: [null, Validators.required],
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
      phonesArray.push(
        this.fb.control(phone, [Validators.required, CustomerValidators.phoneNumber()]),
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
      paymentType: data.paymentType,
      creditDays: data.creditDays,
      creditLimit: data.creditLimit,
      active: data.active,
      notes: data.notes ?? '',
      priceTypeId: data.priceTypeId ?? null,
    });
  }

  protected override onLoadEntity(id: string): void {
    this.loadWarehouseAccess(id);
    this.service.loadById(id).subscribe({
      next: (customer) => {
        const formModel = this.mapper.toFormModel(customer);

        const emailsArray = this.form.get('emails') as FormArray;
        emailsArray.clear();
        formModel.emails.forEach((e) => {
          emailsArray.push(
            this.fb.control(e.email, [Validators.required, CustomerValidators.email()]),
          );
        });

        const phonesArray = this.form.get('phones') as FormArray;
        phonesArray.clear();
        formModel.phones.forEach((p) => {
          phonesArray.push(
            this.fb.control(p.phone, [Validators.required, CustomerValidators.phoneNumber()]),
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
          paymentType: (formModel.creditDays ?? 0) > 0 ? PaymentType.CREDIT : PaymentType.CASH,
          creditDays: formModel.creditDays,
          creditLimit: formModel.creditLimit,
          active: formModel.active,
          notes: formModel.notes ?? '',
          priceTypeId: formModel.priceTypeId ?? null,
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
        emails: formValue.emails.map((email) => ({ id: '', customerId: '', email })),
        phones: formValue.phones.map((phone) => ({ id: '', customerId: '', phone })),
        addresses: formValue.addresses.map((a) => ({ id: '', customerId: '', ...a })),
        notes: formValue.notes || undefined,
        priceTypeId: formValue.priceTypeId || undefined,
        deletable: true,
      });

      if (this.isEditMode() && this.entityId()) {
        const updateData = this.mapper.toUpdateRequest(formModel);
        this.service.update(this.entityId()!, updateData).subscribe({
          next: () => {
            const customerId = this.entityId()!;
            const currentIds = new Set(this.warehouseAccess().map((w) => w.warehouseId));
            const initial = this.initialWarehouseIds();
            const toGrant = [...currentIds].filter((id) => !initial.has(id));
            const toRevoke = [...initial].filter((id) => !currentIds.has(id));

            const ops = [
              ...toGrant.map((id) => this.customerApi.grantWarehouseAccess(customerId, id)),
              ...toRevoke.map((id) => this.customerApi.revokeWarehouseAccess(customerId, id)),
            ];

            const warehouse$: Observable<unknown> = ops.length > 0 ? forkJoin(ops) : of(null);

            warehouse$.subscribe({
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
                this.markAsSubmitted();
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Advertencia',
                  detail: 'Cliente actualizado, pero hubo un error al sincronizar los almacenes',
                  life: 5000,
                });
                this.router.navigate(['/customers']);
              },
            });
          },
          error: (error: unknown) =>
            this.handleSaveError(
              error,
              'Error al actualizar el cliente. Por favor, intente nuevamente.',
            ),
        });
      } else {
        const warehouseIds = this.warehouseAccess().map((w) => w.warehouseId);
        if (warehouseIds.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'Debe asignar al menos un almacén antes de crear el cliente',
            life: 5000,
          });
          return;
        }

        const createData = this.mapper.toCreateRequest(formModel, warehouseIds);
        this.service.create(createData).subscribe({
          next: (created) => {
            this.markAsSubmitted();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Cliente creado exitosamente',
              life: 3000,
            });
            this.router.navigate(['/customers']);
          },
          error: (error: unknown) =>
            this.handleSaveError(error, 'Error al crear el cliente. Por favor, intente nuevamente.'),
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

  private handleSaveError(error: unknown, fallbackMessage: string): void {
    const response = error as {
      status?: number;
      error?: { error?: string; message?: string };
    };

    if (response.status === 409 && response.error?.error === 'Duplicate customer RIF') {
      const rifControl = this.form.get('rif');
      rifControl?.setErrors({ ...rifControl.errors, duplicateRif: true });
      rifControl?.markAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'RIF ya registrado',
        detail: `Ya existe un cliente registrado con el RIF ${rifControl?.value}.`,
        life: 5000,
      });
      return;
    }

    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: response.error?.message || fallbackMessage,
      life: 5000,
    });
  }

  loadWarehouseAccess(id: string): void {
    this.warehouseAccessLoading.set(true);
    this.customerApi.getWarehouseAccess(id).subscribe({
      next: (res) => {
        this.warehouseAccess.set(res);
        this.initialWarehouseIds.set(new Set(res.map((w) => w.warehouseId)));
      },
      error: () => this.warehouseAccess.set([]),
      complete: () => this.warehouseAccessLoading.set(false),
    });
  }

  onSelectWarehouse(warehouseId: string | null): void {
    if (!warehouseId) return;
    const option = this.warehouseOptions().find((o) => o.value === warehouseId);
    if (!option) return;
    this.warehouseAccess.update((list) => [
      ...list,
      { id: '', customerId: this.entityId() ?? '', warehouseId, warehouseName: option.label },
    ]);
    this.selectedWarehouseId.set(null);
    this.updateSubmitTooltip();
  }

  onRevokeWarehouse(warehouseId: string): void {
    this.warehouseAccess.update((list) => list.filter((w) => w.warehouseId !== warehouseId));
    this.updateSubmitTooltip();
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
