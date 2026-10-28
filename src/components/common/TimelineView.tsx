import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ArrowRight, XCircle } from 'lucide-react';
import { Application, StageId, TimelineEvent } from '../../types';

interface TimelineViewProps {
  application: Application;
  compact?: boolean;
}

const STAGE_ORDER: { id: StageId; name: string }[] = [
  { id: 'SUBMISSION', name: 'Submission' },
  { id: 'INITIAL_SCREENING', name: 'Screening' },
  { id: 'SCRUTINY', name: 'Scrutiny' },
  { id: 'EVC_SCHEDULING', name: 'EVC Scheduling' },
  { id: 'EVC_INSPECTION', name: 'EVC Inspection' },
  { id: 'SAC_SHC_REVIEW', name: 'SAC/SHC' },
  { id: 'APPROVAL_COUNCIL', name: 'Council Review' },
  { id: 'CLOSED', name: 'Approval Issued' },
];

export const TimelineView: React.FC<TimelineViewProps> = ({ application, compact = false }) => {
  const currentStageIndex = STAGE_ORDER.findIndex((s) => s.id === application.currentStage);

  return (
    <div className="space-y-6">
      {/* Visual Pipeline Bar */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#77727E] mb-3">
          <span>Workflow Route: {application.workflowRoute}</span>
          <span className="text-[#321B35] font-bold">Current Stage: {application.currentStage.replace(/_/g, ' ')}</span>
        </div>

        <div className="relative">
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center min-w-[650px] justify-between">
              {STAGE_ORDER.map((stage, idx) => {
                const isPassed = currentStageIndex > idx;
                const isCurrent = currentStageIndex === idx;
                const isReturned = isCurrent && application.stageStatus === 'RETURNED';
                const isDeficiency = application.currentStage === 'DEFICIENCY_CORRECTION' && stage.id === 'SCRUTINY';

                return (
                  <React.Fragment key={stage.id}>
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isReturned || isDeficiency
                            ? 'bg-[#FDE8E8] text-[#C44949] ring-4 ring-[#FDE8E8] border border-[#C44949]'
                            : isCurrent
                            ? 'bg-[#F2B544] text-[#321B35] ring-4 ring-[#FFF8EB] border-2 border-[#E5A734] font-extrabold shadow-sm'
                            : isPassed
                            ? 'bg-[#27845A] text-white shadow-xs'
                            : 'bg-[#E9EAEE] text-[#77727E]'
                        }`}
                      >
                        {isPassed ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : isReturned || isDeficiency ? (
                          <AlertTriangle className="w-4 h-4 text-[#C44949]" />
                        ) : isCurrent ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#321B35] animate-ping" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      <span
                        className={`mt-2 text-center text-[11px] font-semibold leading-tight line-clamp-2 max-w-[80px] ${
                          isCurrent
                            ? 'text-[#321B35] font-bold'
                            : isPassed
                            ? 'text-[#27845A]'
                            : isReturned || isDeficiency
                            ? 'text-[#C44949]'
                            : 'text-[#77727E]'
                        }`}
                      >
                        {stage.name}
                      </span>
                    </div>

                    {idx < STAGE_ORDER.length - 1 && (
                      <div
                        className={`h-1 flex-1 -mt-6 transition-all ${
                          isPassed ? 'bg-[#27845A]' : 'bg-[#D9D8DE]'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="mt-6 pt-4 border-t border-[#E9EAEE]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#77727E] mb-3">
            Official Action Audit Trail
          </h4>

          {application.timeline && application.timeline.length > 0 ? (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D9D8DE]">
              {application.timeline.map((event: TimelineEvent, idx: number) => {
                const isReturned = event.status === 'RETURNED';
                const isCompleted = event.status === 'COMPLETED';

                return (
                  <div key={event.id || idx} className="relative group">
                    <span
                      className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center ${
                        isReturned
                          ? 'border-[#C44949] text-[#C44949]'
                          : isCompleted
                          ? 'border-[#27845A] text-[#27845A]'
                          : 'border-[#F2B544] text-[#F2B544]'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-3 h-3 fill-current" />
                      ) : isReturned ? (
                        <XCircle className="w-3 h-3 fill-current" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                    </span>

                    <div className="bg-[#F8F9FA] rounded-lg p-3 border border-[#E9EAEE] text-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-[#27232C]">{event.stageName || event.stage}</span>
                        <span className="text-[11px] text-[#77727E] font-mono">
                          {new Date(event.enteredAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2 text-[#77727E]">
                        <span className="font-medium text-[#321B35]">{event.actorName}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.2 bg-white border border-[#D9D8DE] rounded text-[10px] uppercase font-semibold">
                          {event.actorRole}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-emerald-800">{event.action}</span>
                      </div>
                      {event.remarks && (
                        <div className="bg-white p-2 rounded border border-[#E9EAEE] text-[#27232C] italic">
                          "{event.remarks}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-[#77727E]">No prior stage movements recorded.</p>
          )}
        </div>
      )}
    </div>
  );
};
