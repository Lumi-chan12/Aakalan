import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  AlertTriangle,
  CalendarDays,
  ShieldCheck,
  TrendingDown,
  Users,
  Search,
  Filter,
  Eye,
  Plus,
  BadgeAlert,
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { Application, EVCVisit } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { KPICard } from '../../components/common/KPICard';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { ApplicationDetailModal } from '../../components/common/ApplicationDetailModal';
import { Modal } from '../../components/common/Modal';

interface RegionalPortalProps {
  viewMode?: 'dashboard' | 'applications' | 'pendency' | 'overdue' | 'evc' | 'compliance' | 'workload' | 'escalations';
}

export const RegionalPortal: React.FC<RegionalPortalProps> = ({ viewMode = 'dashboard' }) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [evcVisits, setEvcVisits] = useState<EVCVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [search, setSearch] = useState('');

  // EVC Scheduling Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleAppId, setScheduleAppId] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [leader, setLeader] = useState('Prof. A. K. Biswas (IIT Bombay)');
  const [members, setMembers] = useState('Dr. P. Nair (COEP Pune), Er. Suresh K. (Industry Rep)');
  const [scope, setScope] = useState('Physical lab setup, building occupancy, and faculty verification.');

  const loadData = async () => {
    try {
      setLoading(true);
      const appData = await ApiService.getApplications({
        region: user?.region || 'Western',
        search: search || undefined,
      });
      setApplications(appData.data);

      const evcData = await ApiService.getEVCVisits();
      setEvcVisits(evcData.filter((e) => e.region === user?.region));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.region, search]);

  const handleScheduleEVC = async () => {
    if (!scheduleAppId || !visitDate) return;
    try {
      await ApiService.scheduleEVCVisit({
        applicationId: scheduleAppId,
        scheduledDate: new Date(visitDate).toISOString(),
        committeeLeader: leader,
        committeeMembers: members.split(',').map((m) => m.trim()),
        inspectionScope: scope,
      });
      setShowScheduleModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const pendingRegional = applications.filter((a) => a.stageStatus !== 'COMPLETED' && a.overallStatus !== 'Approved');
  const overdueRegional = applications.filter((a) => a.isOverdue);
  const needsEvc = applications.filter((a) => a.currentStage === 'EVC_SCHEDULING' || a.currentStage === 'SCRUTINY');

  return (
    <div className="space-y-6">
      {/* Regional Bureau Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#27232C]">
              {user?.region || 'Western'} Regional Office Bureau
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#321B35] text-white">
              DIRECTORATE
            </span>
          </div>
          <p className="text-xs text-[#77727E] mt-0.5">
            Restricted administrative console for <strong>{user?.name}</strong>. Managing approvals, EVC inspections, and officers in {user?.region} region.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-3.5 py-1.5 bg-[#321B35] text-white rounded-lg text-xs font-bold hover:bg-[#46264A] transition flex items-center gap-1.5 shadow-xs"
          >
            <CalendarDays className="w-3.5 h-3.5" /> Schedule EVC Visit
          </button>
        </div>
      </div>

      {/* Regional Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title={`${user?.region} Applications`}
          value={applications.length}
          subtitle="Regional Jurisdiction"
          icon={MapPin}
          highlightColor="aubergine"
        />
        <KPICard
          title="Active Pendency"
          value={pendingRegional.length}
          subtitle="In Screening or Scrutiny"
          icon={Clock}
          highlightColor="marigold"
        />
        <KPICard
          title="Regional Overdue"
          value={overdueRegional.length}
          subtitle="Breaching SLA Limit"
          icon={AlertTriangle}
          highlightColor="error"
          badge="High Priority"
        />
        <KPICard
          title="EVC Inspections"
          value={evcVisits.length}
          subtitle="Constituted Panels"
          icon={CalendarDays}
          highlightColor="success"
        />
      </div>

      {/* Main Regional Applications Table */}
      <div className="bg-white rounded-xl border border-[#D9D8DE] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E9EAEE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#27232C]">
              {user?.region} Regional Applications Register
            </h3>
            <p className="text-xs text-[#77727E]">All records strictly isolated to {user?.region} zone</p>
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#77727E]" />
            <input
              type="text"
              placeholder={`Search ${user?.region} records...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#F4F5F8] border border-[#D9D8DE] rounded-lg text-xs"
            />
          </div>
        </div>

        {applications.length === 0 ? (
          <EmptyState
            title="No Applications in Region"
            description={`No institutional records found for ${user?.region} bureau.`}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] border-b border-[#D9D8DE] text-[#77727E] font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Institution Name</th>
                  <th className="py-3 px-4">Application Type</th>
                  <th className="py-3 px-4">Workflow Stage</th>
                  <th className="py-3 px-4">Assigned Scrutiny Officer</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EAEE]">
                {applications.map((app) => (
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
                      <span className="text-[10px] text-[#77727E]">{app.institutionCode}</span>
                    </td>
                    <td className="py-3 px-4">{app.applicationType}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge stage={app.currentStage} variant="stage" />
                    </td>
                    <td className="py-3 px-4 text-[#27232C]">
                      {app.assignedOfficerName || <span className="text-[#C58A16] font-semibold italic">Unassigned</span>}
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
                        className="px-2.5 py-1 bg-[#F4F5F8] border border-[#D9D8DE] rounded text-[11px] font-bold text-[#321B35] hover:bg-[#E9EAEE]"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EVC Scheduling Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Expert Visit Committee (EVC)"
        subtitle={`Constitute an inspection panel for an eligible institution in ${user?.region} region.`}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowScheduleModal(false)}
              className="px-3 py-1.5 border border-[#D9D8DE] rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleScheduleEVC}
              className="px-4 py-1.5 bg-[#321B35] text-white rounded-lg text-xs font-bold hover:bg-[#46264A]"
            >
              Confirm & Issue EVC Order
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-[#77727E] mb-1">Select Application</label>
            <select
              value={scheduleAppId}
              onChange={(e) => setScheduleAppId(e.target.value)}
              className="w-full p-2 bg-[#F8F9FA] border border-[#D9D8DE] rounded-lg text-xs"
            >
              <option value="">Select an application eligible for EVC</option>
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} - {a.institutionName} ({a.currentStage})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#77727E] mb-1">Inspection Visit Date</label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full p-2 bg-[#F8F9FA] border border-[#D9D8DE] rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#77727E] mb-1">Committee Chairman / Leader</label>
            <input
              type="text"
              value={leader}
              onChange={(e) => setLeader(e.target.value)}
              className="w-full p-2 bg-[#F8F9FA] border border-[#D9D8DE] rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#77727E] mb-1">Committee Members (Comma separated)</label>
            <input
              type="text"
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              className="w-full p-2 bg-[#F8F9FA] border border-[#D9D8DE] rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#77727E] mb-1">Verification Scope</label>
            <textarea
              rows={2}
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full p-2 bg-[#F8F9FA] border border-[#D9D8DE] rounded-lg text-xs"
            />
          </div>
        </div>
      </Modal>

      {/* Application Detail Modal */}
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
