import { apiClient } from '../../../core/api/api-client';

export const bankingApi = {
    initiateTransfer: async (runId: string) => {
        const response: any = await apiClient.post(`/payroll/runs/${runId}/initiate-transfer`);
        return response.data;
    },

    getPayoutStatus: async (entryId: string) => {
        const response: any = await apiClient.get(`/payroll/entries/${entryId}/payout-status`);
        return response.data;
    },
};
