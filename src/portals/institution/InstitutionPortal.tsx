import React, { useState, useEffect } from 'react';
import {
  FilePlus2,
  FileText,
  History,
  AlertTriangle,
  FolderOpen,
  ShieldCheck,
  CalendarDays,
  Building2,
  Clock,
  CheckCircle2,
  Upload,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { Application, ComplianceRecord, ApplicationType, WorkflowRouteType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { KPICard } from '../../components/common/KPICard';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { ApplicationDetailModal } from '../../components/common/ApplicationDetailModal';

interface InstitutionPortalProps {
  viewMode?: 'dashboard' | 'new-application' | 'applications' | 'status' | 'deficiencies' | 'documents' | 'undertakings' | 'renewals' | 'profile';
}

export const InstitutionPortal: React.FC<InstitutionPortalProps> = ({ viewMode = 'dashboard' }) => {
  const { user, navigate } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [complianceDocs, setComplianceDocs] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // New Application Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [appType, setAppType] = useState<ApplicationType>('Extension of Approval (EoA)');
  const [routeType, setRouteType] = useState<WorkflowRouteType>('Scrutiny + EVC');
  const [intake, setIntake] = useState(360);
  const [programs, setPrograms] = useState('Computer Engineering, Artificial Intelligence & Data Science, Electronics & Telecom');
  const [remarks, setRemarks] = useState('Annual extension submission with infrastructure compliance certificates.');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const appData = await ApiService.getApplications();
      setApplications(appData.data);

      const compData = await ApiService.getComplianceDocuments();
      setComplianceDocs(compData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateApplication = async (isDraft: boolean) => {
    setSubmitting(true);
    try {
      const res = await ApiService.createApplication({
        applicationType: appType,
        workflowRoute: routeType,
        intakeProposed: intake,
        programsList: programs.split(',').map((p) => p.trim()),
        remarks,
        isDraft,
      });
      setSubmitSuccess(res.id);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const drafts = applications.filter((a) => a.overallStatus === 'Draft');
  const submitted = applications.filter((a) => a.overallStatus !== 'Draft' && a.stageStatus !== 'RETURNED');
  const returned = applications.filter((a) => a.stageStatus === 'RETURNED' || a.currentStage === 'DEFICIENCY_CORRECTION');
  const expiringDocs = complianceDocs.filter((d) => d.submissionStatus === 'EXPIRING_SOON' || d.submissionStatus === 'EXPIRED');

  return (
    <div className="space-y-6">
      {/* Institution Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-[#D9D8DE] shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#321B35] text-[#F2B544] flex items-center justify-center font-extrabold text-xl shrink-0">
            BV
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-[#27232C]">
                {user?.institutionName || 'Bharati Vidyapeeth Institute of Technology'}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#27845A] border border-[#A7F3D0]">
                AICTE Approved (WR)
              </span>
            </div>
            <p className="text-xs text-[#77727E] mt-0.5">
              Permanent Institute Code: <strong>BVIT-5124</strong> | Authorized Signatory: <strong>{user?.name} (Registrar)</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/institution/new-application')}
            className="px-4 py-2 bg-[#F2B544] text-[#321B35] font-extrabold rounded-lg text-xs hover:bg-[#E5A734] transition flex items-center gap-1.5 shadow-xs"
          >
            <FilePlus2 className="w-4 h-4" /> Start New Application
          </button>
        </div>
      </div>

      {/* NEW APPLICATION WIZARD MODE */}
      {viewMode === 'new-application' ? (
        <div className="bg-white rounded-xl border border-[#D9D8DE] p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E9EAEE]">
            <div>
              <h3 className="text-base font-extrabold text-[#27232C]">
                AICTE Regulatory Approval Application Dossier
              </h3>
              <p className="text-xs text-[#77727E]">Academic Year 2026-2027 Approval Cycle</p>
            </div>
            <span className="text-xs font-bold text-[#321B35] px-2.5 py-1 bg-[#F4F5F8] rounded-lg border border-[#D9D8DE]">
              Step {wizardStep} of 4
            </span>
          </div>

          {submitSuccess ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-14 h-14 bg-[#ECFDF5] text-[#27845A] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#27232C]">Application Successfully Lodged!</h3>
              <p className="text-xs text-[#77727E] max-w-md mx-auto">
                Application <strong>{submitSuccess}</strong> has been transmitted to the Western Regional Office.
                Technical scrutiny will commence in accordance with configured SLA.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSubmitSuccess(null);
                    setWizardStep(1);
                    navigate('/institution/dashboard');
                  }}
                  className="px-4 py-2 bg-[#321B35] text-white rounded-lg text-xs font-bold"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Step 1: Type & Route */}
              {wizardStep === 1 && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#27232C] mb-1">Application Type</label>
                    <select
                      value={appType}
                      onChange={(e) => setAppType(e.target.value as any)}
                      className="w-full p-2.5 bg-[#F8F9FA] border border-[#D9D8DE] rounded-lg text-xs"
                    >
                      <option value="Extension of Approval (EoA)">Extension of Approval (EoA)</option>
                      <option value="Increase in Intake / New Course">Increase in Intake / New Course</option>
                      <option value="New Institution Setup">New Institution Setup</option>
                      <option value="Change of Site / Location">Change of Site / Location</option>
                      <option value="Closure / Merger">Closure / Merger</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#27232C] mb-1">Recommended Workflow Route</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { name: 'Scrutiny + EVC', desc: 'Technical document scrutiny followed by physical on-site committee visit.' },
                        { name: 'Only Scrutiny', desc: 'Desk scrutiny for autonomous institutions and standard EoA.' },
                        { name: 'EVC + SAC/SHC', desc: 'Direct on-site inspection followed by Standing Appellate Hearing.' },
                        { name: 'Only EVC', desc: 'Direct physical verification route for campus infrastructure changes.' },
                      ].map((r) => (
                        <div
                          key={r.name}
                          onClick={() => setRouteType(r.name as any)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition ${
                            routeType === r.name
                              ? 'border-[#321B35] bg-[#321B35]/5 ring-1 ring-[#321B35]'
                              : 'border-[#D9D8DE] hover:bg-[#F8F9FA]'
                          }`}
                        >
                          <span className="font-bold text-xs text-[#27232C] block">{r.name}</span>
                          <span className="text-[11px] text-[#77727E] mt-0.5 block">{r.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Intake & Courses */}
              {wizardStep === 2 && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#27232C] mb-1">Proposed Total Intake (Seats)</label>
                    <input
                      type="number"
                      value={intake}
                      onChange={(e) => setIntake(parseInt(e.target.value, 10))}
                      className="w-full p-2.5 bg-[#F8F9FA] border border-[#D9D8DE] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#27232C] mb-1">Programmes Offered (Comma Separated)</label>
                    <textarea
                      rows={3}
                      value={programs}
                      onChange={(e) => setPrograms(e.target.value)}
                      className="w-full p-2.5 bg-[#F8F9FA] border border-[#D9D8DE] rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Compliance & Undertakings */}
              {wizardStep === 3 && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-[#FFF8EB] border border-[#F7D488] rounded-lg text-[#8A5B00]">
                    Verify that your 30-year registered lease deed, fire safety NOC, and statutory undertakings are current.
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-[#321B35]" />
                      <span>I confirm all faculty members are paid as per 7th Central Pay Commission norms.</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-[#321B35]" />
                      <span>Statutory Anti-Ragging committee and internal complaints committee are duly notified.</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-[#321B35]" />
                      <span>All laboratories and workshop equipment meet AICTE Approval Process Handbook norms.</span>
                    </label>
                  </div>

                  <div>
                    <label className="block font-bold text-[#27232C] mb-1">Executive Summary / Remarks</label>
                    <textarea
                      rows={2}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full p-2.5 bg-[#F8F9FA] border border-[#D9D8DE] rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {wizardStep === 4 && (
                <div className="space-y-3 text-xs bg-[#F8F9FA] p-4 rounded-xl border border-[#D9D8DE]">
                  <h4 className="font-bold text-[#321B35] text-xs">Dossier Summary Before Submission</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[#77727E]">Type:</span> <strong>{appType}</strong>
                    </div>
                    <div>
                      <span className="text-[#77727E]">Route:</span> <strong>{routeType}</strong>
                    </div>
                    <div>
                      <span className="text-[#77727E]">Intake:</span> <strong>{intake} Seats</strong>
                    </div>
                    <div>
                      <span className="text-[#77727E]">Affiliation:</span> <strong>Valid AY 2026-27</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#77727E] pt-2 border-t border-[#E9EAEE]">
                    Clicking "Submit to AICTE" will lock the initial submission and generate an immutable audit log timestamp.
                  </p>
                </div>
              )}

              {/* Wizard Nav buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E9EAEE]">
                {wizardStep > 1 ? (
                  <button
                    onClick={() => setWizardStep((s) => s - 1)}
                    className="px-3.5 py-1.5 border border-[#D9D8DE] rounded-lg text-xs font-semibold text-[#77727E] hover:bg-[#F4F5F8] flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Previous
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCreateApplication(true)}
                    disabled={submitting}
                    className="px-3.5 py-1.5 border border-[#D9D8DE] rounded-lg text-xs font-semibold text-[#27232C] hover:bg-[#F4F5F8]"
                  >
                    Save Draft
                  </button>

                  {wizardStep < 4 ? (
                    <button
                      onClick={() => setWizardStep((s) => s + 1)}
                      className="px-4 py-1.5 bg-[#321B35] text-white rounded-lg text-xs font-bold hover:bg-[#46264A] flex items-center gap-1"
                    >
                      Next Step <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCreateApplication(false)}
                      disabled={submitting}
                      className="px-4 py-1.5 bg-[#27845A] text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-xs"
                    >
                      {submitting ? 'Submitting...' : 'Submit Application to AICTE'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* STANDARD INSTITUTION DASHBOARD */
        <div className="space-y-6">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Active Applications"
              value={applications.length}
              subtitle="Current Regulatory Cycle"
              icon={FileText}
              highlightColor="aubergine"
            />
            <KPICard
              title="Submitted to AICTE"
              value={submitted.length}
              subtitle="Under Scrutiny or EVC"
              icon={Clock}
              highlightColor="marigold"
            />
            <KPICard
              title="Action Required"
              value={returned.length}
              subtitle="Deficiencies to Clarify"
              icon={AlertTriangle}
              highlightColor={returned.length > 0 ? 'error' : 'success'}
              badge={returned.length > 0 ? 'Urgent' : undefined}
            />
            <KPICard
              title="Expiring Documents"
              value={expiringDocs.length}
              subtitle="Lease & Safety NOCs"
              icon={CalendarDays}
              highlightColor={expiringDocs.length > 0 ? 'warning' : 'success'}
            />
          </div>

          {/* Action Required Banner if Deficiencies exist */}
          {returned.length > 0 && (
            <div className="p-4 bg-[#FDE8E8] border border-[#F8B4B4] rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-[#C44949] shrink-0" />
                <div>
                  <h4 className="font-bold text-[#C44949]">
                    Deficiency Notice Issued by Scrutiny Committee
                  </h4>
                  <p className="text-[#77727E]">
                    Application {returned[0].id} has been returned for clarification. Please submit rectified documents.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(returned[0])}
                className="px-3.5 py-1.5 bg-[#C44949] text-white font-bold rounded-lg text-xs hover:bg-rose-700 shrink-0"
              >
                Respond Now
              </button>
            </div>
          )}

          {/* Applications Table */}
          <div className="bg-white rounded-xl border border-[#D9D8DE] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E9EAEE] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#27232C]">My Applications & Status Timeline</h3>
                <p className="text-xs text-[#77727E]">Track real-time progress through AICTE scrutiny and EVC</p>
              </div>
              <button
                onClick={() => navigate('/institution/new-application')}
                className="text-xs font-bold text-[#321B35] hover:underline flex items-center gap-1"
              >
                <FilePlus2 className="w-3.5 h-3.5" /> New Application
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F9FA] border-b border-[#D9D8DE] text-[#77727E] font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Application ID</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Workflow Route</th>
                    <th className="py-3 px-4">Current Stage</th>
                    <th className="py-3 px-4">Submission Date</th>
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
                      <td className="py-3 px-4 font-mono font-bold text-[#321B35]">{app.id}</td>
                      <td className="py-3 px-4 font-semibold text-[#27232C]">{app.applicationType}</td>
                      <td className="py-3 px-4 text-[#77727E]">{app.workflowRoute}</td>
                      <td className="py-3 px-4">
                        <Badge stage={app.currentStage} variant="stage" />
                      </td>
                      <td className="py-3 px-4 font-mono text-[#77727E]">
                        {new Date(app.submissionDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={app.overallStatus} isOverdue={app.isOverdue} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApp(app);
                          }}
                          className="px-2.5 py-1 bg-[#F4F5F8] border border-[#D9D8DE] rounded text-[11px] font-bold text-[#321B35] hover:bg-[#E9EAEE]"
                        >
                          View Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Institutional Compliance Documents */}
          <div className="bg-white rounded-xl border border-[#D9D8DE] shadow-xs p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#27232C]">
              Institutional Document Repository & Lease Validity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {complianceDocs.slice(0, 4).map((d) => (
                <div key={d.id} className="p-3 bg-[#F8F9FA] rounded-lg border border-[#E9EAEE] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#27232C] block">{d.documentType}</span>
                    <span className="text-[11px] text-[#77727E]">Expires: {d.expiryDate}</span>
                  </div>
                  <Badge variant="compliance">{d.submissionStatus}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
