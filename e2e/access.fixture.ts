export const allAccessModules = [
  'USERS',
  'ROLES',
  'DEPARTMENTS',
  'CATALOG',
  'INVENTORY',
  'SALES',
  'FINANCES',
  'PURCHASES',
  'DOCUMENT_ADMIN',
  'DASHBOARD',
];
export function currentAccessFixture(modules = allAccessModules, systemAdministrator = true) {
  return {
    roleId: 'role-e2e',
    roleName: 'E2E custom role',
    departmentId: 'department-e2e',
    systemAdministrator,
    permissions: Object.fromEntries(
      modules.map((module) => [
        module,
        module === 'DASHBOARD'
          ? ['READ']
          : module === 'DOCUMENT_ADMIN'
            ? ['READ', 'EXPORT']
            : ['READ', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'EXECUTE'],
      ]),
    ),
  };
}
export const referenceOptions = [{ id: 'role-e2e', name: 'E2E role' }];
export const departmentReferenceOptions = [{ id: 'department-e2e', name: 'E2E department' }];
