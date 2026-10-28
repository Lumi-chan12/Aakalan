import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { AdminDashboard } from './portals/admin/AdminDashboard';
import { AdminApplications } from './portals/admin/AdminApplications';
import { AdminWorkflows } from './portals/admin/AdminWorkflows';
import { AdminOfficers } from './portals/admin/AdminOfficers';
import { AdminEVC } from './portals/admin/AdminEVC';
import { AdminCompliance } from './portals/admin/AdminCompliance';
import { AdminAuditLogs } from './portals/admin/AdminAuditLogs';
import { AdminSystem } from './portals/admin/AdminSystem';
import { ScrutinyPortal } from './portals/scrutiny/ScrutinyPortal';
import { RegionalPortal } from './portals/regional/RegionalPortal';
import { InstitutionPortal } from './portals/institution/InstitutionPortal';
import { LoginPage } from './components/auth/LoginPage';
import { VoiceAssistant } from './components/voice/VoiceAssistant';
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, role, currentPath, navigate, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E9EAEE] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#321B35] border-t-[#F2B544] rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#27232C] tracking-wide uppercase">
            Initializing Aakalan Security Context...
          </p>
        </div>
      </div>
    );
  }

  // Render Login Page for unauthenticated sessions or when on /login path
  if (!user || !role || currentPath === '/login') {
    return <LoginPage />;
  }

  // Role Gate & Access Denied (403) Guard
  const isAuthorizedForCurrentPath = (): { authorized: boolean; targetDefault: string } => {
    const defaultRoute = {
      ADMIN: '/admin/dashboard',
      SCRUTINY_OFFICER: '/scrutiny/dashboard',
      REGIONAL_OFFICER: '/regional/dashboard',
      INSTITUTION: '/institution/dashboard',
    }[role] || '/admin/dashboard';

    if (currentPath.startsWith('/admin') && role !== 'ADMIN') {
      return { authorized: false, targetDefault: defaultRoute };
    }
    if (currentPath.startsWith('/scrutiny') && role !== 'SCRUTINY_OFFICER') {
      return { authorized: false, targetDefault: defaultRoute };
    }
    if (currentPath.startsWith('/regional') && role !== 'REGIONAL_OFFICER') {
      return { authorized: false, targetDefault: defaultRoute };
    }
    if (currentPath.startsWith('/institution') && role !== 'INSTITUTION') {
      return { authorized: false, targetDefault: defaultRoute };
    }
    return { authorized: true, targetDefault: defaultRoute };
  };

  const gateCheck = isAuthorizedForCurrentPath();

  const getPageTitle = (): string => {
    if (currentPath.includes('/admin/workflows')) return 'Workflow Template Studio';
    if (currentPath.includes('/admin/applications')) return 'All Applications Register';
    if (currentPath.includes('/admin/officers')) return 'Scrutiny Officer Workload';
    if (currentPath.includes('/admin/evc')) return 'Expert Visit Committee (EVC)';
    if (currentPath.includes('/admin/compliance')) return 'Statutory Compliance Register';
    if (currentPath.includes('/admin/audit-logs')) return 'Immutable System Audit Logs';
    if (currentPath.includes('/admin/system')) return 'Workflow Diagnostics & API Docs';
    if (currentPath.startsWith('/admin')) return 'Central Administration Command';
    if (currentPath.startsWith('/scrutiny')) return 'Scrutiny Officer Desk';
    if (currentPath.startsWith('/regional')) return `${user.region || 'Regional'} Bureau Directorate`;
    if (currentPath.includes('/institution/new-application')) return 'New AICTE Application Wizard';
    if (currentPath.startsWith('/institution')) return 'Institution Compliance Portal';
    return 'Intelligence Platform';
  };

  // Render view component based on path
  const renderView = () => {
    if (!gateCheck.authorized) {
      return (
        <div className="p-8 max-w-xl mx-auto my-12 bg-white rounded-2xl border border-[#F8B4B4] p-8 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 bg-[#FDE8E8] text-[#C44949] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#FDE8E8] text-[#C44949] border border-[#F8B4B4]">
              403 ACCESS DENIED
            </span>
            <h2 className="text-xl font-extrabold text-[#27232C] mt-2">
              Unauthorized Role Access
            </h2>
            <p className="text-xs text-[#77727E] mt-1 max-w-md mx-auto">
              You are authenticated as <strong>{user.name}</strong> with role{' '}
              <strong className="text-[#321B35] underline">{role}</strong>. This URL is restricted to authorized
              personnel only and cannot be accessed from your account.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => navigate(gateCheck.targetDefault)}
              className="px-4 py-2 bg-[#321B35] text-white rounded-lg text-xs font-bold hover:bg-[#46264A] transition flex items-center gap-1.5 mx-auto shadow-xs"
            >
              Return to Authorized Portal <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      );
    }

    // ADMIN ROUTES
    if (currentPath === '/admin/dashboard' || currentPath === '/' || currentPath === '/admin') {
      return <AdminDashboard />;
    }
    if (currentPath === '/admin/applications') {
      return <AdminApplications />;
    }
    if (currentPath === '/admin/workflows') {
      return <AdminWorkflows />;
    }
    if (currentPath === '/admin/officers' || currentPath === '/admin/users') {
      return <AdminOfficers />;
    }
    if (currentPath === '/admin/evc') {
      return <AdminEVC />;
    }
    if (currentPath === '/admin/compliance') {
      return <AdminCompliance />;
    }
    if (currentPath === '/admin/pendency' || currentPath === '/admin/regional') {
      return <AdminDashboard />;
    }
    if (currentPath === '/admin/audit-logs') {
      return <AdminAuditLogs />;
    }
    if (currentPath === '/admin/system') {
      return <AdminSystem />;
    }

    // SCRUTINY OFFICER ROUTES
    if (currentPath === '/scrutiny/dashboard' || currentPath === '/scrutiny') {
      return <ScrutinyPortal viewMode="dashboard" />;
    }
    if (currentPath === '/scrutiny/assigned') {
      return <ScrutinyPortal viewMode="assigned" />;
    }
    if (currentPath === '/scrutiny/pending') {
      return <ScrutinyPortal viewMode="pending" />;
    }
    if (currentPath === '/scrutiny/rescrutiny') {
      return <ScrutinyPortal viewMode="rescrutiny" />;
    }
    if (currentPath === '/scrutiny/returned') {
      return <ScrutinyPortal viewMode="returned" />;
    }
    if (currentPath === '/scrutiny/completed') {
      return <ScrutinyPortal viewMode="completed" />;
    }
    if (currentPath === '/scrutiny/deadlines' || currentPath === '/scrutiny/notifications') {
      return <ScrutinyPortal viewMode="deadlines" />;
    }
    if (currentPath === '/scrutiny/activity') {
      return <ScrutinyPortal viewMode="activity" />;
    }

    // REGIONAL OFFICER ROUTES
    if (currentPath === '/regional/dashboard' || currentPath === '/regional') {
      return <RegionalPortal viewMode="dashboard" />;
    }
    if (currentPath === '/regional/applications') {
      return <RegionalPortal viewMode="applications" />;
    }
    if (currentPath === '/regional/evc') {
      return <RegionalPortal viewMode="evc" />;
    }
    if (currentPath.startsWith('/regional/')) {
      return <RegionalPortal viewMode="dashboard" />;
    }

    // INSTITUTION ROUTES
    if (currentPath === '/institution/new-application') {
      return <InstitutionPortal viewMode="new-application" />;
    }
    if (currentPath.startsWith('/institution')) {
      return <InstitutionPortal viewMode="dashboard" />;
    }

    return <AdminDashboard />;
  };

  return (
    <div className="min-h-screen bg-[#E9EAEE] text-[#27232C] flex">
      {/* Role-Specific Collapsible Sidebar */}
      <Sidebar />

      {/* Main Workspace */}
      <div className="flex-1 ml-20 lg:ml-64 flex flex-col min-w-0 transition-all duration-300">
        <Navbar pageTitle={getPageTitle()} />

        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">
          {renderView()}
        </main>

        {/* Footer */}
        <footer className="mt-auto px-6 py-4 border-t border-[#D9D8DE] bg-[#F4F5F8] text-[#77727E] text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#321B35]">Aakalan v2.4</span>
            <span>•</span>
            <span>AICTE Approval & Compliance Intelligence Platform</span>
          </div>
          <div className="text-[11px]">
            Designed for Smart India Hackathon Prototype | Secured Role-Based Workflows
          </div>
        </footer>
      </div>

      {/* Floating Voice Assistant (Bottom-Right) */}
      <VoiceAssistant />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
