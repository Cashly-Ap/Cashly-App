import { TabsModule } from 'primeng/tabs';
import { UserValidators } from '../../validators/user.validators';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import {
  TabContentComponent,
  FormContainerComponent,
  FormHeaderComponent,
  FormCardComponent,
  FormActionsComponent,
  TextInputComponent,
  SelectInputComponent,
} from '@core/forms/components';
import { BaseFormComponent, FormConfig } from '@core/forms/base/base-form.component';
import { UserApplicationService } from '../../services/application/user-application.service';
import { AccessManagementService } from '../../../authorization/services/access-management.service';
import { UserProfile, SelectionOption } from '../../../authorization/models/access.model';
interface UserFormData extends UserProfile {
  email: string;
  password: string;
  userName: string;
  active: boolean;
  street: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
}
@Component({
  selector: 'app-users-form-page',
  standalone: true,
  imports: [
    TabsModule,
    ReactiveFormsModule,
    ToggleSwitchModule,
    TabContentComponent,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
    TextInputComponent,
    SelectInputComponent,
  ],
  templateUrl: './users-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersFormPageComponent extends BaseFormComponent<UserFormData> {
  private readonly service = inject(UserApplicationService);
  private readonly management = inject(AccessManagementService);
  private readonly messages = inject(MessageService);
  readonly loading = this.service.loading;
  readonly roles = signal<{ label: string; value: string }[]>([]);
  readonly departments = signal<{ label: string; value: string }[]>([]);
  readonly activeTab = signal('general');
  readonly addressFields = [
    { key: 'street', label: 'Dirección' },
    { key: 'city', label: 'Ciudad' },
    { key: 'region', label: 'Provincia' },
    { key: 'country', label: 'País' },
    { key: 'postalCode', label: 'Código postal' },
  ];
  override ngOnInit(): void {
    super.ngOnInit();
    const options = (items: SelectionOption[]) =>
      items.map((item) => ({ label: item.name, value: item.id }));
    this.management.roleOptions().subscribe({
      next: (items) => this.roles.set(options(items)),
      error: () => this.selectionError(),
    });
    this.management.departmentOptions().subscribe({
      next: (items) => this.departments.set(options(items)),
      error: () => this.selectionError(),
    });
  }
  private selectionError(): void {
    this.messages.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los roles o departamentos disponibles.',
    });
  }
  control(key: string): FormControl {
    return this.form.get(key) as FormControl;
  }
  getConfig(): FormConfig {
    return {
      entityDisplayName: 'Usuario',
      entityArticle: 'del',
      module: 'users',
      routeBase: '/platform/users',
    };
  }
  createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        this.isCreateMode() ? [Validators.required, UserValidators.passwordStrength()] : [],
      ],
      userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      firstName: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      roleId: ['', Validators.required],
      departmentId: ['', Validators.required],
      active: [true],
      phone: ['', UserValidators.phoneNumber()],
      street: ['', Validators.maxLength(200)],
      city: ['', Validators.maxLength(100)],
      region: ['', Validators.maxLength(100)],
      country: ['', Validators.maxLength(100)],
      postalCode: ['', Validators.maxLength(20)],
    });
  }
  protected override restoreFormData(data: UserFormData): void {
    this.form.patchValue(data);
  }
  protected override getPendingTabTitle(data: UserFormData): string {
    return data.userName?.trim() || super.getPendingTabTitle(data);
  }
  protected override onLoadEntity(id: string): void {
    this.service.loadUserById(id).subscribe({
      next: (user) => {
        this.form.patchValue({ ...user, ...user.address });
        this.control('password').clearValidators();
        this.control('password').updateValueAndValidity();
      },
      error: () =>
        this.messages.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el usuario.',
        }),
    });
  }
  private firstInvalidTab(): string {
    if (
      ['firstName', 'lastName', 'userName', 'email', 'password'].some(
        (key) => this.control(key).invalid,
      )
    )
      return 'general';
    if (['roleId', 'departmentId'].some((key) => this.control(key).invalid)) return 'access';
    return 'contact';
  }
  override onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.activeTab.set(this.firstInvalidTab());
      return;
    }
    const v = this.form.getRawValue();
    const address = {
      street: (v.street ?? '').trim() || null,
      city: (v.city ?? '').trim() || null,
      region: (v.region ?? '').trim() || null,
      country: (v.country ?? '').trim() || null,
      postalCode: (v.postalCode ?? '').trim() || null,
    };
    const phone = (v.phone ?? '').replace(/[\s().-]/g, '') || null;
    const data = {
      email: v.email,
      userName: v.userName.trim(),
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      roleId: v.roleId,
      departmentId: v.departmentId,
      active: v.active,
      address: Object.values(address).some(Boolean) ? address : null,
      phone,
    };
    const request = this.isEditMode()
      ? this.service.updateUser(this.entityId()!, {
          userName: data.userName,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          phone: data.phone,
          roleId: data.roleId,
          departmentId: data.departmentId,
          active: data.active,
        })
      : this.service.createUser({
          email: data.email,
          userName: data.userName,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          phone: data.phone,
          roleId: data.roleId,
          departmentId: data.departmentId,
          password: v.password,
        });
    request.subscribe({
      next: () => {
        this.markAsSubmitted();
        this.messages.add({
          severity: 'success',
          summary: 'Guardado',
          detail: 'Usuario guardado correctamente',
        });
        this.router.navigate(['/platform/users']);
      },
      error: (error) =>
        this.messages.add({
          severity: 'error',
          summary: 'Error',
          detail:
            error.error?.message ??
            'No se pudo guardar. Comprueba que el rol y departamento sigan disponibles.',
        }),
    });
  }
}
