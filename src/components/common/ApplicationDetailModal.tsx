import React, { useState } from 'react';
import {
  FileText,
  Building,
  User,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Send,
  FileCheck,
  MapPin,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { Application, ApplicationDocument, Deficiency, StageId } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { TimelineView } from './TimelineView';

interface ApplicationDetailModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onActionCompleted: (updatedApp: Application) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  isOpen,
  onClose,
  onActionCompleted,
}) => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'deficiencies' | 'timeline' | 'actions'>('overview');
  const [actionRemark, setActionRemark] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [assigneeName, setAssigneeName] = useState('Dr. Ramesh Iyer');
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // New Deficiency state
  const [newDefDesc, setNewDefDesc] = useState('');
  const [newDefCat, setNewDefCat] = useState('Land & Building');
  const [newDefSev, setNewDefSev] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [selectedDocId, setSelectedDocId] = useState<string>('');

  // Clarification state
  const [clarifyDefId, setClarifyDefId] = useState<string | null>(null);
  const [clarifyResponse, setClarifyResponse] = useState('');

  if (!application) return null;

  const handleExecuteTransition = async (action: string) => {
    setActionError(null);
    setLoading(true);
    try {
      let payload: any = undefined;
      if (action === 'ASSIGN') {
        payload = {
          officerId: 'user-scrutiny-01',
          officerName: assigneeName,
        };
      }

      const res = await ApiService.executeAction(application.id, action, actionRemark, payload);
      setActionRemark('');
      setSelectedAction('');
      onActionCompleted(res.application);
      setActiveTab('timeline');
    } catch (err: any) {
      setActionError(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseDeficiency = async () => {
    if (!newDefDesc || newDefDesc.trim().length < 5) {
      setActionError('Please provide a detailed explanation of the deficiency.');
      return;
    }
    setLoading(true);
    try {
      const doc = application.documents.find((d) => d.id === selectedDocId);
      const res = await ApiService.raiseDeficiency(application.id, {
        category: newDefCat,
        description: newDefDesc,
        severity: newDefSev,
        documentId: selectedDocId || undefined,
        documentName: doc?.name || undefined,
      });
      setNewDefDesc('');
      setSelectedDocId('');
      setActionError(null);
      // reload app
      const updated = await ApiService.getApplicationById(application.id);
      onActionCompleted(updated);
      setActiveTab('deficiencies');
    } catch (err: any) {
      setActionError(err.message || 'Failed to raise deficiency');
    } finally {
      setLoading(false);
    }
  };

  const handleClarifyDeficiency = async (defId: string) => {
    if (!clarifyResponse || clarifyResponse.trim().length < 3) {
      setActionError('Clarification text cannot be empty.');
      return;
    }
    setLoading(true);
    try {
      await ApiService.clarifyDeficiency(application.id, defId, clarifyResponse);
      setClarifyDefId(null);
      setClarifyResponse('');
      const updated = await ApiService.getApplicationById(application.id);
      onActionCompleted(updated);
    } catch (err: any) {
      setActionError(err.message || 'Failed to clarify deficiency');
    } finally {
      setLoading(false);
    }
  };

  // Determine authorized actions based on role and stage
  const getEligibleActions = () => {
    const list: { action: string; label: string; color: string; requireRemarks?: boolean }[] = [];

    if (role === 'INSTITUTION') {
      if (application.stageStatus === 'RETURNED' || application.currentStage === 'DEFICIENCY_CORRECTION') {
        list.push({ action: 'RESUBMIT', label: 'Resubmit Rectified Dossier', color: 'bg-[#27845A] text-white', requireRemarks: true });
      }
      if (application.overallStatus === 'Draft') {
        list.push({ action: 'SUBMIT', label: 'Submit Application to AICTE', color: 'bg-[#321B35] text-white' });
      }
    }

    if (role === 'SCRUTINY_OFFICER') {
      if (application.currentStage === 'SCRUTINY') {
        if (application.stageStatus !== 'IN_PROGRESS') {
          list.push({ action: 'START_SCRUTINY', label: 'Start Technical Scrutiny', color: 'bg-[#321B35] text-white' });
        }
        list.push({ action: 'RETURN_DEFICIENCY', label: 'Return for Deficiency', color: 'bg-[#C44949] text-white', requireRemarks: true });
        list.push({ action: 'COMPLETE_SCRUTINY', label: 'Complete Scrutiny & Forward', color: 'bg-[#27845A] text-white' });
      }
    }

    if (role === 'REGIONAL_OFFICER') {
      if (application.currentStage === 'INITIAL_SCREENING' || !application.assignedOfficerId) {
        list.push({ action: 'ASSIGN', label: 'Assign Scrutiny Officer', color: 'bg-[#321B35] text-white' });
      }
      if (application.currentStage === 'EVC_SCHEDULING') {
        list.push({ action: 'SCHEDULE_EVC', label: 'Confirm EVC Committee', color: 'bg-[#321B35] text-white' });
      }
      if (application.currentStage === 'EVC_INSPECTION') {
        list.push({ action: 'COMPLETE_EVC', label: 'Record EVC Inspection Report', color: 'bg-[#27845A] text-white' });
      }
      list.push({ action: 'FORWARD_SAC_SHC', label: 'Forward to SAC/SHC Review', color: 'bg-[#C58A16] text-white' });
    }

    if (role === 'ADMIN') {
      if (application.currentStage === 'INITIAL_SCREENING') {
        list.push({ action: 'ASSIGN', label: 'Assign Scrutiny Officer', color: 'bg-[#321B35] text-white' });
      }
      if (['SAC_SHC_REVIEW', 'APPROVAL_COUNCIL', 'SCRUTINY'].includes(application.currentStage)) {
        list.push({ action: 'APPROVE', label: 'Issue Council Approval (EoA)', color: 'bg-[#27845A] text-white' });
        list.push({ action: 'REJECT', label: 'Council Rejection', color: 'bg-[#C44949] text-white', requireRemarks: true });
      }
      if (application.overallStatus === 'Approved') {
        list.push({ action: 'CLOSE', label: 'Formally Close Case File', color: 'bg-[#321B35] text-white' });
      }
    }

    return list;
  };

  const eligibleActions = getEligibleActions();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${application.id} — ${application.applicationType}`}
      subtitle={`${application.institutionName} (${application.region} Region)`}
      maxWidth="4xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-[#77727E]">Overall Status:</span>
            <Badge status={application.overallStatus} isOverdue={application.isOverdue} />
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#D9D8DE] text-xs font-semibold text-[#27232C] hover:bg-[#E9EAEE] transition"
          >
            Close Window
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E9EAEE] gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 transition border-b-2 ${
              activeTab === 'overview'
                ? 'border-[#321B35] text-[#321B35]'
                : 'border-transparent text-[#77727E] hover:text-[#27232C]'
            }`}
          >
            Overview & Details
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-[#321B35] text-[#321B35]'
                : 'border-transparent text-[#77727E] hover:text-[#27232C]'
            }`}
          >
            Documents Register
            <span className="px-1.5 py-0.2 rounded-full bg-[#E9EAEE] text-[10px]">
              {application.documents?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('deficiencies')}
            className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'deficiencies'
                ? 'border-[#321B35] text-[#321B35]'
                : 'border-transparent text-[#77727E] hover:text-[#27232C]'
            }`}
          >
            Deficiencies & Remarks
            {application.deficiencies?.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#FDE8E8] text-[#C44949] text-[10px] font-bold">
                {application.deficiencies.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2.5 transition border-b-2 ${
              activeTab === 'timeline'
                ? 'border-[#321B35] text-[#321B35]'
                : 'border-transparent text-[#77727E] hover:text-[#27232C]'
            }`}
          >
            Stage Timeline & Audit
          </button>
          {eligibleActions.length > 0 && (
            <button
              onClick={() => setActiveTab('actions')}
              className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
                activeTab === 'actions'
                  ? 'border-[#F2B544] text-[#B87D09]'
                  : 'border-transparent text-[#B87D09] hover:text-[#92400E]'
              }`}
            >
              ★ Authorized Workflow Actions ({eligibleActions.length})
            </button>
          )}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#F8F9FA] p-4 rounded-xl border border-[#E9EAEE] space-y-2.5">
                <h4 className="font-bold text-[#321B35] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" /> Institution Particulars
                </h4>
                <div>
                  <span className="text-[#77727E] block text-[11px]">Institution Name:</span>
                  <span className="font-bold text-[#27232C]">{application.institutionName}</span>
                </div>
                <div>
                  <span className="text-[#77727E] block text-[11px]">Institution Permanent Code:</span>
                  <span className="font-mono font-medium text-[#27232C]">{application.institutionCode}</span>
                </div>
                <div>
                  <span className="text-[#77727E] block text-[11px]">Address & Campus:</span>
                  <span className="text-[#27232C]">{application.institutionAddress}</span>
                </div>
                <div>
                  <span className="text-[#77727E] block text-[11px]">Assigned Region:</span>
                  <span className="font-bold text-[#321B35]">{application.region} Region</span>
                </div>
              </div>

              <div className="bg-[#F8F9FA] p-4 rounded-xl border border-[#E9EAEE] space-y-2.5">
                <h4 className="font-bold text-[#321B35] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Application Parameters
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[#77727E] block text-[11px]">Workflow Route:</span>
                    <span className="font-bold text-[#27232C]">{application.workflowRoute}</span>
                  </div>
                  <div>
                    <span className="text-[#77727E] block text-[11px]">Current Stage:</span>
                    <Badge stage={application.currentStage} variant="stage" />
                  </div>
                  <div>
                    <span className="text-[#77727E] block text-[11px]">Assigned Officer:</span>
                    <span className="font-bold text-[#27232C]">
                      {application.assignedOfficerName || 'Pending Assignment'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#77727E] block text-[11px]">Proposed Total Intake:</span>
                    <span className="font-extrabold text-[#321B35]">{application.intakeProposed} Seats</span>
                  </div>
                  <div>
                    <span className="text-[#77727E] block text-[11px]">Submission Date:</span>
                    <span className="font-mono text-[#27232C]">
                      {new Date(application.submissionDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#77727E] block text-[11px]">Due Date (SLA):</span>
                    <span className={`font-mono font-bold ${application.isOverdue ? 'text-[#C44949]' : 'text-[#27232C]'}`}>
                      {new Date(application.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E9EAEE]">
                  <span className="text-[#77727E] block text-[11px] mb-1">Programs Applied:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {application.programsList?.map((prog, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white border border-[#D9D8DE] text-[11px] font-medium text-[#27232C]">
                        {prog}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {application.evcVisit && (
              <div className="p-4 rounded-xl border border-[#E9D5FF] bg-[#FAF5FF] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#6B21A8] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Scheduled Expert Visit Committee (EVC)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E9D5FF] text-[#6B21A8]">
                    {application.evcVisit.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#77727E] block text-[11px]">Inspection Date:</span>
                    <span className="font-bold text-[#27232C]">
                      {new Date(application.evcVisit.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#77727E] block text-[11px]">Committee Leader:</span>
                    <span className="font-semibold text-[#27232C]">{application.evcVisit.committeeLeader}</span>
                  </div>
                </div>
                {application.evcVisit.conflictFlag && (
                  <div className="p-2.5 rounded bg-[#FDE8E8] text-[#C44949] text-[11px] font-medium flex items-start gap-1.5 border border-[#F8B4B4]">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span><strong>Committee Conflict Alert:</strong> {application.evcVisit.conflictNotes}</span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Timeline bar */}
            <div className="pt-2">
              <TimelineView application={application} compact />
            </div>
          </div>
        )}

        {/* Tab 2: Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#77727E]">
                Mandatory institutional compliance documents and regulatory dossiers uploaded for scrutiny.
              </p>
              {role === 'SCRUTINY_OFFICER' && (
                <span className="text-xs text-[#321B35] font-semibold">
                  Click 'Flag Deficiency' on any non-compliant document.
                </span>
              )}
            </div>

            <div className="border border-[#D9D8DE] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F9FA] border-b border-[#D9D8DE] text-[#77727E] font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Document Title</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Verification Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9EAEE]">
                  {application.documents?.map((doc: ApplicationDocument) => (
                    <tr key={doc.id} className="hover:bg-[#F8F9FA] transition">
                      <td className="py-2.5 px-3 font-semibold text-[#27232C]">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-[#77727E]" />
                          <span>{doc.name}</span>
                        </div>
                        {doc.remarks && (
                          <p className="text-[11px] text-[#C44949] italic mt-0.5">Note: {doc.remarks}</p>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-[#77727E]">{doc.category}</td>
                      <td className="py-2.5 px-3 font-mono text-[#77727E]">{doc.fileSize}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant="compliance">{doc.status}</Badge>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 bg-[#F4F5F8] border border-[#D9D8DE] rounded text-[11px] font-semibold text-[#321B35] hover:bg-[#E9EAEE] inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> View
                          </a>
                          {role === 'SCRUTINY_OFFICER' && doc.status !== 'DEFICIENT' && (
                            <button
                              onClick={() => {
                                setSelectedDocId(doc.id);
                                setNewDefDesc(`Deficiency observed in ${doc.name}: `);
                                setActiveTab('deficiencies');
                              }}
                              className="px-2 py-1 bg-[#FDE8E8] border border-[#F8B4B4] rounded text-[11px] font-semibold text-[#C44949] hover:bg-[#FBD5D5]"
                            >
                              Flag
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Deficiencies */}
        {activeTab === 'deficiencies' && (
          <div className="space-y-4 text-xs">
            {/* Deficiency List */}
            <div className="space-y-3">
              {application.deficiencies?.length > 0 ? (
                application.deficiencies.map((def: Deficiency) => (
                  <div
                    key={def.id}
                    className="p-4 rounded-xl border border-[#F8B4B4] bg-[#FFF8F8] space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="severity" severity={def.severity} />
                        <span className="font-bold text-[#27232C]">{def.category}</span>
                        {def.documentName && (
                          <span className="text-[11px] text-[#77727E]">({def.documentName})</span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-[#C44949] uppercase">
                        Status: {def.status}
                      </span>
                    </div>

                    <p className="text-[#27232C] font-medium">{def.description}</p>
                    <div className="text-[11px] text-[#77727E] flex items-center gap-2">
                      <span>Raised by: <strong>{def.raisedBy}</strong></span>
                      <span>•</span>
                      <span>{new Date(def.raisedAt).toLocaleString()}</span>
                    </div>

                    {/* Institution Response */}
                    {def.institutionResponse && (
                      <div className="mt-2 p-3 bg-white rounded-lg border border-[#A7F3D0] text-xs">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#27845A] mb-1">
                          <span>✓ Institution Clarification Submitted</span>
                          <span className="text-[#77727E] font-normal">
                            {def.responseSubmittedAt && new Date(def.responseSubmittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[#27232C]">{def.institutionResponse}</p>
                      </div>
                    )}

                    {/* Institution Response Form */}
                    {role === 'INSTITUTION' && def.status === 'OPEN' && (
                      <div className="mt-3 pt-2 border-t border-[#F8B4B4]/60">
                        {clarifyDefId === def.id ? (
                          <div className="space-y-2">
                            <textarea
                              rows={3}
                              placeholder="Type your formal clarification or provide rectified document reference..."
                              value={clarifyResponse}
                              onChange={(e) => setClarifyResponse(e.target.value)}
                              className="w-full p-2.5 rounded-lg border border-[#D9D8DE] text-xs focus:ring-1 focus:ring-[#321B35]"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setClarifyDefId(null)}
                                className="px-3 py-1 rounded border border-[#D9D8DE] text-xs"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleClarifyDeficiency(def.id)}
                                disabled={loading}
                                className="px-3 py-1 bg-[#27845A] text-white rounded text-xs font-semibold hover:bg-emerald-700"
                              >
                                {loading ? 'Submitting...' : 'Submit Clarification'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setClarifyDefId(def.id);
                              setClarifyResponse('');
                            }}
                            className="px-3 py-1.5 bg-[#321B35] text-white rounded-lg text-xs font-semibold hover:bg-[#46264A] transition"
                          >
                            Submit Clarification / Rectification
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-[#77727E] bg-[#F8F9FA] rounded-xl border border-[#D9D8DE]">
                  No formal deficiencies or compliance objections reported for this application.
                </div>
              )}
            </div>

            {/* Raise Deficiency Form (Scrutiny Officer / Admin Only) */}
            {(role === 'SCRUTINY_OFFICER' || role === 'ADMIN') && (
              <div className="p-4 rounded-xl border border-[#D9D8DE] bg-[#F8F9FA] space-y-3">
                <h4 className="font-bold text-[#321B35] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#C44949]" /> Record Official Scrutiny Deficiency
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#77727E] mb-1">Category</label>
                    <select
                      value={newDefCat}
                      onChange={(e) => setNewDefCat(e.target.value)}
                      className="w-full p-2 bg-white border border-[#D9D8DE] rounded-lg text-xs"
                    >
                      <option value="Land & Building">Land & Building</option>
                      <option value="Faculty Cadre Ratio">Faculty Cadre Ratio</option>
                      <option value="Fire Safety & NOC">Fire Safety & NOC</option>
                      <option value="Affiliation Order">Affiliation Order</option>
                      <option value="Financial Audit">Financial Audit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#77727E] mb-1">Severity</label>
                    <select
                      value={newDefSev}
                      onChange={(e) => setNewDefSev(e.target.value as any)}
                      className="w-full p-2 bg-white border border-[#D9D8DE] rounded-lg text-xs"
                    >
                      <option value="HIGH">HIGH (Blocking)</option>
                      <option value="MEDIUM">MEDIUM (Requires Clarification)</option>
                      <option value="LOW">LOW (Informational)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#77727E] mb-1">Associated Doc</label>
                    <select
                      value={selectedDocId}
                      onChange={(e) => setSelectedDocId(e.target.value)}
                      className="w-full p-2 bg-white border border-[#D9D8DE] rounded-lg text-xs truncate"
                    >
                      <option value="">General (No doc attached)</option>
                      {application.documents?.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#77727E] mb-1">Deficiency Description (Mandatory)</label>
                  <textarea
                    rows={2}
                    value={newDefDesc}
                    onChange={(e) => setNewDefDesc(e.target.value)}
                    placeholder="Specify the exact non-compliance clause, missing seal, or expired date..."
                    className="w-full p-2 bg-white border border-[#D9D8DE] rounded-lg text-xs focus:ring-1 focus:ring-[#321B35]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleRaiseDeficiency}
                    disabled={loading}
                    className="px-4 py-1.5 bg-[#C44949] text-white font-semibold rounded-lg text-xs hover:bg-rose-700 transition"
                  >
                    {loading ? 'Recording...' : 'Record Deficiency & Notify Institution'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Timeline */}
        {activeTab === 'timeline' && (
          <div>
            <TimelineView application={application} />
          </div>
        )}

        {/* Tab 5: Actions */}
        {activeTab === 'actions' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-[#FFF8EB] border border-[#F7D488] rounded-xl text-[#8A5B00]">
              <p className="font-bold text-xs mb-1">Role-Based Workflow Execution Engine</p>
              <p className="text-[11px]">
                You are authenticated as <strong>{user?.name}</strong> with role{' '}
                <strong className="underline">{role}</strong>. Only authorized state transitions matching the configured
                workflow route (<span className="font-semibold">{application.workflowRoute}</span>) and your specific scope are available below.
              </p>
            </div>

            {actionError && (
              <div className="p-3 bg-[#FDE8E8] border border-[#F8B4B4] rounded-lg text-[#C44949] text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="space-y-3">
              <label className="block font-bold text-[#27232C] text-xs">
                Select an Authorized Workflow Action:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {eligibleActions.map((item) => (
                  <button
                    key={item.action}
                    onClick={() => {
                      setSelectedAction(item.action);
                      setActionError(null);
                    }}
                    className={`p-3 rounded-lg border text-left transition flex items-center justify-between ${
                      selectedAction === item.action
                        ? 'border-[#321B35] bg-[#321B35]/5 ring-1 ring-[#321B35]'
                        : 'border-[#D9D8DE] bg-white hover:bg-[#F8F9FA]'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-[#27232C] block text-xs">{item.label}</span>
                      <span className="text-[10px] text-[#77727E] uppercase font-mono">{item.action}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#77727E]" />
                  </button>
                ))}
              </div>
            </div>

            {selectedAction && (
              <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#D9D8DE] space-y-3 mt-4">
                <h4 className="font-bold text-[#27232C] text-xs">
                  Confirm Action: {selectedAction}
                </h4>

                {selectedAction === 'ASSIGN' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#77727E] mb-1">
                      Assign to Scrutiny Officer
                    </label>
                    <select
                      value={assigneeName}
                      onChange={(e) => setAssigneeName(e.target.value)}
                      className="w-full p-2 bg-white border border-[#D9D8DE] rounded-lg text-xs"
                    >
                      <option value="Dr. Ramesh Iyer">Dr. Ramesh Iyer (Western Region - Senior Officer)</option>
                      <option value="Dr. Sunita Kulkarni">Dr. Sunita Kulkarni (Western Region)</option>
                      <option value="Prof. Rajesh Bhave">Prof. Rajesh Bhave (Western Region)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-[#77727E] mb-1">
                    Official Remarks / Justification (Logged into Immutable Audit Trail)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter formal reasons, compliance observations, or Council order references..."
                    value={actionRemark}
                    onChange={(e) => setActionRemark(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#D9D8DE] rounded-lg text-xs focus:ring-1 focus:ring-[#321B35]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSelectedAction('')}
                    className="px-3 py-1.5 rounded-lg border border-[#D9D8DE] text-xs font-semibold text-[#77727E] hover:bg-[#E9EAEE]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleExecuteTransition(selectedAction)}
                    disabled={loading}
                    className="px-4 py-1.5 rounded-lg font-bold text-xs bg-[#321B35] text-white hover:bg-[#46264A] transition shadow-xs"
                  >
                    {loading ? 'Processing State Transition...' : 'Execute Transition & Sign Audit Log'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
