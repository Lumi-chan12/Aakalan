import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Clock,
  AlertTriangle,
  History,
  CheckCircle2,
  FileSearch,
  Search,
  Filter,
  Eye,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { Application } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { KPICard } from '../../components/common/KPICard';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { ApplicationDetailModal } from '../../components/common/ApplicationDetailModal';

interface ScrutinyPortalProps {
  viewMode?: 'dashboard' | 'assigned' | 'pending' | 'rescrutiny' | 'returned' | 'completed' | 'deadlines' | 'activity';
}

export const ScrutinyPortal: React.FC<ScrutinyPortalProps> = ({ viewMode = 'dashboard' }) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getApplications({
        assignedToMe: 'true',
        search: search || undefined,
      });
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  // Scrutiny specific filter buckets
  const pendingScrutiny = applications.filter((a) => a.currentStage === 'SCRUTINY' && a.stageStatus !== 'COMPLETED' && a.stageStatus !== 'RETURNED');
  const rescrutinyCases = applications.filter((a) => a.stageStatus === 'RESUBMITTED');
  const returnedCases = applications.filter((a) => a.stageStatus === 'RETURNED' || a.currentStage === 'DEFICIENCY_CORRECTION');
  const completedCases = applications.filter((a) => a.timeline.some((t) => t.action === 'COMPLETE_SCRUTINY') || a.overallStatus === 'Approved');
  const overdueCases = applications.filter((a) => a.isOverdue);
  const deadlinesNearing = applications.filter((a) => {
    const diff = new Date(a.dueDate).getTime() - Date.now();
    return diff > 0 && diff < 5 * 86400000;
  });

  const getFilteredList = () => {
    switch (viewMode) {
      case 'assigned':
        return applications;
      case 'pending':
        return pendingScrutiny;
      case 'rescrutiny':
        return rescrutinyCases;
      case 'returned':
        return returnedCases;
      case 'completed':
        return completedCases;
      case 'deadlines':
        return [...overdueCases, ...deadlinesNearing];
      default:
        return applications;
    }
  };

  const listToRender = getFilteredList();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#27232C]">
              Technical Scrutiny Officer Desk
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF8EB] text-[#8A5B00] border border-[#F7D488]">
              {user?.name}
            </span>
          </div>
          <p className="text-xs text-[#77727E] mt-0.5">
            Evaluate submitted institutional dossiers, verify lease & fire certificates, record deficiencies, and recommend EVC or approval.
          </p>
        </div>
      </div>

      {/* KPI Cards (Always visible on dashboard or top overview) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <KPICard
          title="Assigned to Me"
          value={applications.length}
          subtitle="My Work Queue"
          icon={ClipboardList}
          highlightColor="aubergine"
        />
        <KPICard
          title="Pending Scrutiny"
          value={pendingScrutiny.length}
          subtitle="Awaiting Desk Check"
          icon={FileSearch}
          highlightColor="marigold"
        />
        <KPICard
          title="Nearing Deadline"
          value={deadlinesNearing.length}
          subtitle="Within 5 Days"
          icon={Clock}
          highlightColor="warning"
        />
        <KPICard
          title="Overdue Assigned"
          value={overdueCases.length}
          subtitle="Exceeded SLA"
          icon={AlertTriangle}
          highlightColor="error"
        />
        <KPICard
          title="Awaiting Resubmission"
          value={returnedCases.length}
          subtitle="With Institution"
          icon={History}
          highlightColor="warning"
        />
        <KPICard
          title="Recently Cleared"
          value={completedCases.length}
          subtitle="Forwarded Ahead"
          icon={CheckCircle2}
          highlightColor="success"
        />
      </div>

      {/* Main Scrutiny Work Items Table */}
      <div className="bg-white rounded-xl border border-[#D9D8DE] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E9EAEE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#27232C] capitalize">
              {viewMode === 'dashboard' ? 'My Assigned Applications Worklist' : `${viewMode.replace('_', ' ')} Cases`}
            </h3>
            <p className="text-xs text-[#77727E]">Click on any case to inspect documents, raise deficiencies, or complete scrutiny</p>
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#77727E]" />
            <input
              type="text"
              placeholder="Search assigned cases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#F4F5F8] border border-[#D9D8DE] rounded-lg text-xs"
            />
          </div>
        </div>

        {listToRender.length === 0 ? (
          <EmptyState
            title="No Applications in this Queue"
            description="You have no cases requiring immediate action under this specific filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] border-b border-[#D9D8DE] text-[#77727E] font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Institution Name</th>
                  <th className="py-3 px-4">Workflow Route</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4">Deficiencies</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Scrutiny Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EAEE]">
                {listToRender.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="hover:bg-[#F8F9FA] cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#321B35] whitespace-nowrap">
                      {app.id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#27232C] block">{app.institutionName}</span>
                      <span className="text-[10px] text-[#77727E]">{app.applicationType}</span>
                    </td>
                    <td className="py-3 px-4 text-[#77727E]">{app.workflowRoute}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge stage={app.currentStage} variant="stage" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {app.deficiencies?.length > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FDE8E8] text-[#C44949] border border-[#F8B4B4] inline-flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> {app.deficiencies.length} Deficiencies
                        </span>
                      ) : (
                        <span className="text-[#27845A] font-semibold text-[11px]">Clean Record</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#77727E] whitespace-nowrap">
                      {new Date(app.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge status={app.overallStatus} isOverdue={app.isOverdue} />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApp(app);
                        }}
                        className="px-3 py-1 bg-[#321B35] text-white rounded text-[11px] font-bold hover:bg-[#46264A] transition shadow-xs"
                      >
                        Open Scrutiny Desk
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Detail / Action Modal */}
      <ApplicationDetailModal
        application={selectedApp}
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        onActionCompleted={(updated) => {
          setSelectedApp(updated);
          loadData();
        }}
      />
    </div>
  );
};
