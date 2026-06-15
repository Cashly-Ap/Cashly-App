import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  inject,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import {
  TextInputComponent,
  SelectInputComponent,
  NumberInputComponent,
  FileInputComponent,
} from '@core/forms/components/inputs';
import { TabContentComponent } from '@core/forms/components/cards';
import { CategoryApplicationService } from '@features/categories/services/application';
import { FormMode } from '@core/forms/enums/form-mode.enum';
import { ProductPricesSectionComponent } from '@features/products/components/product-prices-section/product-prices-section.component';

@Component({
  selector: 'app-product-general-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectModule,
    InputNumberModule,
    TextareaModule,
    ToggleSwitchModule,
    ButtonModule,
    TextInputComponent,
    SelectInputComponent,
    NumberInputComponent,
    FileInputComponent,
    TabContentComponent,
    ProductPricesSectionComponent,
  ],
  templateUrl: './product-general-section.component.html',
})
export class ProductGeneralSectionComponent implements OnInit {
  private readonly categoryService = inject(CategoryApplicationService);

  readonly form = input.required<FormGroup>();
  readonly mode = input.required<FormMode>();
  readonly existingPhotoUrl = input<string | null>(null);
  readonly productId = input<string | null>(null);

  readonly deletePhoto = output<void>();

  readonly categoryOptions = computed(() =>
    this.categoryService.categories().map((c) => ({ value: c.id, label: c.name }))
  );

  readonly productTypeOptions = [
    { value: false, label: 'Simple' },
    { value: true, label: 'Compuesto' },
  ];

  ngOnInit(): void {
    if (this.categoryService.categories().length === 0) {
      this.categoryService.loadAll({ size: 1000 }).subscribe();
    }
  }

  get photoControl(): FormControl<File | null> {
    return this.form().get('photo') as FormControl<File | null>;
  }

  asFormControl(field: string): FormControl {
    return this.form().get(field) as FormControl;
  }
}
