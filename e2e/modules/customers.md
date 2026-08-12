# Test Plan — Customers (Clientes)

> Customer management module — CRUD, balance operations, warehouse access, and portal management.
> Version: 1.0 | Priority: CRITICAL

---

## Module Overview

The Customers module handles: listing/searching customers, creating, editing, viewing details, deleting customers, managing portal access/password, warehouse access, customer balance (advances, refunds, transactions), and credit status.

**Module Type**: CRUD with specialized sub-modules (Balance, Credit, Warehouse Access)

## Module Routes

| Route                    | Component                     | Guards                                | Module Permission |
| ------------------------ | ----------------------------- | ------------------------------------- | ----------------- |
| `/customers`             | CustomersListPageComponent    | `authGuard` + `modulePermissionGuard` | `SALES`           |
| `/customers/new`         | CustomersFormPageComponent    | Same                                  | `SALES`           |
| `/customers/:id`         | CustomersDetailsPageComponent | Same                                  | `SALES`           |
| `/customers/:id/edit`    | CustomersFormPageComponent    | Same + `pendingChangesGuard`          | `SALES`           |
| `/customers/:id/balance` | CustomerBalancePageComponent  | Same                                  | `FINANCE`         |

## Seed Users for Testing

| Email                   | Password           | Role        | Permissions                                                  |
| ----------------------- | ------------------ | ----------- | ------------------------------------------------------------ |
| `gabriel@gmail.com`     | `49510561Gabriel.` | SUPER_ADMIN | All modules                                                  |
| `superadmin@parsun.com` | `49510561Gabriel.` | SUPER_ADMIN | All modules                                                  |
| `admin@parsun.com`      | `49510561Gabriel.` | ADMIN       | USERS, INVENTORY, SALES, FINANCES, PURCHASES, DOCUMENT_ADMIN |
| `operator@parsun.com`   | `49510561Gabriel.` | OPERATOR    | INVENTORY, SALES, PURCHASES                                  |
| `sales@parsun.com`      | `49510561Gabriel.` | OPERATOR    | SALES                                                        |

## API Endpoints Reference

| Method | Endpoint                                                              | Auth Required | Min Role |
| ------ | --------------------------------------------------------------------- | ------------- | -------- |
| GET    | `/api/customers?search=&type=&active=&page=&size=&orderBy=&orderDir=` | SALES         | OPERATOR |
| GET    | `/api/customers/:id`                                                  | SALES         | OPERATOR |
| POST   | `/api/customers`                                                      | SALES         | OPERATOR |
| PUT    | `/api/customers/:id`                                                  | SALES         | OPERATOR |
| DELETE | `/api/customers/:id`                                                  | SALES         | ADMIN    |
| PUT    | `/api/customers/:id/portal-password`                                  | SALES         | ADMIN    |
| GET    | `/api/customers/:id/balance`                                          | FINANCES      | OPERATOR |
| GET    | `/api/customers/:id/balance/transactions?page=&size=`                 | FINANCES      | OPERATOR |
| POST   | `/api/customers/:id/balance/advance`                                  | FINANCES      | OPERATOR |
| POST   | `/api/customers/:id/balance/refund`                                   | FINANCES      | OPERATOR |
| GET    | `/api/customers/:id/credit`                                           | FINANCES      | OPERATOR |
| GET    | `/api/customers/credit/overdue`                                       | FINANCES      | OPERATOR |
| GET    | `/api/customers/:id/warehouses`                                       | INVENTORY     | OPERATOR |
| POST   | `/api/customers/:id/warehouses/:warehouseId`                          | INVENTORY     | ADMIN    |
| DELETE | `/api/customers/:id/warehouses/:warehouseId`                          | INVENTORY     | ADMIN    |

---

## Tests

### CUSTOMER-001 — List customers as SUPER_ADMIN

- **Severity**: CRITICAL
- **URL**: `http://localhost:4200/customers`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), at least one customer exists
- **Given** I am authenticated as SUPER_ADMIN
- **When** I navigate to `/customers`
- **Then** I should see a table with customers
- **And** columns should include: Code, Alias, Legal Name, RIF, Type, Active status, Actions
- **And** the API call `GET /api/customers` should return status 200
- **And** there should be no console errors

---

### CUSTOMER-002 — List customers empty state

- **Severity**: HIGH
- **URL**: `http://localhost:4200/customers`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), no customers match the filter
- **Given** I am authenticated as SUPER_ADMIN
- **When** I apply a search filter that matches no customers (e.g. `ZZZZNONEXISTENT`)
- **Then** I should see an empty state message like "No customers found"
- **And** the table should show an empty state

---

### CUSTOMER-003 — List customers pagination

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/customers`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), enough customers exist (>10)
- **Given** I am on the customers list page
- **When** I change the page size or navigate to the next page
- **Then** the table should show the correct number of rows
- **And** the API call should include `page` and `size` parameters

---

### CUSTOMER-004 — List customers sorting

- **Severity**: LOW
- **URL**: `http://localhost:4200/customers`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am on the customers list page
- **When** I click a column header (Legal Name, Code, RIF, Alias, Type)
- **Then** the list should sort by that column
- **And** the sort direction should toggle on subsequent clicks

---

### CUSTOMER-005 — Filter customers by type

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/customers`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), customers of different types exist
- **Given** I am on the customers list page
- **When** I filter by customer type (e.g., BUSINESS)
- **Then** the list should show only customers of that type
- **And** the API call should include the `type` query parameter

---

### CUSTOMER-006 — Filter customers by active/inactive status

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/customers`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), active and inactive customers exist
- **Given** I am on the customers list page
- **When** I filter by active status (Active / Inactive / All)
- **Then** the list should show only customers matching that status
- **And** the API call should include the `active` query parameter

---

### CUSTOMER-007 — Search customers by name/RIF/alias

- **Severity**: HIGH
- **URL**: `http://localhost:4200/customers`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am on the customers list page
- **When** I enter a search term in the search box (e.g., part of a legal name or RIF)
- **Then** the list should filter to matching customers
- **And** the API call should include the `search` query parameter

---

### CUSTOMER-008 — Create customer successfully

- **Severity**: CRITICAL
- **URL**: `http://localhost:4200/customers/new`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I navigate to `/customers/new`
- **When** I fill in all required fields in the General tab:
  - Legal Name: "Test Corp C.A."
  - RIF: "J-12345678-9"
  - Alias: "TestCorp"
  - Customer Type: "Jurídico"
  - Payment Type: "Contado"
  - Active: true
- **And** I fill in the Contact tab:
  - Email: "test@testcorp.com"
  - Phone: "0212-1234567"
- **And** I fill in the Addresses tab:
  - Address: "Av. Principal, Caracas"
  - Billing: true
  - Active: true
- **And** I submit the form
- **Then** the customer should be created and I should be redirected to `/customers`
- **And** the new customer should appear in the list
- **And** the API call `POST /api/customers` should return 201
- **Note**: Use a unique RIF like `J-{timestamp}-9` to avoid duplicates

---

### CUSTOMER-009 — Create customer validation (empty fields)

- **Severity**: HIGH
- **URL**: `http://localhost:4200/customers/new`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am on the create customer page
- **When** I click submit without filling any required fields
- **Then** I should see validation errors for: legalName, RIF, alias, customer type
- **And** the Contact tab should show errors: at least one email required, at least one phone required
- **And** the Addresses tab should show errors: at least one address required
- **And** no API call should be made

---

### CUSTOMER-010 — Create customer with duplicate RIF

- **Severity**: HIGH
- **URL**: `http://localhost:4200/customers/new`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), a customer with RIF `J-12345678-9` already exists
- **Given** I am on the create customer page
- **When** I enter a RIF that already exists (e.g., `J-12345678-9`)
- **Then** the API should return 409 (Conflict)
- **And** I should see an error message like "RIF already registered"

---

### CUSTOMER-011 — Create customer with invalid RIF format

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/customers/new`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am on the create customer page
- **When** I enter an invalid RIF format (e.g., "12345")
- **Then** I should see a validation error indicating invalid RIF format
- **And** no API call should be made

---

### CUSTOMER-012 — Create customer with invalid phone format

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/customers/new`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am on the create customer page (Contact tab)
- **When** I enter an invalid phone number (e.g., "abc")
- **Then** I should see a validation error indicating invalid phone format
- **And** no API call should be made

---

### CUSTOMER-013 — View customer details

- **Severity**: HIGH
- **URL**: `http://localhost:4200/customers/{id}`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), an existing customer ID available
- **Given** I am on the customers list page
- **When** I click "View" on a customer row (or navigate to `/customers/{id}`)
- **Then** I should see the customer's details: legalName, RIF, alias, type, payment type, credit days, credit limit, emails, phones, addresses
- **And** I should see action buttons: Edit, Delete (if allowed)
- **And** the API call `GET /api/customers/{id}` should return 200

---

### CUSTOMER-014 — Edit customer successfully

- **Severity**: HIGH
- **URL**: `http://localhost:4200/customers/{id}/edit`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), an existing customer ID available
- **Given** I navigate to the edit page for an existing customer
- **When** I change the legalName, alias, and add a new email/phone
- **And** I submit the form
- **Then** the customer should be updated
- **And** viewing the details page should reflect the new values
- **And** the API call `PUT /api/customers/{id}` should return 200

---

### CUSTOMER-015 — Edit customer — add address as billing unmarks previous billing

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/customers/{id}/edit`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), customer has at least one billing address
- **Given** I am editing a customer that has an existing billing address
- **When** I add a new address and mark it as billing
- **Then** only the new address should be marked as billing
- **And** the previous billing address should be automatically unmarked

---

### CUSTOMER-016 — Delete customer as SUPER_ADMIN

- **Severity**: CRITICAL
- **URL**: `http://localhost:4200/customers`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), a deletable customer exists (created during testing)
- **Given** I am on the customers list page
- **When** I click the delete button on a customer and confirm the dialog
- **Then** the customer should be removed from the list
- **And** the API call `DELETE /api/customers/{id}` should return 204

---

### CUSTOMER-017 — Delete customer as OPERATOR (blocked)

- **Severity**: HIGH
- **URL**: `http://localhost:4200/customers`
- **Prerequisites**: Authenticated as OPERATOR (`operator@parsun.com`)
- **Given** I am authenticated as OPERATOR
- **When** I call `DELETE /api/customers/{id}` directly
- **Then** the API should return 403 (Forbidden)
- **Note**: Frontend may or may not show the delete button based on role

---

### CUSTOMER-018 — Route protection (no auth)

- **Severity**: CRITICAL
- **URL**: `http://localhost:4200/customers`
- **Prerequisites**: Not authenticated
- **Given** I am NOT authenticated
- **When** I navigate to `/customers`
- **Then** I should be redirected to `/auth/login`

---

### CUSTOMER-019 — Route protection (insufficient module permission)

- **Severity**: CRITICAL
- **URL**: `http://localhost:4200/customers`
- **Prerequisites**: Authenticated as a user WITHOUT SALES permission
- **Given** I am authenticated as a user without SALES permission
- **When** I navigate to `/customers`
- **Then** the frontend guard should block access (redirect to `/`)

---

### CUSTOMER-020 — Permission enforcement: OPERATOR can view but not delete

- **Severity**: HIGH
- **URL**: `http://localhost:4200/customers`
- **Prerequisites**: Authenticated as OPERATOR (`operator@parsun.com`)
- **Given** I am authenticated as OPERATOR
- **When** I navigate to `/customers`
- **Then** I should see the customer list
- **And** I should NOT see a delete button (or it should be disabled)
- **When** I view a customer detail page
- **Then** I should see the customer information
- **And** I should NOT see a delete option
- **And** calling `DELETE /api/customers/{id}` directly should return 403

---

### CUSTOMER-021 — Permission enforcement: menu reflects SALES permission

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/`
- **Prerequisites**: Authenticated as a user WITH SALES permission
- **Given** I am authenticated as `operator@parsun.com` (has SALES)
- **When** I inspect the sidebar menu
- **Then** "Clientes" should be visible under "Gestión de Usuarios"

---

### CUSTOMER-022 — Change portal password as SUPER_ADMIN

- **Severity**: HIGH
- **URL**: `http://localhost:4200/customers/{id}`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), a customer with portalAccess=true
- **Given** I am on a customer's details page
- **When** I click the portal password change option and enter a valid new password
- **Then** the API call `PUT /api/customers/{id}/portal-password` should return 204
- **And** I should see a success message

---

### CUSTOMER-023 — Portal password validation (weak password)

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/customers/{id}`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am changing a customer's portal password
- **When** I enter a password with less than 8 characters
- **Then** I should see a validation error
- **And** the submit button should be disabled

---

### CUSTOMER-024 — Customer not found (404)

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/customers/nonexistent-id`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am authenticated
- **When** I navigate to `/customers/nonexistent-id` (a UUID that doesn't exist)
- **Then** I should see an error message or be redirected to the list
- **And** the API call `GET /api/customers/{nonexistent-id}` should return 404

---

### CUSTOMER-025 — View customer balance page

- **Severity**: HIGH
- **URL**: `http://localhost:4200/customers/{id}/balance`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), a customer with balance data
- **Given** I am on a customer's details page
- **When** I navigate to the balance section or `/customers/{id}/balance`
- **Then** I should see the balance summary (total balance)
- **And** I should see the transactions table with pagination
- **And** the API calls `GET /api/customers/{id}/balance` and `GET .../balance/transactions` should return 200

---

### CUSTOMER-026 — Create cash advance

- **Severity**: HIGH
- **URL**: `http://localhost:4200/customers/{id}/balance`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), an existing customer
- **Given** I am on the customer balance page
- **When** I register a cash advance with a positive amount
- **Then** the API call `POST /api/customers/{id}/balance/advance` should return 201
- **And** the balance should increase by the advance amount
- **And** a new transaction should appear in the transactions list

---

### CUSTOMER-027 — Create refund

- **Severity**: HIGH
- **URL**: `http://localhost:4200/customers/{id}/balance`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), customer has sufficient balance
- **Given** I am on the customer balance page
- **When** I register a refund with a positive amount
- **Then** the API call `POST /api/customers/{id}/balance/refund` should return 201
- **And** the balance should decrease by the refund amount

---

### CUSTOMER-028 — Advance with invalid amount

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/customers/{id}/balance`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am on the customer balance page
- **When** I try to create an advance with an amount of 0 or negative
- **Then** I should see a validation error
- **And** no API call should be made

---

### CUSTOMER-029 — Refund exceeding balance

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/customers/{id}/balance`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), customer has a known low balance
- **Given** I am on the customer balance page
- **When** I try to create a refund for an amount larger than the current balance
- **Then** the API should return 400 or 409 (bad request / conflict)
- **And** I should see an error message

---

### CUSTOMER-030 — List customers as OPERATOR (successful)

- **Severity**: HIGH
- **URL**: `http://localhost:4200/customers`
- **Prerequisites**: Authenticated as OPERATOR (`operator@parsun.com`) which has SALES
- **Given** I am authenticated as OPERATOR
- **When** I navigate to `/customers`
- **Then** I should see the customer list
- **And** the API call should return 200
- **Note**: Validates that OPERATOR with SALES permission can access customers

---

### CUSTOMER-031 — Customer list filters: clear all filters

- **Severity**: LOW
- **URL**: `http://localhost:4200/customers`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I have applied multiple filters on the customers list
- **When** I click "Clear Filters" or reset button
- **Then** all filters should be cleared
- **And** the list should show all customers (default active=true)

---

### CUSTOMER-032 — Create customer with credit payment type

- **Severity**: HIGH
- **URL**: `http://localhost:4200/customers/new`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am on the create customer page
- **When** I select Payment Type "Crédito"
- **Then** Credit Days and Credit Limit fields should become enabled/visible
- **When** I enter valid credit days (e.g., 30) and credit limit (e.g., 5000)
- **And** fill all other required fields and submit
- **Then** the customer should be created with credit terms
- **And** viewing the details should show PaymentType as CREDIT, creditDays=30, creditLimit=5000

---

### CUSTOMER-033 — Create customer as OPERATOR

- **Severity**: HIGH
- **URL**: `http://localhost:4200/customers/new`
- **Prerequisites**: Authenticated as OPERATOR (`operator@parsun.com`)
- **Given** I am authenticated as OPERATOR
- **When** I navigate to `/customers/new`
- **Then** I should see the create customer form
- **When** I fill valid data and submit
- **Then** the customer should be created (OPERATOR can create)
- **And** the API call should return 201

---

### CUSTOMER-034 — Credit days validation (out of range)

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/customers/new`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am on the create customer page with Credit payment type selected
- **When** I enter a negative number for credit days
- **Then** I should see a validation error "Credit days must be 0-365"
- **When** I enter 400 for credit days
- **Then** I should see a validation error "Credit days must be 0-365"

---

### CUSTOMER-035 — Credit limit validation (negative)

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/customers/new`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am on the create customer page with Credit payment type selected
- **When** I enter a negative number for credit limit
- **Then** I should see a validation error "Credit limit must be non-negative"

---

### CUSTOMER-036 — Legal name validation (too short)

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/customers/new`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am on the create customer page
- **When** I enter a legal name with fewer than 2 characters
- **Then** I should see a validation error indicating minimum length

---

### CUSTOMER-037 — Form tab navigation preserves data

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/customers/new`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am on the create customer page
- **When** I fill some fields in the General tab
- **And** I navigate to the Contact tab and back to General
- **Then** the previously entered data should still be present

---

### CUSTOMER-038 — Pending changes guard on edit

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/customers/{id}/edit`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I have unsaved changes on the edit customer form
- **When** I try to navigate away
- **Then** I should see a confirmation dialog asking if I want to discard changes

---

### CUSTOMER-039 — Permission enforcement: OPERATOR block on portal password

- **Severity**: HIGH
- **URL**: `/api/customers/{id}/portal-password`
- **Prerequisites**: Authenticated as OPERATOR (`operator@parsun.com`)
- **Given** I am authenticated as OPERATOR
- **When** I call `PUT /api/customers/{id}/portal-password`
- **Then** the API should return 403 (Forbidden)
- **Note**: Portal password change requires ADMIN role

---

### CUSTOMER-040 — Create customer with portal access enabled

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/customers/new`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am on the create customer page
- **When** I check "Portal Access" option in the Portal tab
- **And** I fill all other required fields and submit
- **Then** the customer should be created with portalAccess=true
- **And** viewing the details should show Portal Access as enabled

---

### CUSTOMER-041 — Customer details shows warehouse access section

- **Severity**: MEDIUM
- **URL**: `http://localhost:4200/customers/{id}`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), an existing customer
- **Given** I am on a customer's details page
- **Then** I should see a "Warehouse Access" section
- **And** the API call `GET /api/customers/{id}/warehouses` should return 200

---

### CUSTOMER-042 — List customers with mobile responsive view

- **Severity**: LOW
- **URL**: `http://localhost:4200/customers`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I am on the customers list page
- **When** I resize the browser to mobile width (< 768px)
- **Then** I should see a card-based layout instead of a table
- **And** the customer information should still be readable

---

### CUSTOMER-043 — API returns 404 for non-existent customer

- **Severity**: MEDIUM
- **URL**: (API only)
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`)
- **Given** I have a valid session
- **When** I call `GET /api/customers/00000000-0000-0000-0000-000000000000`
- **Then** the API should return 404 Not Found

---

### CUSTOMER-044 — Balance route protected by FINANCE module permission

- **Severity**: HIGH
- **URL**: `http://localhost:4200/customers/{id}/balance`
- **Prerequisites**: Authenticated as a user WITHOUT FINANCE permission
- **Given** I am authenticated as `operator@parsun.com` (has SALES but NOT FINANCE)
- **When** I navigate directly to `/customers/{id}/balance`
- **Then** the frontend guard should block access
- **Note**: The balance route has `module: BusinessModule.FINANCE` in its data

---

### CUSTOMER-045 — Empty transactions state

- **Severity**: LOW
- **URL**: `http://localhost:4200/customers/{id}/balance`
- **Prerequisites**: Authenticated as SUPER_ADMIN (`gabriel@gmail.com`), customer with zero balance and no transactions
- **Given** I am on the customer balance page
- **Then** I should see an empty state for transactions (e.g., "No transactions found")

---

## Coverage Matrix

| Functionality          | Tests covering it                                                                  | Priority |
| ---------------------- | ---------------------------------------------------------------------------------- | -------- |
| List customers         | CUSTOMER-001, CUSTOMER-030                                                         | CRITICAL |
| Empty state            | CUSTOMER-002                                                                       | HIGH     |
| Pagination             | CUSTOMER-003                                                                       | MEDIUM   |
| Sorting                | CUSTOMER-004                                                                       | LOW      |
| Type filter            | CUSTOMER-005                                                                       | MEDIUM   |
| Active filter          | CUSTOMER-006                                                                       | MEDIUM   |
| Search                 | CUSTOMER-007                                                                       | HIGH     |
| Create customer        | CUSTOMER-008, CUSTOMER-032, CUSTOMER-033, CUSTOMER-040                             | CRITICAL |
| Create validation      | CUSTOMER-009, CUSTOMER-011, CUSTOMER-012, CUSTOMER-034, CUSTOMER-035, CUSTOMER-036 | HIGH     |
| Duplicate RIF          | CUSTOMER-010                                                                       | HIGH     |
| View details           | CUSTOMER-013                                                                       | HIGH     |
| Edit customer          | CUSTOMER-014, CUSTOMER-015                                                         | HIGH     |
| Delete customer        | CUSTOMER-016, CUSTOMER-017                                                         | CRITICAL |
| Route protection       | CUSTOMER-018, CUSTOMER-019                                                         | CRITICAL |
| Permission enforcement | CUSTOMER-020, CUSTOMER-021, CUSTOMER-039, CUSTOMER-044                             | CRITICAL |
| Portal password        | CUSTOMER-022, CUSTOMER-023                                                         | HIGH     |
| 404 handling           | CUSTOMER-024, CUSTOMER-043                                                         | MEDIUM   |
| Customer balance       | CUSTOMER-025, CUSTOMER-026, CUSTOMER-027, CUSTOMER-045                             | HIGH     |
| Balance validation     | CUSTOMER-028, CUSTOMER-029                                                         | MEDIUM   |
| Filter reset           | CUSTOMER-031                                                                       | LOW      |
| Form UX                | CUSTOMER-037, CUSTOMER-038, CUSTOMER-042                                           | MEDIUM   |
| Warehouse access       | CUSTOMER-041                                                                       | MEDIUM   |

---

## Execution Results

_To be filled after test execution._

| Metric          | Value |
| --------------- | ----- |
| Planned Tests   | 45    |
| Executed Tests  |       |
| ✅ PASS         |       |
| ❌ FAIL         |       |
| ⚠️ WARNING      |       |
| 🔲 NOT EXECUTED |       |
| Issues Found    |       |
