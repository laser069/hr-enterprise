import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeApi } from '../services/employee.api';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { User, ChevronDown, ChevronRight, Building } from 'lucide-react';

interface OrgNode {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  department?: {
    name: string;
  };
  subordinates?: OrgNode[];
}

const OrgTreeNode = ({ node, level = 0 }: { node: OrgNode; level?: number }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.subordinates && node.subordinates.length > 0;

  return (
    <div className="flex flex-col items-center">
      <Card className={`p-4 w-64 mb-4 border-l-4 ${level === 0 ? 'border-l-blue-500' : 'border-l-slate-300'} relative group hover:shadow-lg transition-shadow`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate" title={`${node.firstName} ${node.lastName}`}>
              {node.firstName} {node.lastName}
            </h4>
            <p className="text-xs text-slate-500 mb-1">{node.employeeCode}</p>
            {node.department && (
              <div className="flex items-center text-xs text-blue-600">
                <Building className="w-3 h-3 mr-1" />
                <span className="truncate">{node.department.name}</span>
              </div>
            )}
          </div>
        </div>
        
        {hasChildren && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors z-10"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
          </button>
        )}
      </Card>

      {hasChildren && isExpanded && (
        <div className="flex flex-col items-center relative">
          <div className="w-px h-8 bg-slate-300"></div>
          <div className="flex gap-8 items-start relative pt-4">
             {/* Horizontal connector line */}
            {node.subordinates!.length > 1 && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[calc(100%-16rem)] h-px bg-slate-300 hidden md:block"></div>
            )}
            
            <div className="flex flex-wrap justify-center gap-8">
                {node.subordinates!.map((child) => (
                    <div key={child.id} className="relative flex flex-col items-center">
                         {/* Vertical connector for child */}
                        <div className="w-px h-4 bg-slate-300 absolute -top-4"></div>
                        <OrgTreeNode node={child} level={level + 1} />
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrgChartPage = () => {
  const { data: roots, isLoading, error } = useQuery({
    queryKey: ['org-chart'],
    queryFn: () => employeeApi.getHierarchy(),
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading organization chart...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load organization chart</div>;

  // Check if API returns an array (roots) or a single object (hierarchy)
  // Our backend now returns roots[] from getCompanyHierarchy
  const orgData = Array.isArray(roots) ? roots : [roots];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Organization Chart</h1>
            <p className="text-slate-500 dark:text-slate-400">Visual hierarchy of the organization</p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>Export / Print</Button>
      </div>

      <div className="overflow-auto pb-20 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-8 min-h-[600px] flex justify-center">
        {orgData?.length === 0 ? (
            <div className="text-center text-slate-500 mt-20">No data available</div>
        ) : (
             <div className="flex gap-16">
                {orgData.map((node: OrgNode) => (
                    <OrgTreeNode key={node.id} node={node} />
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default OrgChartPage;
