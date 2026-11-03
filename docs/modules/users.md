# Users, roles and departments

User administration lives at `/platform/users`, role management at `/platform/roles`, and department management at `/platform/departments`. Their source owners are `src/app/features/platform/auth/{user,role,department,authorization}`. The permission model, directive, and guards are documented in [authorization.md](./authorization.md).

Users require first names, surnames, one active assignable role and one active department. Username/email keep their separate meanings. An optional structured address contains street, city, region, country and postal code. One optional phone number supports an optional leading plus and 7–15 digits; presentation separators are normalized. The profile exposes a nullable `phone` string.

The form loads searchable role and department options from `/api/roles/options` and `/api/departments/options`. Those endpoints enforce current actor assignment eligibility. Saving the profile and both references uses one API request. Inactive or stale references and authorization failures leave server changes atomic. Email/password changes remain separate actions in user details.

Roles use a flat set of `MODULE_ACTION` permission codes. The catalog comes from `/api/permissions/catalog`, grouped by area, submodule and module. There is no READ prerequisite: every supported code is independent. The protected `SYSTEM_ADMIN` role displays all 131 codes and cannot be edited. Custom role names carry no special rights. Departments organize users and never grant access.

Role and department updates include the fetched `version`. A 409 preserves the editor and explains that the record is referenced or changed. Reload the record before retrying a stale edit. Referenced role/department deletion and deactivation are rejected by the API.

Current permissions come exclusively from `/api/auth/access` as a `permissions: string[]` array. Login, token refresh and guarded navigation load current access; a 403 also refreshes the UI state. Failed access lookup clears grants.

Routes check `VIEW_LIST`, `VIEW_DETAIL`, `CREATE`, `EDIT` or other explicit codes as appropriate. Buttons use permission directives, and row menus use explicit `requiredAction` constants. Unknown row actions fail closed. Cross-owner operations carry additional required permissions: invoice creation and sales conversion require `FINANCE_BILLING_INVOICES_CREATE`; stock-changing operations require `INVENTORY_WAREHOUSES_RECORD_ENTRY` or `INVENTORY_WAREHOUSES_RECORD_EXIT`; reports require the owning module report code. Catalog is independent from Inventory; catalog-only readers can view product details without issuing stock requests.

Create payload fields are `email`, `password`, `userName`, `firstName`, `lastName`, `address`, `phone`, `roleId` and `departmentId`. Update payload fields are `userName`, the profile/reference fields and `active`. The HTTP adapter explicitly projects these fields so internal IDs, email, credentials and legacy direct grants cannot leak into an update request.

Validation coverage includes every module's deny/read/selected-action behavior, route action requirements, custom-name non-bypass, access revocation, silent-refresh continuity, exact request serialization, phone normalization/duplicates and role version conflicts. Docker execution evidence is tracked in the OpenSpec change; no unexecuted test is considered passing.

Stock-rich order, invoice, quote and purchase detail routes require INVENTORY READ, while their independent list routes retain only owner READ. Order and invoice creation/edit/delete/transitions and duplication require INVENTORY EXECUTE. Quote creation/edit require INVENTORY READ; conversion additionally requires INVENTORY EXECUTE plus the destination CREATE grant. Purchases require INVENTORY READ for create/edit/detail and INVENTORY EXECUTE for confirmation/cancellation. Returns require INVENTORY EXECUTE for creation/deletion. These dependencies are explicit in route data, button directives and row action declarations and are explained next to the role matrix.

## Verification (2026-10-19)

The complete frontend suite passed 264 files / 2,583 tests and the production build passed. User/role/department lists, details and forms use the customer presentation components; two-field details use two columns and trailing single fields fill the row. Browser evidence is recorded in the API change release-verification document. No deployment is implied.

## Faster role permission configuration

The Roles form Permissions tab uses full-width module cards instead of a wide matrix. Each module offers No access, Read only, Custom and All available presets; global controls apply Read only, All available or Clear to all modules even when a search filter is active. Module search ignores accents and case. Custom controls can be expanded and collapsed, show only supported actions and include short explanations. Presets only change the draft until the role is explicitly saved. Actor-inaccessible grants are preserved and their READ prerequisite cannot be removed. Protected roles remain immutable.
