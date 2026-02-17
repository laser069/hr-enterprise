import { apiClient } from '../../../core/api/api-client';
import type { ExecutiveSummary } from '../types';

export const executiveApi = {
  // Get executive summary from analytics endpoint
  getExecutiveSummary: async (): Promise<ExecutiveSummary> => {
    const rawData = await apiClient.get<Record<string, unknown>>('/analytics/executive-summary');
    const data = rawData as {
      employees?: { total?: number; active?: number };
      leave?: { pendingRequests?: number };
      payroll?: { pendingRuns?: number };
      attendance?: { present?: number; absent?: number; late?: number; onLeave?: number; totalEmployees?: number };
    };
    
    // Transform backend nested structure to frontend flat interface
    return {
      totalEmployees: data.employees?.total ?? 0,
      activeEmployees: data.employees?.active ?? 0,
      newJoinings: 0,
      attritionCount: 0,
      pendingLeaveRequests: data.leave?.pendingRequests ?? 0,
      pendingApprovals: data.payroll?.pendingRuns ?? 0,
      attendanceSummary: {
        present: data.attendance?.present ?? 0,
        absent: data.attendance?.absent ?? 0,
        late: data.attendance?.late ?? 0,
        onLeave: data.attendance?.onLeave ?? 0,
        totalEmployees: data.attendance?.totalEmployees ?? 0,
      },
      departmentBreakdown: [],
    };
  },
};