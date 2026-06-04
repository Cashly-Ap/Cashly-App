import { AdvanceStatus } from '../enums';

export interface AdvanceList {
  id: string;
  advanceNumber: string;
  amount: number;
  remainingAmount: number;
  status: AdvanceStatus;
  notes: string | null;
  createdAt: string;
}

export interface AdvanceConsumption {
  id: string;
  advanceId: string;
  invoiceId: string;
  amount: number;
  paymentId: string | null;
  createdAt: string;
}

export interface AdvanceDetail {
  id: string;
  advanceNumber: string;
  customerId: string;
  amount: number;
  remainingAmount: number;
  status: AdvanceStatus;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  consumptions: AdvanceConsumption[];
}

export interface AdvanceCreate {
  customerId: string;
  amount: number;
  notes?: string;
}

export interface AdvanceApply {
  invoiceId: string;
  amount: number;
}
