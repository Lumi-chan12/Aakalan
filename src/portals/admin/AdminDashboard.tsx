import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  AlertTriangle,
  CalendarDays,
  ShieldCheck,
  TrendingDown,
  ArrowUpRight,
  Landmark,
  UserCheck,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { Application, DashboardSummary } from '../../types';
import { KPICard } from '../../components/common/KPICard';
import { Badge } from '../../components/common/Badge';
import { ApplicationDetailModal } from '../../components/common/ApplicationDetailModal';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { navigate } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAppDetails = async (id: string) => {
    try {
      const app = await ApiService.getApplicationById(id);
      setSelectedApp(app);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !summary) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#321B35] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#77727E]">Loading Central Intelligence Summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#27232C]">Central Administration Command</h2>
          <p className="text-xs text-[#77727E] mt-0.5">
            National overview of AICTE application workflows, regional scrutiny pendency, and compliance oversight.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/workflows')}
            className="px-3 py-1.5 rounded-lg border border-[#D9D8DE] bg-white text-xs font-semibold text-[#27232C] hover:bg-[#F4F5F8] transition"
          >
            Manage Workflow Routes
          </button>
          <button
            onClick={() => navigate('/admin/applications')}
            className="px-3 py-1.5 rounded-lg bg-[#321B35] text-white text-xs font-bold hover:bg-[#46264A] transition shadow-xs"
          >
            View All Applications
          </button>
        </div>
      </div>

      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <KPICard
          title="Total Applications"
          value={summary.totalApplications}
          subtitle="All Regional Offices"
          icon={FileText}
          highlightColor="aubergine"
          onClick={() => navigate('/admin/applications')}
        />
        <KPICard
          title="Pending Applications"
          value={summary.pendingCount}
          subtitle="In Active Workflows"
          icon={Clock}
          highlightColor="marigold"
          onClick={() => navigate('/admin/applications')}
        />
        <KPICard
          title="Overdue Cases"
          value={summary.overdueCount}
          subtitle="Exceeded SLA Timelines"
          icon={AlertTriangle}
          highlightColor="error"
          badge="Action Needed"
          onClick={() => navigate('/admin/pendency')}
        />
        <KPICard
          title="EVC Visits Scheduled"
          value={summary.evcVisitsScheduled}
          subtitle="Expert Committees"
          icon={CalendarDays}
          highlightColor="aubergine"
          onClick={() => navigate('/admin/evc')}
        />
        <KPICard
          title="Docs Expiring Soon"
          value={summary.documentsExpiringSoon}
          subtitle="Within 30-60 Days"
          icon={TrendingDown}
          highlightColor="warning"
          onClick={() => navigate('/admin/compliance')}
        />
        <KPICard
          title="Compliance Rate"
          value={`${summary.complianceRate}%`}
          subtitle="Statutory Verification"
          icon={ShieldCheck}
          highlightColor="success"
          trend={{ value: '+4.2%', isPositive: true, label: 'this cycle' }}
          onClick={() => navigate('/admin/compliance')}
        />
      </div>

      {/* Row 2: Pipeline by Stage & Region-wise Pendency */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Stage Pipeline (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#D9D8DE] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#27232C]">Application Pipeline by Approval Stage</h3>
              <p className="text-xs text-[#77727E]">Stage-by-stage distribution across active routes</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-[#F4F5F8] text-[#321B35] rounded border border-[#D9D8DE]">
              Live Engine State
            </span>
          </div>

          <div className="space-y-3">
            {summary.stageDistribution?.map((st) => {
              const pct = Math.round((st.count / (summary.totalApplications || 1)) * 100);
              return (
                <div key={st.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#27232C]">{st.stage.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-[#77727E]">
                      {st.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#E9EAEE] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 8)}%`, backgroundColor: st.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-[#E9EAEE] flex items-center justify-between text-xs">
            <span className="text-[#77727E]">Routes configured: 5 active templates</span>
            <button
              onClick={() => navigate('/admin/workflows')}
              className="text-[#321B35] font-bold hover:underline flex items-center gap-1"
            >
              Configure SLA Rules <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Region Pendency (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#D9D8DE] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#27232C]">Regional Pendency & Overdue</h3>
              <p className="text-xs text-[#77727E]">Performance across 6 AICTE bureaus</p>
            </div>
            <Landmark className="w-4 h-4 text-[#77727E]" />
          </div>

          <div className="divide-y divide-[#E9EAEE]">
            {summary.regionDistribution?.map((r) => (
              <div key={r.region} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#27232C]">{r.region} Region</span>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#77727E]">
                    <span>Pending: {r.pending}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">Approved: {r.completed}</span>
                  </div>
                </div>

                <div>
                  {r.overdue > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FDE8E8] text-[#C44949] border border-[#F8B4B4]">
                      {r.overdue} Overdue
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#27845A]">
                      On Schedule
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Ageing Distribution & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Ageing (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#D9D8DE] p-5 shadow-xs">
          <h3 className="text-sm font-bold text-[#27232C]">Application Ageing Buckets</h3>
          <p className="text-xs text-[#77727E] mb-4">Days elapsed from formal submission date</p>

          <div className="space-y-3">
            {summary.ageingBuckets?.map((b) => (
              <div key={b.range} className="p-3 bg-[#F8F9FA] rounded-lg border border-[#E9EAEE]">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-[#27232C]">{b.range}</span>
                  <span className="font-mono text-[#321B35] font-bold">{b.count} cases</span>
                </div>
                <div className="w-full bg-[#E9EAEE] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      b.range.includes('> 30')
                        ? 'bg-[#C44949]'
                        : b.range.includes('16-30')
                        ? 'bg-[#C58A16]'
                        : b.range.includes('8-15')
                        ? 'bg-[#F2B544]'
                        : 'bg-[#27845A]'
                    }`}
                    style={{ width: `${Math.max(b.percentage, 10)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deadlines Approaching (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#D9D8DE] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#27232C]">Upcoming Action Deadlines</h3>
              <p className="text-xs text-[#77727E]">Cases requiring officer intervention</p>
            </div>
            <button
              onClick={() => navigate('/admin/applications')}
              className="text-xs text-[#321B35] font-bold hover:underline"
            >
              View Filtered
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] border-b border-[#D9D8DE] text-[#77727E] font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Application ID</th>
                  <th className="py-2 px-3">Institution</th>
                  <th className="py-2 px-3">Due Date</th>
                  <th className="py-2 px-3">SLA Status</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EAEE]">
                {summary.upcomingDeadlines?.map((d) => (
                  <tr key={d.id} className="hover:bg-[#F8F9FA] transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#321B35]">{d.id}</td>
                    <td className="py-2.5 px-3 font-medium text-[#27232C] truncate max-w-[200px]">
                      {d.institution}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#77727E]">
                      {new Date(d.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3">
                      {d.isOverdue ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FDE8E8] text-[#C44949] border border-[#F8B4B4]">
                          Overdue ({Math.abs(d.daysLeft)}d)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF8EB] text-[#8A5B00] border border-[#F7D488]">
                          {d.daysLeft} days left
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => openAppDetails(d.id)}
                        className="px-2.5 py-1 rounded bg-white border border-[#D9D8DE] text-[11px] font-semibold text-[#321B35] hover:bg-[#E9EAEE] transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Immutable Audit Trail */}
      <div className="bg-white rounded-xl border border-[#D9D8DE] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#27232C]">Recent Central Audit Trail</h3>
            <p className="text-xs text-[#77727E]">Immutable blockchain-style event logging of all official actions</p>
          </div>
          <button
            onClick={() => navigate('/admin/audit-logs')}
            className="text-xs font-bold text-[#321B35] hover:underline"
          >
            Full Audit Register
          </button>
        </div>

        <div className="divide-y divide-[#E9EAEE] max-h-72 overflow-y-auto">
          {summary.recentActivities?.map((a) => (
            <div key={a.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#E9EAEE] text-[#321B35] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {a.actorName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#27232C]">{a.actorName}</span>
                    <span className="px-1.5 py-0.2 bg-[#F4F5F8] border border-[#D9D8DE] rounded text-[10px] font-mono text-[#77727E]">
                      {a.actorRole}
                    </span>
                    <span className="font-semibold text-emerald-800">{a.action}</span>
                  </div>
                  <p className="text-[#77727E] mt-0.5 italic">"{a.remarks}"</p>
                  <span className="text-[10px] font-mono text-[#77727E]">Entity: {a.entityId}</span>
                </div>
              </div>

              <div className="text-right text-[11px] font-mono text-[#77727E] shrink-0">
                {new Date(a.timestamp).toLocaleString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Application Details */}
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
