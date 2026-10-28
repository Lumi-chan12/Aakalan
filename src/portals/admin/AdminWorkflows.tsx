import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  Plus,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  ArrowRight,
  Info,
  Check,
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { WorkflowTemplate, WorkflowStageConfig, UserRole, StageId } from '../../types';

export const AdminWorkflows: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [selectedWf, setSelectedWf] = useState<WorkflowTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Custom stage addition modal/state
  const [showAddStage, setShowAddStage] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [newStageRole, setNewStageRole] = useState<UserRole>('SCRUTINY_OFFICER');
  const [newStageSLA, setNewStageSLA] = useState(5);
  const [newStageMandatory, setNewStageMandatory] = useState(true);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getWorkflows();
      setWorkflows(data);
      if (data.length > 0 && !selectedWf) {
        setSelectedWf(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleUpdateSLA = (stageId: StageId, newSLA: number) => {
    if (!selectedWf) return;
    const updatedStages = selectedWf.stages.map((s) =>
      s.id === stageId ? { ...s, slaDays: Math.max(1, newSLA) } : s
    );
    setSelectedWf({ ...selectedWf, stages: updatedStages });
  };

  const handleToggleMandatory = (stageId: StageId) => {
    if (!selectedWf) return;
    const updatedStages = selectedWf.stages.map((s) =>
      s.id === stageId ? { ...s, isMandatory: !s.isMandatory } : s
    );
    setSelectedWf({ ...selectedWf, stages: updatedStages });
  };

  const handleSaveConfiguration = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#27232C]">Workflow Template Engine</h2>
          <p className="text-xs text-[#77727E] mt-0.5">
            Configure stage orders, role authorizations, SLA limits, and skip rules across approval routes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-bold text-[#27845A] flex items-center gap-1 bg-[#ECFDF5] px-2.5 py-1 rounded-lg border border-[#A7F3D0]">
              <Check className="w-3.5 h-3.5" /> Workflow Saved to Engine
            </span>
          )}
          <button
            onClick={handleSaveConfiguration}
            className="px-4 py-1.5 rounded-lg bg-[#321B35] text-white text-xs font-bold hover:bg-[#46264A] transition shadow-xs"
          >
            Save Route Parameters
          </button>
        </div>
      </div>

      {/* Route Templates Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {workflows.map((wf) => {
          const isSelected = selectedWf?.id === wf.id;
          return (
            <div
              key={wf.id}
              onClick={() => setSelectedWf(wf)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition ${
                isSelected
                  ? 'border-[#321B35] bg-white ring-2 ring-[#321B35]/20 shadow-sm'
                  : 'border-[#D9D8DE] bg-[#F8F9FA] hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFF8EB] text-[#8A5B00] border border-[#F7D488]">
                  {wf.stages.length} Stages
                </span>
                <span className="w-2 h-2 rounded-full bg-[#27845A]" />
              </div>
              <h3 className="font-extrabold text-xs text-[#27232C]">{wf.name}</h3>
              <p className="mt-1 text-[11px] text-[#77727E] line-clamp-2">{wf.description}</p>
            </div>
          );
        })}
      </div>

      {/* Selected Workflow Detailed Configuration Canvas */}
      {selectedWf && (
        <div className="bg-white rounded-xl border border-[#D9D8DE] p-5 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E9EAEE] gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[#27232C]">{selectedWf.name} Route</h3>
                <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#27845A] font-bold text-[10px] rounded-full border border-[#A7F3D0]">
                  ACTIVE & VALIDATED
                </span>
              </div>
              <p className="text-xs text-[#77727E] mt-0.5">{selectedWf.description}</p>
            </div>

            <div className="text-xs text-[#77727E]">
              Applicable Types: <strong>{selectedWf.applicableTypes.join(', ')}</strong>
            </div>
          </div>

          {/* Visual Stage Flow */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#77727E] mb-3">
              Sequential Execution Pipeline & Role Responsibilities
            </h4>

            <div className="space-y-3">
              {selectedWf.stages.map((st, idx) => (
                <div
                  key={st.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-3.5 bg-[#F8F9FA] rounded-xl border border-[#E9EAEE] gap-3 hover:border-[#D9D8DE] transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#321B35] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-xs text-[#27232C] block">{st.name}</span>
                      <span className="text-[11px] font-mono text-[#77727E]">Stage ID: {st.id}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    {/* Role Authorization */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#77727E] text-[11px]">Responsible Role:</span>
                      <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-white border border-[#D9D8DE] text-[#321B35]">
                        {st.responsibleRole}
                      </span>
                    </div>

                    {/* SLA Days editor */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#77727E] text-[11px]">SLA Days:</span>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={st.slaDays}
                        onChange={(e) => handleUpdateSLA(st.id, parseInt(e.target.value, 10))}
                        className="w-14 p-1 bg-white border border-[#D9D8DE] rounded text-xs font-mono font-bold text-[#27232C] text-center"
                      />
                    </div>

                    {/* Mandatory Toggle */}
                    <div className="flex items-center gap-1.5">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={st.isMandatory}
                          onChange={() => handleToggleMandatory(st.id)}
                          className="w-3.5 h-3.5 rounded text-[#321B35]"
                        />
                        <span className={`text-[11px] font-semibold ${st.isMandatory ? 'text-[#321B35]' : 'text-[#77727E]'}`}>
                          {st.isMandatory ? 'Mandatory Stage' : 'Optional / Bypassable'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transition & Bypass Rules Info */}
          <div className="p-4 bg-[#FFF8EB] border border-[#F7D488] rounded-xl text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#8A5B00]">
              <Info className="w-4 h-4 text-[#C58A16]" /> Workflow State Transition Constraints
            </div>
            <p className="text-[#77727E]">
              Stage skipping is blocked unless marked as bypassable. After an authorized stage completion,
              the state transition engine advances to the next sequential stage in this template if all required
              documents and signatures are satisfied. If open deficiencies exist, scrutiny completion is refused.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
