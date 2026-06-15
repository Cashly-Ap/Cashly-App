import { MOVEMENT_TYPE_LABELS, MovementType } from './movement-type.enum';

describe('MovementType', () => {
  it('should have all expected type values', () => {
    const types: MovementType[] = ['ENTRY', 'EXIT', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'COMPONENT_EXIT', 'RETURN_ENTRY', 'CANCEL_ENTRY', 'SALE_EXIT'];
    expect(types).toContain('ENTRY');
    expect(types).toContain('EXIT');
    expect(types).toContain('ADJUSTMENT');
    expect(types).toContain('TRANSFER_IN');
    expect(types).toContain('TRANSFER_OUT');
  });

  it('should have exactly 9 type values', () => {
    const types: MovementType[] = ['ENTRY', 'EXIT', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'COMPONENT_EXIT', 'RETURN_ENTRY', 'CANCEL_ENTRY', 'SALE_EXIT'];
    expect(types).toHaveLength(9);
  });
});

describe('MOVEMENT_TYPE_LABELS', () => {
  it('should map each type to its Spanish label', () => {
    expect(MOVEMENT_TYPE_LABELS.ENTRY).toBe('Entrada');
    expect(MOVEMENT_TYPE_LABELS.EXIT).toBe('Salida');
    expect(MOVEMENT_TYPE_LABELS.ADJUSTMENT).toBe('Ajuste');
    expect(MOVEMENT_TYPE_LABELS.TRANSFER_IN).toBe('Transferencia entrada');
    expect(MOVEMENT_TYPE_LABELS.TRANSFER_OUT).toBe('Transferencia salida');
    expect(MOVEMENT_TYPE_LABELS.COMPONENT_EXIT).toBe('Salida por componente');
    expect(MOVEMENT_TYPE_LABELS.RETURN_ENTRY).toBe('Entrada por devolución');
    expect(MOVEMENT_TYPE_LABELS.CANCEL_ENTRY).toBe('Entrada por cancelación');
    expect(MOVEMENT_TYPE_LABELS.SALE_EXIT).toBe('Salida por venta');
  });

  it('should have exactly 9 labels', () => {
    expect(Object.keys(MOVEMENT_TYPE_LABELS).length).toBe(9);
  });
});
