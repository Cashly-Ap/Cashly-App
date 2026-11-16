# Effective role enforcement

## Behavior

Business navigation and actions use the assigned role's current server permissions. A legacy user label never grants access. READ is required before any additional action; a module without READ is absent from the desktop/mobile menu. Account settings remain available independently.

The route guard refreshes authoritative access and checks the selected action, ancestor module READ requirements and explicit cross-module grants. Unknown guarded module metadata fails closed. Reports require EXPORT for their API owner and DOCUMENT_ADMIN. The inventory catalog report belongs to INVENTORY; the commercial catalog belongs to CATALOG.

Shared permission controls track navigation and current access. They hide forbidden controls and block click, keyboard and submit events before execution. Open list action menus recheck grants when an action is invoked; empty list/detail action menus have no trigger. Role/department deletion rechecks DELETE when accepting confirmation. Pending draft navigation shows/counts only forms the current account can create/update and checks again before reopening, preserving stored drafts.

## Verification

- Docker tests cover real route configurations, server access refresh, shared actions/directives, draft reopening and grant revocation.
- Production Angular build succeeds with the existing STOMP CommonJS warning.
- A temporary local role/user with CATALOG READ was used for a real browser/API check: catalog list/detail visible, only View detail available, no create/edit/delete/export controls, unrelated modules absent. API GET categories returned 200; unrelated modules and valid category POST/PUT/DELETE and commercial export returned 403.
- Removing CATALOG READ from that temporary role denied a request using the same previously issued token. Navigating again returned to own profile, removed Catalog from navigation and preserved only account settings. No existing role assignments or customer data changed. Both temporary fixtures were deleted afterward (204).
- Screenshot evidence in parent workspace: artifacts/design-check/role-read-only-enforcement.png and role-no-module-enforcement.png.
