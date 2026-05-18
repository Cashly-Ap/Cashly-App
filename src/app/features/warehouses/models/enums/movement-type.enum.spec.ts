import { MOVEMENT_TYPE_LABELS, MovementType } from './movement-type.enum';

describe('MovementType', () => {
  it('should have all expected type values', () => {
    const types: MovementType[] = ['ENTRY', 'EXIT', 'ADJUSTMENT', 'TRANSFER'];
    expect(types).toContain('ENTRY');
    expect(types).toContain('EXIT');
    expect(types).toContain('ADJUSTMENT');
    expect(types).toContain('TRANSFER');
  });

  it('should have exactly 4 type values', () => {
    const types: MovementType[] = ['ENTRY', 'EXIT', 'ADJUSTMENT', 'TRANSFER'];
    expect(types).toHaveLength(4);
  });
});

describe('MOVEMENT_TYPE_LABELS', () => {
  it('should map each type to its Spanish label', () => {
    expect(MOVEMENT_TYPE_LABELS.ENTRY).toBe('Entrada');
    expect(MOVEMENT_TYPE_LABELS.EXIT).toBe('Salida');
    expect(MOVEMENT_TYPE_LABELS.ADJUSTMENT).toBe('Ajuste');
    expect(MOVEMENT_TYPE_LABELS.TRANSFER).toBe('Transferencia');
  });

  it('should have exactly 4 labels', () => {
    expect(Object.keys(MOVEMENT_TYPE_LABELS).length).toBe(4);
  });
});
