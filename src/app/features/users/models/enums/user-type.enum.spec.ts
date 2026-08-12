import { UserType, USER_TYPES, USER_TYPE_LABELS, getUserTypeLabel } from './user-type.enum';

describe('UserType', () => {
  it('should have all expected enum values', () => {
    expect(UserType.OPERATOR).toBe('OPERATOR');
    expect(UserType.ADMIN).toBe('ADMIN');
    expect(UserType.SUPER_ADMIN).toBe('SUPER_ADMIN');
  });

  it('should have exactly 3 enum values', () => {
    expect(Object.keys(UserType).length).toBe(3);
  });
});

describe('USER_TYPES', () => {
  it('should contain all user types', () => {
    const values = USER_TYPES.map((t) => t.value);
    expect(values).toContain(UserType.OPERATOR);
    expect(values).toContain(UserType.ADMIN);
    expect(values).toContain(UserType.SUPER_ADMIN);
  });

  it('should have correct labels', () => {
    expect(USER_TYPES[0].label).toBe('Operador');
    expect(USER_TYPES[1].label).toBe('Administrador');
    expect(USER_TYPES[2].label).toBe('Super Admin');
  });

  it('should be readonly', () => {
    expect(USER_TYPES.length).toBe(3);
  });
});

describe('USER_TYPE_LABELS', () => {
  it('should map each type to its label', () => {
    expect(USER_TYPE_LABELS[UserType.OPERATOR]).toBe('Operador');
    expect(USER_TYPE_LABELS[UserType.ADMIN]).toBe('Administrador');
    expect(USER_TYPE_LABELS[UserType.SUPER_ADMIN]).toBe('Super Admin');
  });
});

describe('getUserTypeLabel', () => {
  it('should return correct label for known types', () => {
    expect(getUserTypeLabel(UserType.OPERATOR)).toBe('Operador');
    expect(getUserTypeLabel(UserType.ADMIN)).toBe('Administrador');
    expect(getUserTypeLabel(UserType.SUPER_ADMIN)).toBe('Super Admin');
  });

  it('should return the input for unknown types', () => {
    expect(getUserTypeLabel('UNKNOWN' as UserType)).toBe('UNKNOWN');
  });
});
