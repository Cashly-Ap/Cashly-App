import { Injectable } from '@angular/core';
import {
  SupplierList,
  SupplierDetails,
  SupplierCreate,
  SupplierEdit,
} from '@features/suppliers/models/interfaces';

export interface SupplierFormModel {
  id?: string;
  code?: number;
  legalName: string;
  type: string;
  rif: string;
  alias: string;
  active: boolean;
  emails: Array<{ id?: string; supplierId?: string; email: string }>;
  phones: Array<{ id?: string; supplierId?: string; phone: string }>;
  addresses: Array<{
    id?: string;
    supplierId?: string;
    address: string;
    billing: boolean;
    active: boolean;
    state?: string;
    municipality?: string;
    postalCode?: string;
  }>;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class SupplierMapper {
  toList(details: SupplierDetails): SupplierList {
    return {
      id: details.id,
      code: details.code,
      alias: details.alias,
      legalName: details.legalName,
      rif: details.rif,
      type: details.type,
      active: details.active,
      hasPurchases: false,
    };
  }

  toFormModel(details: SupplierDetails): SupplierFormModel {
    return {
      id: details.id,
      code: details.code,
      legalName: details.legalName,
      type: details.type,
      rif: details.rif,
      alias: details.alias,
      active: details.active,
      emails: details.emails.map((e) => ({ id: e.id, supplierId: e.supplierId, email: e.email })),
      phones: details.phones.map((p) => ({ id: p.id, supplierId: p.supplierId, phone: p.phone })),
      addresses: details.addresses.map((a) => ({
        id: a.id,
        supplierId: a.supplierId,
        address: a.address,
        billing: a.billing,
        active: a.active,
        state: a.state,
        municipality: a.municipality,
        postalCode: a.postalCode,
      })),
      notes: details.notes,
    };
  }

  toCreateRequest(form: SupplierFormModel): SupplierCreate {
    return {
      legalName: form.legalName,
      type: form.type as SupplierCreate['type'],
      rif: form.rif,
      alias: form.alias,
      active: form.active ?? true,
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
    };
  }

  toUpdateRequest(form: SupplierFormModel): SupplierEdit {
    return {
      id: form.id!,
      legalName: form.legalName,
      type: form.type as SupplierEdit['type'],
      rif: form.rif,
      alias: form.alias,
      active: form.active ?? true,
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
    };
  }
}
