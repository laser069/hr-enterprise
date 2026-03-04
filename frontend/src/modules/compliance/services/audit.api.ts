import { apiClient } from '../../../core/api/api-client';

export interface AuditLog {
    id: string;
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
    user?: {
        email: string;
    };
}

export const auditApi = {
    getLogs: (params?: {
        skip?: number;
        take?: number;
        userId?: string;
        entity?: string;
        action?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{ data: AuditLog[]; meta: any }> => {
        return apiClient.get('/audit', { params });
    },

    getEntityLogs: (entity: string, entityId?: string): Promise<AuditLog[]> => {
        return apiClient.get(`/audit/entity/${entity}`, { params: { entityId } });
    },
};
