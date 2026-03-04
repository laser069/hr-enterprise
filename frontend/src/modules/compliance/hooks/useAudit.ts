import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../services/audit.api';

export const auditKeys = {
    all: ['audit'] as const,
    logs: (params?: any) => [...auditKeys.all, 'logs', params] as const,
    entity: (entity: string, entityId?: string) => [...auditKeys.all, 'entity', entity, entityId] as const,
};

export function useAuditLogs(params?: {
    skip?: number;
    take?: number;
    userId?: string;
    entity?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
}) {
    return useQuery({
        queryKey: auditKeys.logs(params),
        queryFn: () => auditApi.getLogs(params),
    });
}

export function useEntityAuditLogs(entity: string, entityId?: string) {
    return useQuery({
        queryKey: auditKeys.entity(entity, entityId),
        queryFn: () => auditApi.getEntityLogs(entity, entityId),
        enabled: !!entity,
    });
}
