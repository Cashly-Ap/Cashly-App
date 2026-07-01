# Test Plan — Users (User Management)

> User management module — CRUD, permissions, password management, and account administration.
> Version: 1.0 | Priority: CRITICAL

---

## Module Overview

The Users module handles: listing, creating, editing, deleting users, managing their roles, module permissions, passwords, and email addresses. It is restricted to SUPER_ADMIN (frontend) and SUPER_ADMIN/ADMIN (backend read-only).

## Module Routes

| Route | Component | Title | Guards |
|-------|-----------|-------|--------|
| `/users` | UsersListPageComponent | Usuarios | `authGuard` + `adminGuard` + `modulePermissionGuard(USERS)` |
| `/users/new` | UsersFormPageComponent | Nuevo Usuario | Same |
| `/users/:id` | UsersDetailsPageComponent | Detalles del Usuario | Same |
| `/users/:id/edit` | UsersFormPageComponent | Editar Usuario | Same |

## Seed Users for Testing

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| `gabriel@gmail.com` | `49510561Gabriel.` | SUPER_ADMIN | All modules |
| `admin@parsun.com` | `49510561Gabriel.` | ADMIN | USERS, INVENTORY, SALES, FINANCES, PURCHASES, DOCUMENT_ADMIN |
| `operator@parsun.com` | `49510561Gabriel.` | OPERATOR | INVENTORY, SALES, PURCHASES |
| `testuser@parsun.com` | `Test1234!` | OPERATOR | INVENTORY (can be created for testing) |

---

## Tests

### USER-001 — List users as SUPER_ADMIN

- **Severity**: CRITICAL
- **URL**: `http://localhost:4200/users`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am authenticated as SUPER_ADMIN
- **When** I navigate to `/users`
- **Then** I should see a table with all users (excluding myself)
- **And** columns should include: userName, email, role, active status, actions
- **And** the API call `GET /api/users` should return status 200
- **And** there should be no console errors

---

### USER-002 — List users as ADMIN (frontend blocked)

- **Severity**: HIGH
- **URL**: `http://localhost:4200/users`
- **Prerequisites**: Authenticated as ADMIN (`admin@parsun.com`)
- **Given** I am authenticated as ADMIN (has USERS permission)
- **When** I navigate to `/users`
- **Then** I should be redirected away from `/users` (frontend `adminGuard` blocks ADMIN)
- **Given** I call `GET /api/users` directly with the ADMIN token
- **Then** the API should return 200 (`@PreAuthorize('hasAnyRole("SUPER_ADMIN", "ADMIN")')`)
- **Note**: Frontend guard is stricter than backend — ADMIN can read users via API but not via UI

---

### USER-003 — List users as OPERATOR (blocked)

- **Severity**: HIGH
- **URL**: `http://localhost:4200/users`
- **Prerequisites**: Authenticated as OPERATOR (`operator@parsun.com`)
- **Given** I am authenticated as OPERATOR
- **When** I navigate to `/users`
- **Then** I should be redirected (either by `adminGuard` or `modulePermissionGuard`)
- **Given** I call `GET /api/users` directly with the OPERATOR token
- **Then** the API should return 403

---

### USER-004 — View user details

- **Severity**: HIGH
- **URL**: `http://localhost:4200/users/{id}`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), existing user ID available
- **Given** I am on the users list page
- **When** I click on a user row (or navigate to `/users/{id}`)
- **Then** I should see the user's details: email, userName, role, status, module permissions
- **And** I should see action buttons: Edit, Change Password, Change Email
- **And** the API call `GET /api/users/{id}` should return 200

---

### USER-005 — Create user successfully

- **Severity**: CRITICAL
- **URL**: `http://localhost:4200/users/new`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I navigate to `/users/new`
- **When** I fill in all required fields (email, userName, password, confirm, role) and submit
- **Then** the user should be created and I should be redirected to the users list
- **And** the new user should appear in the list
- **And** the API call `POST /api/users` should return 201
- **Note**: Use a unique email like `test-{timestamp}@parsun.com` to avoid duplicates

---

### USER-006 — Create user validation (empty fields)

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/users/new`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am on the create user page
- **When** I click submit without filling required fields
- **Then** I should see validation errors for: email, userName, password, role
- **And** no API call should be made

---

### USER-007 — Create user with duplicate email

- **Severity**: HIGH
- **URL**: `http://localhost:4200/users/new`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am on the create user page
- **When** I enter an email that already exists (e.g. `admin@parsun.com`)
- **Then** the API should return 409 (Conflict)
- **And** I should see an error message like "Email already registered"

---

### USER-008 — Edit user

- **Severity**: HIGH
- **URL**: `http://localhost:4200/users/{id}/edit`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), target user is not SUPER_ADMIN
- **Given** I navigate to edit page for an OPERATOR user
- **When** I change the userName and role, then submit
- **Then** the user should be updated in the list
- **And** the API call `PUT /api/users/{id}` should return 200

---

### USER-009 — Delete user

- **Severity**: CRITICAL
- **URL**: `http://localhost:4200/users`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), a deletable user exists (not SUPER_ADMIN)
- **Given** I am on the users list page
- **When** I click the delete button on a non-SUPER_ADMIN user and confirm
- **Then** the user should be removed from the list
- **And** the API call `DELETE /api/users/{id}` should return 204

---

### USER-010 — Cannot delete SUPER_ADMIN user

- **Severity**: CRITICAL
- **URL**: `http://localhost:4200/users`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I try to delete a user with SUPER_ADMIN role
- **When** I call `DELETE /api/users/{superAdminId}`
- **Then** the API should return 400 or 403 (backed by `DeleteUserUseCase` protection)
- **And** the user should NOT be removed from the list
- **Note**: The hard-coded protected UUID is `a0eebc99-9c0b-4ef8-bb6d-6bb9bd20a215`

---

### USER-011 — Change user password

- **Severity**: HIGH
- **URL**: `http://localhost:4200/users/:id` (via details page or dialog)
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am on a user's details page
- **When** I click "Cambiar Contraseña" and enter a valid new password
- **Then** the API call `PUT /api/users/{id}/password` should return 200
- **And** the dialog should close with a success message
- **And** the user should be able to log in with the new password

---

### USER-012 — Change user email

- **Severity**: HIGH
- **URL**: `http://localhost:4200/users/:id` (via details page or dialog)
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am on a user's details page
- **When** I click "Cambiar Correo" and enter a new valid email
- **Then** the API call `PUT /api/users/{id}/email` should return 200
- **And** the new email should be visible in the user details

---

### USER-013 — Change email to duplicate

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/users/:id` (via details page)
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I try to change a user's email to one that already exists
- **When** I submit the change email form with an existing email
- **Then** the API should return 409 (Conflict) with "Email already in use"
- **And** the email should NOT be updated

---

### USER-014 — Update module permissions

- **Severity**: HIGH
- **URL**: `http://localhost:4200/users/{id}/edit`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), edit page for a non-SUPER_ADMIN user
- **Given** I am on the edit user page (Permissions tab)
- **When** I toggle module permissions and save
- **Then** the API call `PUT /api/users/{id}/module-permissions` should return 200
- **And** viewing the user details should reflect the new permissions
- **Note**: Only visible when logged in as SUPER_ADMIN

---

### USER-015 — Password strength validation

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/users/:id/edit` (change password dialog)
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am changing a user's password
- **When** I enter a weak password (less than 8 chars, no uppercase, no digit, no special char)
- **Then** I should see a validation error message
- **And** the submit button should be disabled

**Password requirements (backend):**
- Min 8 characters, max 100
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 digit
- At least 1 special character `[!@#$%^&*()_+\-=\[\]{};':"\\\|,.<>\/?]`

---

### USER-016 — Filter and search users

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/users`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am on the users list page
- **When** I filter by role (OPERATOR, ADMIN, SUPER_ADMIN)
- **Then** the list should show only users with that role
- **And** the API should be called with the `role` query parameter
- **When** I search by userName or email
- **Then** the list should filter to matching users

---

### USER-017 — Pagination

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/users`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), enough users exist for pagination
- **Given** I am on the users list page
- **When** I change the page size (10/25/50/100) or navigate to the next page
- **Then** the table should show the correct number of rows
- **And** the API call should include `page`, `size` parameters

---

### USER-018 — Sorting

- **Severity**: LOW
- **URL**: `http://localhost:4200/users`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am on the users list page
- **When** I click a column header (userName, email, role)
- **Then** the list should sort by that column
- **And** the sort direction should toggle on subsequent clicks

---

### USER-019 — Route protection (no auth)

- **Severity**: CRITICAL
- **URL**: `http://localhost:4200/users`
- **Prerequisites**: Not authenticated
- **Given** I am NOT authenticated
- **When** I navigate to `/users`
- **Then** I should be redirected to `/auth/login`

---

### USER-020 — Route protection (non-SUPER_ADMIN)

- **Severity**: CRITICAL
- **URL**: `http://localhost:4200/users`
- **Prerequisites**: Authenticated as OPERATOR (`operator@parsun.com`)
- **Given** I am authenticated as OPERATOR
- **When** I try to navigate to `/users`
- **Then** I should be blocked by `adminGuard` (redirects to `/`)
- **Note**: Same behavior expected for ADMIN (frontend blocks, even though backend allows reads)

---

### USER-021 — Create user with module permissions (SUPER_ADMIN only)

- **Severity**: HIGH
- **URL**: `http://localhost:4200/users/new`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am on the create user page
- **When** I see the Permissions section (only visible for SUPER_ADMIN)
- **And** I select specific module permissions for the new user
- **Then** after creation, the user should have the selected permissions
- **And** the API call should include the module permissions

---

### USER-022 — Empty state (no users found)

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/users`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am on the users list page
- **When** I apply a filter that matches no users (e.g. searching for `zzzznonexistent`)
- **Then** I should see an empty state message like "No users found"
- **And** the table should show empty state rows

---

### USER-023 — Permission enforcement: URL access denied for unauthorized module

- **Severity**: CRITICAL
- **URL**: `http://localhost:4200/customers`
- **Prerequisites**: A user with known restricted permissions (e.g., `operator@parsun.com` has INVENTORY, SALES, PURCHASES but NOT USERS)
- **Given** I am authenticated as `operator@parsun.com` (has INVENTORY, SALES, PURCHASES)
- **When** I navigate directly to `/users` via URL
- **Then** the frontend guard should block access (redirect to `/` or `/customers`)
- **And** the menu should NOT show "Gestión de Usuarios"
- **Given** I am authenticated as `sales@parsun.com` (only SALES)
- **When** I navigate directly to `/inventory` via URL
- **Then** the frontend guard should block access
- **And** the menu should NOT show "Inventario" or "Compras" or "Proveedores"

---

### USER-024 — Permission enforcement: menu reflects assigned permissions

- **Severity**: HIGH
- **URL**: `http://localhost:4200/`
- **Prerequisites**: Authenticated as a non-SUPER_ADMIN user with limited permissions
- **Given** I am authenticated as `sales@parsun.com` (only SALES)
- **When** I inspect the sidebar menu
- **Then** the menu should ONLY show: "Gestión Comercial" (or SALES-related)
- **And** should NOT show: "Gestión de Usuarios", "Inventario", "Compras", "Finanzas", "Reportes"
- **Given** I am authenticated as `operator@parsun.com` (INVENTORY, SALES, PURCHASES)
- **When** I inspect the sidebar menu
- **Then** the menu should only show: "Gestión Comercial", "Inventario", "Compras" (or "Proveedores")
- **And** should NOT show: "Gestión de Usuarios", "Finanzas", "Reportes"

---

### USER-025 — Permission change takes effect after re-login

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/users/{id}/edit`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), a test OPERATOR user exists
- **Given** I am SUPER_ADMIN editing a test OPERATOR user
- **When** I REMOVE a module permission (e.g., remove SALES from a user that had it)
- **And** the test user logs out and logs back in
- **Then** the menu should no longer show the removed module
- **And** navigating to the removed module's URL should be blocked
- **When** I ADD a module permission (e.g., add FINANCES)
- **And** the test user logs out and logs back in
- **Then** the menu should now show the added module
- **And** the user should be able to navigate to it

---

### USER-026 — Permission enforcement: backend blocks unauthorized API access

- **Severity**: CRITICAL
- **URL**: `http://localhost:4200/api/`
- **Prerequisites**: Authenticated as a user with limited permissions
- **Given** I have an access token for `nosales@parsun.com` (INVENTORY, PURCHASES — no SALES)
- **When** I call `GET /api/customers`
- **Then** the API should return 403 (Forbidden)
- **When** I call `GET /api/products`
- **Then** the API should return 200 (authorized for INVENTORY)
- **When** I call `GET /api/suppliers`
- **Then** the API should return 200 (authorized for PURCHASES)

---

## Coverage Matrix

| Functionality | Tests covering it | Priority |
|--------------|-------------------|----------|
| List users | USER-001, USER-002, USER-003 | CRITICAL |
| View user details | USER-004 | HIGH |
| Create user | USER-005, USER-006, USER-007, USER-021 | CRITICAL |
| Edit user | USER-008 | HIGH |
| Delete user | USER-009, USER-010 | CRITICAL |
| Change password | USER-011, USER-015 | HIGH |
| Change email | USER-012, USER-013 | HIGH |
| Module permissions | USER-014, USER-021 | HIGH |
| Permission enforcement | USER-023, USER-024, USER-025, USER-026 | CRITICAL |
| Route protection | USER-019, USER-020 | CRITICAL |
| Filters & Search | USER-016 | MEDIUM |
| Pagination | USER-017 | MEDIUM |
| Sorting | USER-018 | LOW |
| Empty states | USER-022 | MEDIUM |

---

## Execution Results

*To be filled after test execution.*

| Metric | Value |
|--------|-------|
| Planned Tests | 26 |
| Executed Tests | |
| ✅ PASS | |
| ❌ FAIL | |
| ⚠️ WARNING | |
| 🔲 NOT EXECUTED | |
| Issues Found | |
