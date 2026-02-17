// Compliance Types

export type FilingType = 'PF' | 'ESI' | 'TDS' | 'PT' | 'GST';
export type FilingStatus = 'PENDING' | 'FILED' | 'OVERDUE';

export interface FilingRecord {
  id: string;
  type: FilingType;
  period: string;
  dueDate: string;
  filedDate?: string;
  status: FilingStatus;
  amount?: number;
  referenceNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyAcknowledgement {
  id: string;
  employeeId: string;
  policyName: string;
  acknowledgedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ComplianceDashboard {
  filings: {
    pending: number;
    filedThisMonth: number;
    upcoming: FilingRecord[];
  };
  policies: {
    name: string;
    acknowledgedCount: number;
  }[];
  recentAcknowledgements: PolicyAcknowledgement[];
}

export interface CreateFilingDto {
  type: FilingType;
  period: string;
  dueDate: string;
  amount?: number;
}
