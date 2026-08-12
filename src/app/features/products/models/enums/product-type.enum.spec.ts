import {
  ProductType,
  PRODUCT_TYPES,
  PRODUCT_TYPE_LABELS,
  getProductTypeLabel,
} from '@features/products/models/enums/product-type.enum';

describe('ProductType', () => {
  it('should have all expected enum values', () => {
    expect(ProductType.PHYSICAL).toBe('PHYSICAL');
    expect(ProductType.SERVICE).toBe('SERVICE');
    expect(ProductType.COMPOSITE).toBe('COMPOSITE');
  });

  it('should have exactly 3 enum values', () => {
    expect(Object.keys(ProductType).length).toBe(3);
  });
});

describe('PRODUCT_TYPES', () => {
  it('should contain all product types', () => {
    const values = PRODUCT_TYPES.map((t) => t.value);
    expect(values).toContain(ProductType.PHYSICAL);
    expect(values).toContain(ProductType.SERVICE);
    expect(values).toContain(ProductType.COMPOSITE);
  });

  it('should have correct labels', () => {
    expect(PRODUCT_TYPES[0].label).toBe('Físico');
    expect(PRODUCT_TYPES[1].label).toBe('Servicio');
    expect(PRODUCT_TYPES[2].label).toBe('Compuesto');
  });

  it('should be readonly', () => {
    expect(PRODUCT_TYPES.length).toBe(3);
  });
});

describe('PRODUCT_TYPE_LABELS', () => {
  it('should map each type to its label', () => {
    expect(PRODUCT_TYPE_LABELS[ProductType.PHYSICAL]).toBe('Físico');
    expect(PRODUCT_TYPE_LABELS[ProductType.SERVICE]).toBe('Servicio');
    expect(PRODUCT_TYPE_LABELS[ProductType.COMPOSITE]).toBe('Compuesto');
  });
});

describe('getProductTypeLabel', () => {
  it('should return correct label for known types', () => {
    expect(getProductTypeLabel(ProductType.PHYSICAL)).toBe('Físico');
    expect(getProductTypeLabel(ProductType.SERVICE)).toBe('Servicio');
    expect(getProductTypeLabel(ProductType.COMPOSITE)).toBe('Compuesto');
  });

  it('should return the input for unknown types', () => {
    expect(getProductTypeLabel('UNKNOWN' as ProductType)).toBe('UNKNOWN');
  });
});
