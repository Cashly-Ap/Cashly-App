import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TextareaModule } from 'primeng/textarea';
import {
  TabContentComponent,
  TextInputComponent,
  SelectInputComponent,
} from '@core/forms/components';
import { SUPPLIER_TYPES } from '@features/partners/suppliers/models/enums/supplier-type.enum';

@Component({
  selector: 'app-supplier-general-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    ToggleSwitchModule,
    TextareaModule,
    TabContentComponent,
    TextInputComponent,
    SelectInputComponent,
  ],
  templateUrl: './supplier-general-section.component.html',
})
export class SupplierGeneralSectionComponent {
  form = input.required<FormGroup>();
  isEditMode = input<boolean>(false);

  supplierTypes = [...SUPPLIER_TYPES];

  control(name: string): FormControl {
    return this.form().get(name) as FormControl;
  }
}
