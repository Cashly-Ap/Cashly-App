# Company Module

## Overview

The Company module manages the organization's identity: legal and trade name, tax ID, contact channels, registered address, and the logos used in the application and generated PDF documents.

It is a single-record settings module: there is a read-only details page and an edit page. There is no list, create, or delete flow.

**Module Type**: `Special` (single-record settings)

---

## Module Structure

```
src/app/features/platform/company/
├── company-details.component.ts    # Read-only company view
├── company-details.component.html
├── company-page.component.ts       # Edit form and logo management
├── company-page.component.html
├── company.service.ts              # HTTP calls and logo URL state
├── company.service.spec.ts
├── i18n/                           # en.json, es.json
└── permissions/                    # CompanyPermission constants
```

---

## Routes

| Route                    | Component                 | Permission     |
| ------------------------ | ------------------------- | -------------- |
| `/platform/company`      | `CompanyDetailsComponent` | `COMPANY_VIEW` |
| `/platform/company/edit` | `CompanyPageComponent`    | `COMPANY_EDIT` |

Both routes use `authGuard` and `modulePermissionGuard`.

---

## Features

- Read-only company details grouped into identity, tax, address, and contact cards
- Edit form for legal data, contact channels, and address
- Company logo upload and removal
- PDF document logo upload and removal
- PDF logo preview against a sample document before saving
- Automatic image optimization on the backend
- Permission-based edit action visibility
- Audit trail access from the details actions menu, the edit page, and the `Plataforma → Compañía → Historial` menubar entry (entity type `COMPANY`)
- Redirect to the details page after a successful save

---

## Data Models

```typescript
export interface Company {
  id: string;
  legalName: string;
  tradeName: string | null;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: {
    street: string | null;
    city: string | null;
    region: string | null;
    country: string | null;
    postalCode: string | null;
  } | null;
  logoPath: string | null;
  pdfLogoPath?: string | null;
}
```

The update payload omits `id`, `logoPath`, and `pdfLogoPath`.

---

## API Endpoints

Base path: `${environment.apiUrl}/company`, i.e. `/api/company` in development.

| Method | Endpoint                        | Description                                     |
| ------ | ------------------------------- | ----------------------------------------------- |
| GET    | `/api/company`                  | Load the company record                         |
| PUT    | `/api/company`                  | Update company data                             |
| GET    | `/api/company/logo`             | Download the company logo as a blob             |
| POST   | `/api/company/logo`             | Upload the company logo (`multipart/form-data`) |
| DELETE | `/api/company/logo`             | Remove the company logo                         |
| GET    | `/api/company/pdf-logo`         | Download the PDF logo as a blob                 |
| POST   | `/api/company/pdf-logo`         | Upload the PDF logo (`multipart/form-data`)     |
| DELETE | `/api/company/pdf-logo`         | Remove the PDF logo                             |
| POST   | `/api/company/pdf-logo/preview` | Generate a sample PDF with the candidate logos  |

Preview payload (multipart): `file` (optional PDF logo), `companyLogo` (optional company logo), `removePdfLogo`, `removeLogo`. The response is a PDF blob shown in the shared PDF viewer dialog.

---

## Validation Rules

| Field        | Rules                                     |
| ------------ | ----------------------------------------- |
| `legalName`  | Required, non-blank, max 200 characters   |
| `tradeName`  | Optional, max 200 characters              |
| `taxId`      | Optional, max 50 characters               |
| `email`      | Optional, valid email, max 254 characters |
| `phone`      | Optional, max 30 characters               |
| `website`    | Optional, max 255 characters              |
| `street`     | Optional, max 200 characters              |
| `city`       | Optional, max 100 characters              |
| `region`     | Optional, max 100 characters              |
| `country`    | Optional, max 100 characters              |
| `postalCode` | Optional, max 20 characters               |
| Logo images  | PNG or JPG; validated by the API          |

Empty text fields are trimmed and sent as `null`.

---

## Business Rules

1. There is exactly one company record per installation.
2. `legalName` is the only required field; the API remains the source of truth for persistence errors.
3. Saving the form updates the company data first, then applies a logo upload, logo removal, PDF-logo upload, or PDF-logo removal in that order.
4. A partial failure keeps the user on the edit page with an error message; already-persisted data is not rolled back.
5. The company logo is used as a fallback when no PDF-specific logo exists; if neither exists, PDFs use a logo placeholder.
6. Logo images are optimized by the backend (empty margins cropped, proportions preserved).
7. `CompanyService` caches both logo blobs as object URLs and revokes them when replaced or cleared.

---

## Permissions

| Code           | Purpose                               |
| -------------- | ------------------------------------- |
| `COMPANY_VIEW` | Access the company details page       |
| `COMPANY_EDIT` | Access the edit page and save changes |

The edit button is only rendered when the user has `COMPANY_EDIT`. Audit history links are only rendered when the user has the audit list permission.

---

## Related Modules

- [Auth](./auth.md) - Authentication and permission checks
- [Users, Roles and Departments](./users.md) - Platform administration
- [Reporting](./reports.md) - PDFs use the company and PDF logos

---

**Last Updated**: 2026-11-03

**Module Status**: [ ] Planned | [ ] In Development | [x] Implemented
