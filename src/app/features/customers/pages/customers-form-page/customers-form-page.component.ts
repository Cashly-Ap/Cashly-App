import { Component, inject, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputTextModule } from 'primeng/inputtext';
import {
  FormContainerComponent,
  FormHeaderComponent,
  FormCardComponent,
  FormActionsComponent,
} from '@core/forms/components';
import { CustomerApplicationService } from '@features/customers/services/application';
import { CustomerMapper } from '@features/customers/services/mappers';
import { CustomerType, CUSTOMER_TYPES, PaymentType } from '@features/customers/models/enums';
import { CustomerValidators } from '@features/customers/validators';
import { CustomerGeneralSectionComponent } from '@features/customers/components/customer-general-section/customer-general-section.component';
import { CustomerContactSectionComponent } from '@features/customers/components/customer-contact-section/customer-contact-section.component';
import { CustomerAddressesSectionComponent } from '@features/customers/components/customer-addresses-section/customer-addresses-section.component';

@Component({
  selector: 'app-customers-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MainLayoutComponent,
    TabsModule,
    ToggleSwitchModule,
    InputTextModule,
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
export class CustomersFormPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(CustomerApplicationService);
  private mapper = inject(CustomerMapper);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  loading = this.service.loading;
  isEditMode = signal(false);
  customerId = signal<string | null>(null);

  title = computed(() => (this.isEditMode() ? 'Editar Cliente' : 'Nuevo Cliente'));
  subtitle = computed(() =>
    this.isEditMode()
      ? 'Actualice la información del cliente'
      : 'Complete la información del nuevo cliente',
  );
  submitLabel = computed(() => (this.isEditMode() ? 'Actualizar' : 'Crear'));

  customerTypes = [...CUSTOMER_TYPES];

  form: FormGroup = this.fb.group({
    legalName: ['', [Validators.required, CustomerValidators.legalName()]],
    type: [CustomerType.BUSINESS, Validators.required],
    rif: ['', [Validators.required, CustomerValidators.rif()]],
    alias: ['', [Validators.required, CustomerValidators.customerAlias()]],
    paymentType: [PaymentType.CASH, Validators.required],
    creditDays: [{ value: null, disabled: true }, [Validators.required, Validators.min(0), Validators.max(365)]],
    creditLimit: [{ value: null, disabled: true }, [Validators.required, Validators.min(0)]],
    active: [true],
    portalAccess: [false],
    portalEmail: [''],
    emails: this.fb.array([this.createEmailControl()]),
    phones: this.fb.array([this.createPhoneControl()]),
    addresses: this.fb.array([this.createAddressGroup()]),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.customerId.set(id);
      this.loadCustomer(id);
    }
  }

  private createEmailControl() {
    return this.fb.control('', [Validators.required, CustomerValidators.email()]);
  }

  private createPhoneControl() {
    return this.fb.control('', [Validators.required, CustomerValidators.phoneNumber()]);
  }

  private createAddressGroup() {
    return this.fb.group({
      address: ['', [Validators.required, CustomerValidators.address()]],
      state: [''],
      municipality: [''],
      postalCode: [''],
      billing: [false],
      active: [true],
    });
  }

  private loadCustomer(id: string): void {
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
          addressesArray.push(
            this.fb.group({
              address: [a.address, [Validators.required, CustomerValidators.address()]],
              state: [a.state ?? ''],
              municipality: [a.municipality ?? ''],
              postalCode: [a.postalCode ?? ''],
              billing: [a.billing],
              active: [a.active],
            }),
          );
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
          portalEmail: formModel.portalEmail ?? '',
        });

        this.cdr.markForCheck();
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

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.getRawValue();
      const formModel = this.mapper.toFormModel({
        ...formValue,
        id: this.customerId() ?? '',
        code: 0,
        createdAt: '',
        emails: formValue.emails.map((e: string) => ({ id: '', customerId: '', email: e })),
        phones: formValue.phones.map((p: string) => ({ id: '', customerId: '', phone: p })),
        addresses: formValue.addresses.map((a: { address: string; state: string; municipality: string; postalCode: string; billing: boolean; active: boolean }) => ({
          id: '',
          customerId: '',
          ...a,
        })),
      });

      if (this.isEditMode() && this.customerId()) {
        const updateData = this.mapper.toUpdateRequest(formModel);
        this.service.update(this.customerId()!, updateData).subscribe({
          next: () => {
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

  onCancel(): void {
    this.router.navigate(['/customers']);
  }
}
