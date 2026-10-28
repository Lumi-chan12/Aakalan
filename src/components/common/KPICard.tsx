import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  highlightColor?: 'aubergine' | 'marigold' | 'success' | 'warning' | 'error';
  badge?: string;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  highlightColor = 'aubergine',
  badge,
  onClick,
}) => {
  const colorMap = {
    aubergine: {
      iconBg: 'bg-[#321B35]/10',
      iconText: 'text-[#321B35]',
      borderHover: 'hover:border-[#321B35]/40',
      bar: 'bg-[#321B35]',
    },
    marigold: {
      iconBg: 'bg-[#F2B544]/15',
      iconText: 'text-[#B87D09]',
      borderHover: 'hover:border-[#F2B544]',
      bar: 'bg-[#F2B544]',
    },
    success: {
      iconBg: 'bg-[#27845A]/10',
      iconText: 'text-[#27845A]',
      borderHover: 'hover:border-[#27845A]/40',
      bar: 'bg-[#27845A]',
    },
    warning: {
      iconBg: 'bg-[#C58A16]/10',
      iconText: 'text-[#C58A16]',
      borderHover: 'hover:border-[#C58A16]/40',
      bar: 'bg-[#C58A16]',
    },
    error: {
      iconBg: 'bg-[#C44949]/10',
      iconText: 'text-[#C44949]',
      borderHover: 'hover:border-[#C44949]/40',
      bar: 'bg-[#C44949]',
    },
  };

  const scheme = colorMap[highlightColor];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-white rounded-xl border border-[#D9D8DE] p-5 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md ' + scheme.borderHover : ''
      }`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 ${scheme.bar}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#77727E]">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-extrabold text-[#27232C]">{value}</span>
            {badge && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[#F4F5F8] text-[#77727E]">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-[#77727E]">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${scheme.iconBg}`}>
          <Icon className={`w-5 h-5 ${scheme.iconText}`} />
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-[#E9EAEE] flex items-center gap-1.5 text-xs">
          <span
            className={`font-semibold ${
              trend.isPositive ? 'text-[#27845A]' : 'text-[#C44949]'
            }`}
          >
            {trend.value}
          </span>
          <span className="text-[#77727E]">{trend.label || 'vs last cycle'}</span>
        </div>
      )}
    </div>
  );
};
