import React from 'react';
import { OverallStatus, StageId, StageStatus } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'stage' | 'status' | 'severity' | 'role' | 'overdue' | 'compliance';
  stage?: StageId;
  status?: OverallStatus | StageStatus;
  severity?: 'HIGH' | 'MEDIUM' | 'LOW';
  isOverdue?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'status',
  stage,
  status,
  severity,
  isOverdue,
  className = '',
}) => {
  if (isOverdue) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FDE8E8] text-[#C44949] border border-[#F8B4B4] ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#C44949] animate-pulse"></span>
        OVERDUE
      </span>
    );
  }

  if (variant === 'stage' && stage) {
    const stageLabels: Record<StageId, { label: string; bg: string; text: string; border: string }> = {
      SUBMISSION: { label: 'Submission', bg: 'bg-[#F4F5F8]', text: 'text-[#27232C]', border: 'border-[#D9D8DE]' },
      INITIAL_SCREENING: { label: 'Initial Screening', bg: 'bg-[#EFF6FF]', text: 'text-[#1E40AF]', border: 'border-[#BFDBFE]' },
      SCRUTINY: { label: 'Scrutiny', bg: 'bg-[#FFF8EB]', text: 'text-[#8A5B00]', border: 'border-[#F7D488]' },
      DEFICIENCY_CORRECTION: { label: 'Deficiency Correction', bg: 'bg-[#FDE8E8]', text: 'text-[#C44949]', border: 'border-[#F8B4B4]' },
      EVC_SCHEDULING: { label: 'EVC Scheduling', bg: 'bg-[#F3E8FF]', text: 'text-[#6B21A8]', border: 'border-[#E9D5FF]' },
      EVC_INSPECTION: { label: 'EVC Inspection', bg: 'bg-[#ECFDF5]', text: 'text-[#27845A]', border: 'border-[#A7F3D0]' },
      SAC_SHC_REVIEW: { label: 'SAC/SHC Review', bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', border: 'border-[#FDE68A]' },
      APPROVAL_COUNCIL: { label: 'Council Approval', bg: 'bg-[#F0FDF4]', text: 'text-[#166534]', border: 'border-[#BBF7D0]' },
      CLOSED: { label: 'Case Closed', bg: 'bg-[#F3F4F6]', text: 'text-[#4B5563]', border: 'border-[#E5E7EB]' },
    };
    const s = stageLabels[stage] || { label: stage, bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${s.bg} ${s.text} ${s.border} ${className}`}>
        {children || s.label}
      </span>
    );
  }

  if (variant === 'severity' && severity) {
    const map = {
      HIGH: 'bg-[#FDE8E8] text-[#C44949] border-[#F8B4B4]',
      MEDIUM: 'bg-[#FFF8EB] text-[#C58A16] border-[#F7D488]',
      LOW: 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${map[severity]} ${className}`}>
        {severity}
      </span>
    );
  }

  if (variant === 'compliance') {
    const textStr = String(children || status || '');
    if (textStr.includes('VERIFIED') || textStr.includes('SUBMITTED')) {
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ECFDF5] text-[#27845A] border border-[#A7F3D0] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#27845A]"></span>
          {children || 'VERIFIED'}
        </span>
      );
    }
    if (textStr.includes('EXPIRING')) {
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFF8EB] text-[#C58A16] border border-[#F7D488] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#C58A16]"></span>
          {children || 'EXPIRING SOON'}
        </span>
      );
    }
    if (textStr.includes('EXPIRED') || textStr.includes('MISSING')) {
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FDE8E8] text-[#C44949] border border-[#F8B4B4] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#C44949]"></span>
          {children || 'EXPIRED'}
        </span>
      );
    }
  }

  // Default overall status styling
  const statusStr = String(status || children || '');
  let badgeStyle = 'bg-gray-100 text-gray-700 border-gray-200';

  if (['Approved', 'COMPLETED', 'VERIFIED'].includes(statusStr)) {
    badgeStyle = 'bg-[#ECFDF5] text-[#27845A] border-[#A7F3D0]';
  } else if (['Under Scrutiny', 'IN_PROGRESS'].includes(statusStr)) {
    badgeStyle = 'bg-[#FFF8EB] text-[#8A5B00] border-[#F7D488]';
  } else if (['Deficiency Raised', 'RETURNED', 'REJECTED', 'Rejected'].includes(statusStr)) {
    badgeStyle = 'bg-[#FDE8E8] text-[#C44949] border-[#F8B4B4]';
  } else if (['EVC Scheduled', 'EVC Completed'].includes(statusStr)) {
    badgeStyle = 'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]';
  } else if (['Submitted', 'PENDING', 'RESUBMITTED'].includes(statusStr)) {
    badgeStyle = 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle} ${className}`}>
      {children || statusStr}
    </span>
  );
};
