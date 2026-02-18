import { apiClient } from '../../../core/api/api-client';
import type { FilingRecord, PolicyAcknowledgement, ComplianceDashboard, CreateFilingDto } from '../types';

export const complianceApi = {
  // Filings
  getFilings: (): Promise<FilingRecord[]> => {
    return apiClient.get<FilingRecord[]>('/compliance/filings');
  },

  createFiling: (data: CreateFilingDto): Promise<FilingRecord> => {
    return apiClient.post<FilingRecord>('/compliance/filings', data);
  },

  fileFiling: (id: string, receiptNo: string): Promise<FilingRecord> => {
    return apiClient.post<FilingRecord>(`/compliance/filings/${id}/file`, { receiptNo });
  },

  getFiling: (id: string): Promise<FilingRecord> => {
    return apiClient.get<FilingRecord>(`/compliance/filings/${id}`);
  },

  acknowledgeFiling: (id: string): Promise<FilingRecord> => {
    return apiClient.post<FilingRecord>(`/compliance/filings/${id}/acknowledge`);
  },

  getDashboard: (): Promise<ComplianceDashboard> => {
    return apiClient.get<ComplianceDashboard>('/compliance/dashboard');
  },

  // Acknowledgements
  getAcknowledgements: (params?: { employeeId?: string; policyName?: string }): Promise<PolicyAcknowledgement[]> => {
    return apiClient.get<PolicyAcknowledgement[]>('/compliance/policies/acknowledgements', { params });
  },

  getUpcomingFilings: (): Promise<FilingRecord[]> => {
    return apiClient.get<FilingRecord[]>('/compliance/filings/upcoming');
  },

  createAcknowledgement: (data: { employeeId: string; policyName: string }): Promise<PolicyAcknowledgement> => {
    return apiClient.post<PolicyAcknowledgement>('/compliance/policies/acknowledge', data);
  },

  getPolicyReport: (policyName: string): Promise<any> => {
    return apiClient.get(`/compliance/policies/${policyName}/report`);
  },
};
