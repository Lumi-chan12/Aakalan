import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { Application, Region, ApplicationType, StageId, OverallStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { ApplicationDetailModal } from '../../components/common/ApplicationDetailModal';
import { useAuth } from '../../context/AuthContext';

export const AdminApplications: React.FC = () => {
  const { selectedRegion } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Filter states
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState(selectedRegion || 'ALL');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [overdueOnly, setOverdueOnly] = useState(false);

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getApplications({
        search,
        region: regionFilter,
        stage: stageFilter,
        status: statusFilter,
        applicationType: typeFilter,
        isOverdue: overdueOnly ? 'true' : undefined,
        page,
        limit: pageSize,
      });
      setApplications(res.data);
      setTotalCount(res.pagination.total);
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [search, regionFilter, stageFilter, statusFilter, typeFilter, overdueOnly, page]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#27232C]">National Applications Register</h2>
          <p className="text-xs text-[#77727E] mt-0.5">
            Central repository of all institutional approval dossiers across all 6 AICTE regions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadApplications()}
            className="p-2 rounded-lg border border-[#D9D8DE] bg-white text-[#77727E] hover:text-[#27232C] hover:bg-[#F4F5F8] transition"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              const csv = applications.map((a) => `${a.id},${a.institutionName},${a.region},${a.currentStage},${a.overallStatus}`).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `aicte_applications_export_${Date.now()}.csv`;
              link.click();
            }}
            className="px-3 py-1.5 rounded-lg border border-[#D9D8DE] bg-white text-xs font-semibold text-[#27232C] hover:bg-[#F4F5F8] transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#77727E]" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#D9D8DE] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative lg:col-span-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#77727E]" />
            <input
              type="text"
              placeholder="Search ID, college, code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 bg-[#F4F5F8] border border-[#D9D8DE] rounded-lg text-xs focus:ring-1 focus:ring-[#321B35]"
            />
          </div>

          {/* Region Filter */}
          <div>
            <select
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full p-1.5 bg-[#F4F5F8] border border-[#D9D8DE] rounded-lg text-xs"
            >
              <option value="ALL">All Regions</option>
              <option value="Western">Western Region</option>
              <option value="Northern">Northern Region</option>
              <option value="Southern">Southern Region</option>
              <option value="Eastern">Eastern Region</option>
              <option value="Central">Central Region</option>
              <option value="South-Western">South-Western Region</option>
            </select>
          </div>

          {/* Stage Filter */}
          <div>
            <select
              value={stageFilter}
              onChange={(e) => {
                setStageFilter(e.target.value);
                setPage(1);
              }}
              className="w-full p-1.5 bg-[#F4F5F8] border border-[#D9D8DE] rounded-lg text-xs"
            >
              <option value="ALL">All Workflow Stages</option>
              <option value="SUBMISSION">Application Submission</option>
              <option value="INITIAL_SCREENING">Initial Screening</option>
              <option value="SCRUTINY">Technical Scrutiny</option>
              <option value="DEFICIENCY_CORRECTION">Deficiency Correction</option>
              <option value="EVC_SCHEDULING">EVC Scheduling</option>
              <option value="EVC_INSPECTION">EVC Inspection</option>
              <option value="SAC_SHC_REVIEW">SAC / SHC Review</option>
              <option value="APPROVAL_COUNCIL">Council Approval</option>
              <option value="CLOSED">Closed File</option>
            </select>
          </div>

          {/* Application Type */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full p-1.5 bg-[#F4F5F8] border border-[#D9D8DE] rounded-lg text-xs"
            >
              <option value="ALL">All Application Types</option>
              <option value="Extension of Approval (EoA)">Extension of Approval (EoA)</option>
              <option value="New Institution Setup">New Institution Setup</option>
              <option value="Increase in Intake / New Course">Increase in Intake</option>
              <option value="Change of Site / Location">Change of Site</option>
              <option value="Closure / Merger">Closure / Merger</option>
            </select>
          </div>

          {/* Overdue Checkbox */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#27232C]">
              <input
                type="checkbox"
                checked={overdueOnly}
                onChange={(e) => {
                  setOverdueOnly(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 rounded text-[#C44949] focus:ring-0 cursor-pointer"
              />
              <span className="text-[#C44949]">Show Overdue Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-[#D9D8DE] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#77727E]">Loading records...</div>
        ) : applications.length === 0 ? (
          <EmptyState
            title="No Applications Match Current Filters"
            description="Try modifying search keywords or clearing region/stage filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] border-b border-[#D9D8DE] text-[#77727E] font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">App ID</th>
                  <th className="py-3 px-3">Institution & Code</th>
                  <th className="py-3 px-3">Region</th>
                  <th className="py-3 px-3">Type & Route</th>
                  <th className="py-3 px-3">Current Stage</th>
                  <th className="py-3 px-3">Assigned Officer</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3">Ageing</th>
                  <th className="py-3 px-3">Overall Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EAEE]">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="hover:bg-[#F8F9FA] cursor-pointer transition"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-[#321B35] whitespace-nowrap">
                      {app.id}
                    </td>
                    <td className="py-3 px-3 max-w-[200px]">
                      <div className="font-bold text-[#27232C] truncate">{app.institutionName}</div>
                      <div className="text-[10px] font-mono text-[#77727E]">{app.institutionCode}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-medium text-[#27232C]">
                      {app.region}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-[#27232C] truncate max-w-[160px]">
                        {app.applicationType}
                      </div>
                      <div className="text-[10px] text-[#77727E]">{app.workflowRoute}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <Badge stage={app.currentStage} variant="stage" />
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-[#27232C]">
                      {app.assignedOfficerName ? (
                        <span className="font-medium">{app.assignedOfficerName}</span>
                      ) : (
                        <span className="text-[#77727E] italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-[#77727E]">
                      {new Date(app.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`font-mono font-semibold ${app.isOverdue ? 'text-[#C44949]' : 'text-[#77727E]'}`}>
                        {app.ageingDays}d
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <Badge status={app.overallStatus} isOverdue={app.isOverdue} />
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApp(app);
                        }}
                        className="px-2.5 py-1 bg-[#F4F5F8] border border-[#D9D8DE] rounded text-[11px] font-bold text-[#321B35] hover:bg-[#E9EAEE] transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-3 bg-[#F8F9FA] border-t border-[#E9EAEE] flex items-center justify-between text-xs text-[#77727E]">
          <div>
            Showing <strong>{applications.length}</strong> of <strong>{totalCount}</strong> applications
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="p-1.5 rounded border border-[#D9D8DE] bg-white text-[#27232C] disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-semibold text-[#27232C]">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * pageSize >= totalCount}
              className="p-1.5 rounded border border-[#D9D8DE] bg-white text-[#27232C] disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <ApplicationDetailModal
        application={selectedApp}
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        onActionCompleted={(updated) => {
          setSelectedApp(updated);
          loadApplications();
        }}
      />
    </div>
  );
};
