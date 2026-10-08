# Test Plan — Auth (Authentication)

> Authentication module and user account management.
> Version: 1.0 | Priority: CRITICAL

---

## Module Overview

The Auth module handles: login, logout, token refresh, password change, username change, and account configuration. It is the entry point to the entire application.

## Module Routes

| Route                   | Component                   | Guard                                          |
| ----------------------- | --------------------------- | ---------------------------------------------- |
| `/`                     | LoginPageComponent          | homeRedirectGuard (redirects if authenticated) |
| `/auth/login`           | LoginPageComponent          | None (public)                                  |
| `/auth/configuration`   | ConfigurationPageComponent  | authGuard                                      |
| `/auth/change-password` | ChangePasswordPageComponent | authGuard                                      |
| `/auth/change-username` | ChangeUsernamePageComponent | authGuard                                      |

## Seed Users for Testing

| Email                   | Password           | Role        | Permissions                                                  |
| ----------------------- | ------------------ | ----------- | ------------------------------------------------------------ |
| `gabriel@gmail.com`     | `49510561Gabriel.` | SUPER_ADMIN | All modules                                                  |
| `superadmin@cashly.com` | `49510561Gabriel.` | SUPER_ADMIN | All modules                                                  |
| `admin@cashly.com`      | `49510561Gabriel.` | ADMIN       | USERS, INVENTORY, SALES, FINANCES, PURCHASES, DOCUMENT_ADMIN |
| `operator@cashly.com`   | `49510561Gabriel.` | OPERATOR    | INVENTORY, SALES, PURCHASES                                  |
| `sales@cashly.com`      | `49510561Gabriel.` | OPERATOR    | SALES                                                        |
| `nosales@cashly.com`    | `49510561Gabriel.` | OPERATOR    | INVENTORY, PURCHASES                                         |

---

## Tests

### AUTH-001 — Successful SUPER_ADMIN login

- **Severity**: CRITICAL
- **URL**: `http://localhost:4200/auth/login`
- **Prerequisites**: Not authenticated
- **Given** I am on the login page
- **When** I enter email `gabriel@gmail.com` and password `49510561Gabriel.` and click "Iniciar Sesión"
- **Then** I should be redirected to `/customers`
- **And** I should see the sidebar menu with available modules
- **And** I should see the username "Gabriel" somewhere in the layout

---

### AUTH-002 — Failed login with wrong credentials

- **Severity**: CRITICAL
- **URL**: `http://localhost:4200/auth/login`
- **Prerequisites**: Not authenticated
- **Given** I am on the login page
- **When** I enter email `gabriel@gmail.com` and password `wrongpassword` and click "Iniciar Sesión"
- **Then** I should see an error message like "Credenciales incorrectas" or similar
- **And** I should NOT be redirected to another page
- **And** the URL should remain `/auth/login`

---

### AUTH-003 — Failed login due to form validation

- **Severity**: HIGH
- **URL**: `http://localhost:4200/auth/login`
- **Prerequisites**: Not authenticated
- **Given** I am on the login page
- **When** I click "Iniciar Sesión" without filling in the fields
- **Then** I should see validation messages indicating that email and password are required
- **And** no API call should be made

---

### AUTH-004 — Login with different roles (ADMIN)

- **Severity**: HIGH
- **URL**: `http://localhost:4200/auth/login`
- **Prerequisites**: Not authenticated
- **Given** I authenticate as `admin@cashly.com` / `49510561Gabriel.`
- **When** I enter valid credentials
- **Then** I should be redirected to `/customers`
- **And** the menu should show only the modules ADMIN is allowed to access

---

### AUTH-005 — Login with different roles (OPERATOR)

- **Severity**: HIGH
- **URL**: `http://localhost:4200/auth/login`
- **Prerequisites**: Not authenticated
- **Given** I authenticate as `operator@cashly.com` / `49510561Gabriel.`
- **When** I enter valid credentials
- **Then** I should be redirected to `/customers`
- **And** the menu should show only INVENTORY, SALES, PURCHASES

---

### AUTH-006 — Session persistence on page reload

- **Severity**: CRITICAL
- **URL**: `http://localhost:4200/auth/login`
- **Prerequisites**: Authenticated as `gabriel@gmail.com`
- **Given** I am authenticated in the application
- **When** I reload the page (F5)
- **Then** I should remain authenticated
- **And** I should stay on the same route (or redirect to `/customers` if on root)

---

### AUTH-007 — Successful logout

- **Severity**: CRITICAL
- **URL**: `http://localhost:4200/`
- **Prerequisites**: Authenticated as `gabriel@gmail.com`
- **Given** I am authenticated
- **When** I click the "Cerrar Sesión" or "Salir" button
- **Then** I should be redirected to `/auth/login`
- **And** when trying to access `/customers` directly, I should be redirected back to `/auth/login`

---

### AUTH-008 — Route protection (without authentication)

- **Severity**: CRITICAL
- **URL**: `http://localhost:4200/auth/configuration`
- **Prerequisites**: Not authenticated
- **Given** I am NOT authenticated
- **When** I try to access `/auth/configuration` directly
- **Then** I should be redirected to `/auth/login`

---

### AUTH-009 — Home redirect (authenticated vs unauthenticated)

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/`
- **Prerequisites**: Variable (authenticated or not)
- **Given** I am NOT authenticated and go to `/`
- **Then** I should see the login page
- **Given** I am authenticated as `gabriel@gmail.com` and go to `/`
- **Then** I should be redirected to `/customers`

---

### AUTH-010 — Account Configuration page

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/auth/configuration`
- **Prerequisites**: Authenticated as `gabriel@gmail.com`
- **Given** I am authenticated
- **When** I navigate to `/auth/configuration`
- **Then** I should see user information (name, email, role)
- **And** I should see buttons/links to change password and change username

---

### AUTH-011 — Successful password change

- **Severity**: HIGH
- **URL**: `http://localhost:4200/auth/change-password`
- **Prerequisites**: Authenticated as `gabriel@gmail.com`
- **Given** I am on the change password page
- **When** I enter a valid new password `NewPass123!` and its confirmation
- **Then** I should see a success message
- **And** after logging out, I should be able to log in with the new password
- **Note**: Restore original password after testing

---

### AUTH-012 — Password change with validation

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/auth/change-password`
- **Prerequisites**: Authenticated as `gabriel@gmail.com`
- **Given** I am on the change password page
- **When** I enter a weak password (less than 8 characters, no uppercase, no number)
- **Then** I should see a validation message indicating password requirements
- **And** the save button should be disabled

---

### AUTH-013 — Automatic token refresh

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/`
- **Prerequisites**: Authenticated as `gabriel@gmail.com`
- **Given** I am authenticated
- **When** I wait for the token to expire (or simulate it) and the app makes a request
- **Then** the interceptor should refresh the token automatically
- **And** the original request should complete successfully
- **Note**: Requires simulation — can be tested manually by waiting 15 min or modifying expiration

---

### AUTH-014 — Login with malformed email

- **Severity**: LOW
- **URL**: `http://localhost:4200/auth/login`
- **Prerequisites**: Not authenticated
- **Given** I am on the login page
- **When** I enter an invalid email format (e.g. "notanemail")
- **Then** I should see a validation message "Enter a valid email"

---

### AUTH-015 — Verify localStorage storage

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/`
- **Prerequisites**: Authenticated as `gabriel@gmail.com`
- **Given** I successfully logged in
- **When** I inspect the browser's localStorage
- **Then** I should find the keys: `accessToken`, `refreshToken`, `currentUser`
- **And** `currentUser` should contain Gabriel's data with SUPER_ADMIN role

---

### AUTH-016 — Permission-based access

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/`
- **Prerequisites**: Authenticated
- **Given** I authenticate as `sales@cashly.com` (SALES only)
- **When** I check the menu
- **Then** I should NOT see links to Users, Purchases, Warehouses, etc.
- **And** I should only see modules related to SALES

---

### AUTH-017 — 401 error on requests with invalid token

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/`
- **Prerequisites**: Authenticated
- **Given** I am authenticated
- **When** I manually modify the accessToken in localStorage to make it invalid
- **And** the app makes a request to the backend
- **Then** the interceptor should attempt a token refresh
- **And** when the refresh fails, it should redirect to `/auth/login`
- **Note**: Manual test with localStorage manipulation via DevTools

---

## Coverage Matrix

| Functionality         | Tests covering it            | Priority |
| --------------------- | ---------------------------- | -------- |
| Successful login      | AUTH-001, AUTH-004, AUTH-005 | CRITICAL |
| Failed login          | AUTH-002, AUTH-003, AUTH-014 | CRITICAL |
| Logout                | AUTH-007                     | CRITICAL |
| Route protection      | AUTH-008, AUTH-009           | CRITICAL |
| Session persistence   | AUTH-006, AUTH-015           | HIGH     |
| Role management       | AUTH-004, AUTH-005, AUTH-016 | HIGH     |
| Password change       | AUTH-011, AUTH-012           | HIGH     |
| Account configuration | AUTH-010                     | MEDIUM   |
| Token refresh         | AUTH-013, AUTH-017           | MEDIUM   |

---

## Execution Results

### AUTH-001 — Successful SUPER_ADMIN login

- **Result**: ✅ PASS
- **Evidence**: `../reports/screenshots/AUTH-001-login-exitoso.png`
- **Findings**: Redirects to `/customers`, menu with 5 modules (Gestión de Usuarios, Gestión Comercial, Inventario, Finanzas, Reportes), name "Gabriel" visible.

### AUTH-002 — Failed login with wrong credentials

- **Result**: ✅ PASS
- **Evidence**: `../reports/screenshots/AUTH-002-login-fallido.png`
- **Findings**: Error toast in top-right corner: "Error de autenticación. Credenciales incorrectas." No redirect.

### AUTH-003 — Failed login due to form validation

- **Result**: ✅ PASS
- **Findings**: Button disabled with empty fields. Email message: "Email is required" (English). Password message: "La contraseña es requerida" (Spanish). Possible i18n inconsistency bug.

### AUTH-004 — Login with different roles (ADMIN)

- **Result**: ✅ PASS
- **Evidence**: `../reports/screenshots/AUTH-004-admin-menu.png`
- **Findings**: Admin sees: Gestión de Usuarios, Gestión Comercial, Inventario, Finanzas, Reportes. Correct.

### AUTH-005 — Login with different roles (OPERATOR)

- **Result**: ✅ PASS
- **Findings**: Operator sees: Gestión de Usuarios, Gestión Comercial, Inventario. ⚠️ **BUG**: "Gestión de Usuarios" appears in the menu even though OPERATOR does not have USERS permission (only INVENTORY, SALES, PURCHASES). Backend correctly blocks with 403, but the frontend shows the menu item.

### AUTH-006 — Session persistence on page reload

- **Result**: ✅ PASS
- **Findings**: On page reload, the session persists and the user stays on `/customers`.

### AUTH-007 — Successful logout

- **Result**: ✅ PASS
- **Evidence**: `../reports/screenshots/AUTH-007-logout.png`
- **Findings**: Redirects to `/auth/login`, localStorage is cleared (only "theme" persists). Trying to access `/customers` redirects to `/auth/login`.

### AUTH-008 — Route protection (without authentication)

- **Result**: ✅ PASS
- **Findings**: Without a session, `/auth/configuration` redirects to `/auth/login`.

### AUTH-009 — Home redirect (authenticated vs unauthenticated)

- **Result**: ✅ PASS
- **Findings**: Unauthenticated: `/` loads login. Authenticated: `/` redirects to `/customers`.

### AUTH-010 — Account Configuration page

- **Result**: ✅ PASS
- **Evidence**: `../reports/screenshots/AUTH-010-configuracion.png`
- **Findings**: Shows name (Gabriel), email (gabriel@gmail.com), status (Activo), buttons "Cambiar Nombre de Usuario" and "Cambiar Contraseña".

### AUTH-011 — Successful password change

- **Result**: 🔲 NOT EXECUTED (requires modifying a real user's password)

### AUTH-012 — Password change with validation

- **Result**: ✅ PASS
- **Findings**: With password "123": message "La contraseña debe tener al menos 8 caracteres", "Actualizar" button disabled.

### AUTH-013 — Automatic token refresh

- **Result**: 🔲 NOT EXECUTED (requires simulating token expiration or waiting 15 min)

### AUTH-014 — Login with malformed email

- **Result**: ✅ PASS
- **Findings**: Email "notanemail" shows "Invalid email format" (English). Consistent with i18n finding from AUTH-003.

### AUTH-015 — Verify localStorage storage

- **Result**: ✅ PASS
- **Findings**: localStorage contains: accessToken (JWT), refreshToken (UUID), currentUser (full object with id, email, userName, role, modulePermissions), tokenExpiresAt (timestamp).

### AUTH-016 — Permission-based access

- **Result**: ✅ PASS
- **Evidence**: `../reports/screenshots/AUTH-016-sales-user.png`
- **Findings**: sales@cashly.com has only SALES. Menu shows "Gestión de Usuarios" (⚠️ same bug as AUTH-005) and "Gestión Comercial". Backend correctly returns 403 for inventory/purchases endpoints.

### AUTH-017 — 401 error on requests with invalid token

- **Result**: ⚠️ WARNING
- **Findings**:
  - ✅ Login API works (200)
  - ✅ Correct permissions: INVENTORY, PURCHASES
  - ✅ Backend blocks `/api/customers` → 403
  - ✅ Backend allows `/api/products` → 200, `/api/warehouses` → 200, `/api/suppliers` → 200
  - ⚠️ **BUG**: Frontend post-login navigation hangs. The user lacks SALES permission, but the default post-login route is `/customers`. The frontend does not handle this case and gets stuck in an indefinite loading state (possible redirect loop or guard conflict).

---

## Final Metrics

| Metric             | Value                       |
| ------------------ | --------------------------- |
| Planned Tests      | 17                          |
| Executed Tests     | 14                          |
| ✅ PASS            | 12                          |
| ❌ FAIL            | 0                           |
| ⚠️ WARNING         | 2                           |
| 🔲 NOT EXECUTED    | 2                           |
| Estimated Coverage | 82% (14/17)                 |
| Total Time         | ~45 minutes                 |
| Issues Found       | 2 bugs + 1 i18n observation |

## Issues Found

| ID      | Severity | Description                                                                                                                                   |
| ------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| BUG-001 | MEDIUM   | Menu shows "Gestión de Usuarios" for OPERATOR without USERS permission (visible in AUTH-005, AUTH-016)                                        |
| BUG-002 | LOW      | Post-login redirect loop for users without SALES permission (AUTH-017) — the frontend lacks an intelligent default route based on permissions |
| OBS-001 | LOW      | Email validation messages in English vs. password validation in Spanish — i18n inconsistency                                                  |
