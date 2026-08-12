import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import {
  FormContainerComponent,
  FormHeaderComponent,
  FormCardComponent,
  FormActionsComponent,
} from '@core/forms/components';
import { TextInputComponent, SelectInputComponent } from '@core/forms/components/inputs';
import { WarehouseApplicationService } from '@features/warehouses/services/application';
import { BaseFormComponent, FormConfig } from '@core/forms/base/base-form.component';
import { VENEZUELA_STATES, VenezuelaState } from '@features/customers/data/venezuela-geo.data';

interface WarehouseFormData {
  name: string;
  state: string;
  municipality: string;
  address: string;
  description: string;
  active: boolean;
}

@Component({
  selector: 'app-warehouses-form-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    ToggleSwitchModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
    TextInputComponent,
    SelectInputComponent,
  ],
  templateUrl: './warehouses-form-page.component.html',
})
export class WarehousesFormPageComponent
  extends BaseFormComponent<WarehouseFormData>
  implements OnInit
{
  private service = inject(WarehouseApplicationService);
  private messageService = inject(MessageService);

  loading = this.service.loading;

  submitTooltip = signal('');

  private readonly FIELD_LABELS: Record<string, string> = {
    name: 'Nombre',
    state: 'Estado',
    municipality: 'Municipio',
  };

  stateOptions = VENEZUELA_STATES.map((s: VenezuelaState) => ({ value: s.name, label: s.name }));

  selectedStateName = signal<string | null>(null);

  municipalityOptions = computed(() => {
    const stateName = this.selectedStateName();
    if (!stateName) return [];
    const found = VENEZUELA_STATES.find((s) => s.name === stateName);
    return found ? found.municipalities.map((m) => ({ value: m, label: m })) : [];
  });

  asFormControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  getConfig(): FormConfig {
    return {
      entityDisplayName: 'Almacén',
      entityArticle: 'del',
      module: 'warehouses',
      routeBase: '/warehouses',
    };
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(150)]],
      state: ['', [Validators.required]],
      municipality: ['', [Validators.required]],
      address: ['', [Validators.maxLength(300)]],
      description: ['', [Validators.maxLength(500)]],
      active: [true],
    });
  }

  override ngOnInit(): void {
    super.ngOnInit?.();

    this.form.statusChanges.subscribe(() => this.updateSubmitTooltip());
    this.updateSubmitTooltip();

    this.form.get('state')?.valueChanges.subscribe((val: string) => {
      this.selectedStateName.set(val);
      this.form.get('municipality')?.setValue('');
    });
  }

  protected override getPendingTabTitle(formData: WarehouseFormData): string {
    return formData.name?.trim() || super.getPendingTabTitle(formData);
  }

  private updateSubmitTooltip(): void {
    const invalid = Object.entries(this.FIELD_LABELS)
      .filter(([key]) => this.form.get(key)?.invalid)
      .map(([, label]) => label);
    this.submitTooltip.set(invalid.length ? `Campos requeridos: ${invalid.join(', ')}` : '');
  }

  protected override restoreFormData(data: WarehouseFormData): void {
    this.selectedStateName.set(data.state);
    this.form.patchValue({
      name: data.name,
      state: data.state,
      municipality: data.municipality,
      address: data.address,
      description: data.description,
      active: data.active,
    });
  }

  protected override onLoadEntity(id: string): void {
    this.service.loadById(id).subscribe({
      next: (warehouse) => {
        this.selectedStateName.set(warehouse.state);
        this.form.patchValue({
          name: warehouse.name,
          state: warehouse.state,
          municipality: warehouse.municipality,
          address: warehouse.address ?? '',
          description: warehouse.description ?? '',
          active: warehouse.active,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el almacén.',
          life: 5000,
        });
        this.router.navigate(['/warehouses']);
      },
    });
  }

  override onSubmit(): void {
    if (this.form.valid) {
      const value = this.form.getRawValue() as WarehouseFormData;
      const payload = {
        name: value.name,
        state: value.state,
        municipality: value.municipality,
        address: value.address || undefined,
        description: value.description || undefined,
        active: value.active,
      };

      if (this.isEditMode() && this.entityId()) {
        this.service.update(this.entityId()!, payload).subscribe({
          next: () => {
            this.markAsSubmitted();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Almacén actualizado exitosamente',
              life: 3000,
            });
            this.router.navigate(['/warehouses']);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el almacén.',
              life: 5000,
            });
          },
        });
      } else {
        this.service.create(payload).subscribe({
          next: () => {
            this.markAsSubmitted();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Almacén creado exitosamente',
              life: 3000,
            });
            this.router.navigate(['/warehouses']);
          },
          error: (err: { error?: { message?: string } }) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || 'Error al crear el almacén.',
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
        detail: 'Por favor, complete todos los campos requeridos.',
        life: 5000,
      });
    }
  }
}
