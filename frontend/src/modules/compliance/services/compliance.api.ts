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

  fileFiling: (id: string, data: { filedDate: string; referenceNumber: string }): Promise<FilingRecord> => {
    return apiClient.post<FilingRecord>(`/compliance/filings/${id}/file`, data);
  },

  getDashboard: (): Promise<ComplianceDashboard> => {
    return apiClient.get<ComplianceDashboard>('/compliance/dashboard');
  },

  // Acknowledgements
  getAcknowledgements: (): Promise<PolicyAcknowledgement[]> => {
    return apiClient.get<PolicyAcknowledgement[]>('/compliance/acknowledgements');
  },

  getUpcomingFilings: (): Promise<FilingRecord[]> => {
    return apiClient.get<FilingRecord[]>('/compliance/filings/upcoming');
  },

  createAcknowledgement: (data: { employeeId: string; policyName: string }): Promise<PolicyAcknowledgement> => {
    return apiClient.post<PolicyAcknowledgement>('/compliance/acknowledgements', data);
  },
};
