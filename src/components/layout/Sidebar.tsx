import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  Users,
  Building2,
  CalendarDays,
  ShieldCheck,
  TrendingDown,
  UserCog,
  FileClock,
  Terminal,
  FilePlus2,
  ClockAlert,
  AlertTriangle,
  FolderOpen,
  ClipboardList,
  CheckCircle,
  History,
  Bell,
  ChevronLeft,
  ChevronRight,
  Landmark,
  FileCheck2,
  BadgeAlert,
  FileSearch,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { user, role, currentPath, navigate, logout } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  if (!user || !role) return null;

  const getNavItems = (currentRole: UserRole): NavItem[] => {
    switch (currentRole) {
      case 'ADMIN':
        return [
          { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'All Applications', path: '/admin/applications', icon: FileText, badge: '8' },
          { label: 'Workflow Configuration', path: '/admin/workflows', icon: GitBranch },
          { label: 'Officer & Workload', path: '/admin/officers', icon: Users },
          { label: 'Regional Monitoring', path: '/admin/regional', icon: Landmark },
          { label: 'EVC Oversight', path: '/admin/evc', icon: CalendarDays, badge: '3' },
          { label: 'Compliance Monitoring', path: '/admin/compliance', icon: ShieldCheck },
          { label: 'Pendency & Escalation', path: '/admin/pendency', icon: TrendingDown, badge: '3', badgeColor: 'bg-[#C44949]' },
          { label: 'User & Role Management', path: '/admin/users', icon: UserCog },
          { label: 'Audit Logs (Immutable)', path: '/admin/audit-logs', icon: FileClock },
          { label: 'Engine Tests & API', path: '/admin/system', icon: Terminal },
        ];

      case 'SCRUTINY_OFFICER':
        return [
          { label: 'My Dashboard', path: '/scrutiny/dashboard', icon: LayoutDashboard },
          { label: 'My Assigned Cases', path: '/scrutiny/assigned', icon: ClipboardList, badge: '5' },
          { label: 'Pending Scrutiny', path: '/scrutiny/pending', icon: FileSearch, badge: '3' },
          { label: 'Re-scrutiny', path: '/scrutiny/rescrutiny', icon: History, badge: '1' },
          { label: 'Returned for Clarification', path: '/scrutiny/returned', icon: AlertTriangle, badge: '1', badgeColor: 'bg-[#C58A16]' },
          { label: 'Completed Scrutiny', path: '/scrutiny/completed', icon: CheckCircle },
          { label: 'My Deadlines', path: '/scrutiny/deadlines', icon: ClockAlert },
          { label: 'Notifications', path: '/scrutiny/notifications', icon: Bell, badge: '2' },
          { label: 'My Activity', path: '/scrutiny/activity', icon: FileClock },
        ];

      case 'REGIONAL_OFFICER':
        return [
          { label: 'Regional Dashboard', path: '/regional/dashboard', icon: LayoutDashboard },
          { label: 'Regional Applications', path: '/regional/applications', icon: FileText, badge: '5' },
          { label: 'Stage-wise Pendency', path: '/regional/pendency', icon: TrendingDown },
          { label: 'Overdue Cases', path: '/regional/overdue', icon: ClockAlert, badge: '2', badgeColor: 'bg-[#C44949]' },
          { label: 'EVC Scheduling', path: '/regional/evc', icon: CalendarDays, badge: '2' },
          { label: 'Institutional Compliance', path: '/regional/compliance', icon: ShieldCheck },
          { label: 'Officer Workload', path: '/regional/workload', icon: Users },
          { label: 'Escalations', path: '/regional/escalations', icon: BadgeAlert, badge: '1', badgeColor: 'bg-[#C44949]' },
          { label: 'Regional Reports', path: '/regional/reports', icon: FileCheck2 },
        ];

      case 'INSTITUTION':
        return [
          { label: 'Institution Dashboard', path: '/institution/dashboard', icon: LayoutDashboard },
          { label: 'New Application', path: '/institution/new-application', icon: FilePlus2, badge: 'Create', badgeColor: 'bg-[#F2B544] text-[#321B35]' },
          { label: 'My Applications', path: '/institution/applications', icon: FileText, badge: '2' },
          { label: 'Application Status', path: '/institution/status', icon: History },
          { label: 'Deficiencies & Clarifications', path: '/institution/deficiencies', icon: AlertTriangle, badge: '1', badgeColor: 'bg-[#C44949]' },
          { label: 'Document Repository', path: '/institution/documents', icon: FolderOpen },
          { label: 'Undertakings & Compliance', path: '/institution/undertakings', icon: ShieldCheck },
          { label: 'Lease & Renewals', path: '/institution/renewals', icon: CalendarDays, badge: 'Expiring', badgeColor: 'bg-[#C58A16]' },
          { label: 'Notifications', path: '/institution/notifications', icon: Bell, badge: '2' },
          { label: 'Institution Profile', path: '/institution/profile', icon: Building2 },
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems(role);

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col bg-[#321B35] text-white transition-all duration-300 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#46264A]">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-[#F2B544] flex items-center justify-center font-extrabold text-[#321B35] text-xl shadow-inner shrink-0">
              आ
            </div>
            <div className="truncate">
              <span className="font-extrabold text-base tracking-wide text-white block">
                AAKALAN
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#F2B544] block">
                AICTE Intelligence
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-10 h-10 rounded-lg bg-[#F2B544] flex items-center justify-center font-extrabold text-[#321B35] text-xl shadow-inner">
              आ
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-md hover:bg-[#46264A] text-[#E9EAEE]/70 hover:text-white transition ${
            collapsed ? 'hidden' : 'block'
          }`}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Role Pill */}
      <div className="px-3 py-2.5 bg-[#241326] border-b border-[#46264A]">
        {!collapsed ? (
          <div>
            <div className="text-[10px] uppercase font-semibold text-[#E9EAEE]/60 tracking-wider">
              Portal Mode
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-xs font-bold text-[#F2B544] truncate">
                {role.replace('_', ' ')}
              </span>
              {user.region && (
                <span className="text-[10px] px-1.5 py-0.2 bg-[#46264A] text-white rounded font-mono">
                  {user.region}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <span className="text-[10px] font-bold text-[#F2B544]">
              {role.slice(0, 3)}
            </span>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-[#F2B544] text-[#321B35] font-bold shadow-xs'
                  : 'text-[#E9EAEE]/80 hover:bg-[#46264A] hover:text-white'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-[#321B35]' : 'text-[#E9EAEE]/70 group-hover:text-white'
                }`}
              />

              {!collapsed && (
                <div className="flex-1 text-left flex items-center justify-between truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        item.badgeColor || (isActive ? 'bg-[#321B35] text-[#F2B544]' : 'bg-[#46264A] text-[#F2B544]')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Toggle & User Snippet */}
      <div className="p-3 border-t border-[#46264A] bg-[#241326]/70">
        {!collapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-[#46264A] flex items-center justify-center font-bold text-xs text-[#F2B544] shrink-0 border border-[#F2B544]/30">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="truncate flex-1">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-[#E9EAEE]/60 truncate">{user.designation}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out / Switch Persona"
              className="p-1.5 rounded-lg text-[#E9EAEE]/60 hover:text-[#C44949] hover:bg-[#46264A] transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => setCollapsed(false)}
              className="p-2 rounded hover:bg-[#46264A] text-[#E9EAEE]/70 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
