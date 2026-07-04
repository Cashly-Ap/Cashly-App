import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { ProductGeneralSectionComponent } from './product-general-section.component';
import { CategoryApplicationService } from '@features/categories/services/application';
import { FormMode } from '@core/forms/enums/form-mode.enum';

@Component({
  standalone: true,
  imports: [ProductGeneralSectionComponent, ReactiveFormsModule],
  template: `
    <app-product-general-section
      [form]="form"
      [mode]="mode"
      [existingPhotoUrl]="existingPhotoUrl"
      [productId]="productId"
      (deletePhoto)="onDeletePhoto()"
    />
  `,
})
class HostComponent {
  form: FormGroup;
  mode: FormMode = FormMode.CREATE;
  existingPhotoUrl: string | null = null;
  productId: string | null = null;
  onDeletePhoto = vi.fn();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      code: [''],
      name: [''],
      categoryId: [null],
      description: [''],
      active: [true],
      composite: [false],
      purchasePrice: [null],
      photo: [null],
      components: this.fb.array([]),
      productPrices: this.fb.array([]),
    });
  }
}

describe('ProductGeneralSectionComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let sectionComponent: ProductGeneralSectionComponent;
  let mockCategoryService: Partial<CategoryApplicationService>;

  function configureTestBed() {
    mockCategoryService = {
      loadAll: vi.fn().mockReturnValue(of({ content: [], totalElements: 0 })),
      categories: signal([
        { id: 'cat-001', name: 'Category 1' },
        { id: 'cat-002', name: 'Category 2' },
      ]),
    };

    TestBed.configureTestingModule({
      imports: [HostComponent, ProductGeneralSectionComponent],
      providers: [
        { provide: CategoryApplicationService, useValue: mockCategoryService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();
  }

  function createHostComponent() {
    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    sectionComponent = fixture.debugElement.children[0].componentInstance;
  }

  beforeEach(() => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed();
    createHostComponent();
  });

  it('should create', () => {
    expect(sectionComponent).toBeTruthy();
  });

  it('should generate category options from service', () => {
    const options = sectionComponent.categoryOptions();
    expect(options).toContainEqual({ value: 'cat-001', label: 'Category 1' });
    expect(options).toContainEqual({ value: 'cat-002', label: 'Category 2' });
  });

  it('should have product type options for simple and composite', () => {
    const options = sectionComponent.productTypeOptions;
    expect(options).toContainEqual({ value: false, label: 'Simple' });
    expect(options).toContainEqual({ value: true, label: 'Compuesto' });
  });

  it('should load categories if not already loaded', () => {
    (mockCategoryService.categories as ReturnType<typeof signal>).set([]);
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed();
    (mockCategoryService.categories as ReturnType<typeof signal>).set([]);
    createHostComponent();

    expect(mockCategoryService.loadAll).toHaveBeenCalledWith({ size: 1000 });
  });

  it('should not load categories if already loaded', () => {
    expect(mockCategoryService.loadAll).not.toHaveBeenCalled();
  });

  it('should access photoControl getter', () => {
    const photoControl = sectionComponent.photoControl;
    expect(photoControl).toBeDefined();
    expect(photoControl.value).toBeNull();
  });

  it('should access asFormControl helper', () => {
    const nameControl = sectionComponent.asFormControl('name');
    expect(nameControl).toBeDefined();
  });

  it('should return categoryId control via asFormControl', () => {
    const catControl = sectionComponent.asFormControl('categoryId');
    expect(catControl).toBeDefined();
    expect(catControl.value).toBeNull();
  });
});
