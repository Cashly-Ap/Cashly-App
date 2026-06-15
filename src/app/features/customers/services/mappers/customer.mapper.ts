import { Injectable } from '@angular/core';
import { CustomerList, CustomerDetails, CustomerCreate, CustomerEdit } from '@features/customers/models/interfaces';

export interface CustomerFormModel {
  id?: string;
  code?: number;
  legalName: string;
  type: string;
  rif: string;
  alias: string;
  creditDays: number | null;
  creditLimit: number | null;
  active: boolean;
  portalAccess: boolean;
  emails: Array<{ id?: string; customerId?: string; email: string }>;
  phones: Array<{ id?: string; customerId?: string; phone: string }>;
  addresses: Array<{
    id?: string;
    customerId?: string;
    address: string;
    billing: boolean;
    active: boolean;
    state?: string;
    municipality?: string;
    postalCode?: string;
  }>;
  notes?: string;
  priceTypeId?: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerMapper {
  toList(details: CustomerDetails): CustomerList {
    return {
      id: details.id,
      code: details.code,
      alias: details.alias,
      legalName: details.legalName,
      rif: details.rif,
      type: details.type,
      active: details.active,
      portalAccess: details.portalAccess ?? false,
    };
  }

  toFormModel(details: CustomerDetails): CustomerFormModel {
    return {
      id: details.id,
      code: details.code,
      legalName: details.legalName,
      type: details.type,
      rif: details.rif,
      alias: details.alias,
      creditDays: details.creditDays,
      creditLimit: details.creditLimit,
      active: details.active,
      portalAccess: details.portalAccess ?? false,
      emails: details.emails.map((e) => ({ id: e.id, customerId: e.customerId, email: e.email })),
      phones: details.phones.map((p) => ({ id: p.id, customerId: p.customerId, phone: p.phone })),
      addresses: details.addresses.map((a) => ({
        id: a.id,
        customerId: a.customerId,
        address: a.address,
        billing: a.billing,
        active: a.active,
        state: a.state,
        municipality: a.municipality,
        postalCode: a.postalCode,
      })),
      notes: details.notes,
      priceTypeId: details.priceTypeId,
    };
  }

  toCreateRequest(form: CustomerFormModel): CustomerCreate {
    return {
      legalName: form.legalName,
      type: form.type as CustomerCreate['type'],
      rif: form.rif,
      alias: form.alias,
      creditDays: form.creditDays ?? 0,
      creditLimit: form.creditLimit ?? 0,
      active: form.active ?? true,
      portalAccess: form.portalAccess || false,
      emails: form.emails.map((e) => ({ email: e.email })),
      phones: form.phones.map((p) => ({ phone: p.phone })),
      addresses: form.addresses.map((a) => ({
        address: a.address,
        billing: a.billing,
        active: a.active,
        state: a.state,
        municipality: a.municipality,
        postalCode: a.postalCode,
      })),
      notes: form.notes || undefined,
      priceTypeId: form.priceTypeId || undefined,
    };
  }

  toUpdateRequest(form: CustomerFormModel): CustomerEdit {
    return {
      id: form.id!,
      legalName: form.legalName,
      type: form.type as CustomerEdit['type'],
      rif: form.rif,
      alias: form.alias,
      creditDays: form.creditDays ?? 0,
      creditLimit: form.creditLimit ?? 0,
      active: form.active ?? true,
      portalAccess: form.portalAccess || false,
      emails: form.emails.map((e) => ({ email: e.email })),
      phones: form.phones.map((p) => ({ phone: p.phone })),
      addresses: form.addresses.map((a) => ({
        address: a.address,
        billing: a.billing,
        active: a.active,
        state: a.state,
        municipality: a.municipality,
        postalCode: a.postalCode,
      })),
      notes: form.notes || undefined,
      priceTypeId: form.priceTypeId || undefined,
    };
  }
}
