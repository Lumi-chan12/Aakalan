import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-[#D9D8DE]">
      <div className="w-12 h-12 rounded-full bg-[#E9EAEE] flex items-center justify-center text-[#77727E] mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[#27232C]">{title}</h3>
      <p className="mt-1 text-xs text-[#77727E] max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-[#321B35] text-white hover:bg-[#46264A] rounded-lg text-xs font-semibold transition shadow-xs"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
