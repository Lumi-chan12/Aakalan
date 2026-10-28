import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  Landmark,
  FileSearch,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface PersonaCard {
  id: 'admin' | 'scrutiny' | 'regional' | 'institution';
  role: UserRole;
  title: string;
  badge: string;
  badgeColor: string;
  name: string;
  designation: string;
  organization: string;
  email: string;
  targetRoute: string;
  icon: React.ElementType;
  keyPermissions: string[];
  description: string;
}

const PERSONAS: PersonaCard[] = [
  {
    id: 'admin',
    role: 'ADMIN',
    title: 'Central Administration',
    badge: 'AICTE HQ New Delhi',
    badgeColor: 'bg-[#321B35] text-white',
    name: 'Dr. Arvind K. Sharma',
    designation: 'Chief Administrative & Compliance Officer',
    organization: 'Approval Bureau, AICTE Headquarters',
    email: 'admin@aicte.gov.in',
    targetRoute: '/admin/dashboard',
    icon: Landmark,
    keyPermissions: [
      'National approval oversight & statistics',
      'Configurable workflow route templates & SLAs',
      'EVC committee oversight & conflict checks',
      'Immutable WORM audit logs access',
    ],
    description:
      'Executive governance console for monitoring cross-regional pendency, defining stage order rules, and issuing final Council sanction orders.',
  },
  {
    id: 'scrutiny',
    role: 'SCRUTINY_OFFICER',
    title: 'Technical Scrutiny Officer',
    badge: 'Scrutiny Committee (WR)',
    badgeColor: 'bg-[#FFF8EB] text-[#8A5B00] border border-[#F7D488]',
    name: 'Dr. Ramesh Iyer',
    designation: 'Senior Technical Scrutiny Officer',
    organization: 'Engineering & Technology Board',
    email: 'ramesh.iyer@aicte.gov.in',
    targetRoute: '/scrutiny/dashboard',
    icon: FileSearch,
    keyPermissions: [
      'Inspect submitted dossiers & certificates',
      'Flag document deficiencies with mandatory reasons',
      'Review resubmitted clarifications',
      'Complete scrutiny & forward to EVC / SAC',
    ],
    description:
      'Desk verification desk for assigned cases. Responsible for scrutinizing lease deeds, fire safety NOCs, faculty cadre ratios, and AICTE handbook compliance.',
  },
  {
    id: 'regional',
    role: 'REGIONAL_OFFICER',
    title: 'Regional Officer & Director',
    badge: 'Western Regional Office (Mumbai)',
    badgeColor: 'bg-[#ECFDF5] text-[#27845A] border border-[#A7F3D0]',
    name: 'Smt. Meenakshi Sundaram',
    designation: 'Regional Officer & Bureau Director',
    organization: 'Western Regional Office (WRO), Mumbai',
    email: 'regional.wr@aicte.gov.in',
    targetRoute: '/regional/dashboard',
    icon: Building2,
    keyPermissions: [
      'Strictly isolated to Western Region records',
      'Constitute 3-member EVC inspection panels',
      'Screen applications & assign scrutiny officers',
      'Monitor regional SLA pendency & escalations',
    ],
    description:
      'Bureau directorate managing regional institution approvals, inspection schedules, officer assignments, and SLA compliance within the Western Region.',
  },
  {
    id: 'institution',
    role: 'INSTITUTION',
    title: 'Technical Institution',
    badge: 'College Registrar • BVIT-5124',
    badgeColor: 'bg-[#F2B544] text-[#321B35]',
    name: 'Prof. Ananya Sen',
    designation: 'Registrar',
    organization: 'Bharati Vidyapeeth Institute of Technology',
    email: 'registrar@bvit.ac.in',
    targetRoute: '/institution/dashboard',
    icon: Users,
    keyPermissions: [
      'Lodge new EoA & course expansion applications',
      'Submit formal clarifications for deficiencies',
      '30-year lease deed & safety NOC registry',
      'Track real-time stage movements & decisions',
    ],
    description:
      'Applicant self-service portal for technical colleges and polytechnics to submit compliance documents, track application progress, and manage regulatory filings.',
  },
];

export const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();
  const [selectedPersonaId, setSelectedPersonaId] = useState<'admin' | 'scrutiny' | 'regional' | 'institution'>('admin');
  const [email, setEmail] = useState('admin@aicte.gov.in');
  const [password, setPassword] = useState('••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedPersona = PERSONAS.find((p) => p.id === selectedPersonaId)!;

  const handleSelectPersona = (p: PersonaCard) => {
    setSelectedPersonaId(p.id);
    setEmail(p.email);
    setPassword('••••••••••');
    setErrorMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await login({
        email,
        role: selectedPersona.role,
        password,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickLogin = async (persona: PersonaCard) => {
    setErrorMessage(null);
    setSelectedPersonaId(persona.id);
    setEmail(persona.email);
    try {
      await login({
        email: persona.email,
        role: persona.role,
        password: 'demo-password',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Quick login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#E9EAEE] flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="max-w-6xl mx-auto w-full text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#321B35] text-white rounded-full text-xs font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#F2B544] animate-pulse" />
          <span>Smart India Hackathon Prototype — Fictional Institutional Data for Evaluation</span>
        </div>

        <div className="flex items-center justify-center gap-3 mt-2">
          <div className="w-12 h-12 rounded-xl bg-[#321B35] text-[#F2B544] flex items-center justify-center font-extrabold text-2xl shadow-md border border-[#F2B544]/30">
            आ
          </div>
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#27232C] tracking-tight">
              AAKALAN
            </h1>
            <p className="text-xs font-bold text-[#77727E] tracking-wider uppercase">
              AICTE Approval & Compliance Intelligence Platform
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Persona Selection Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#321B35]">
                1. Select Stakeholder Persona
              </h2>
              <p className="text-xs text-[#77727E]">
                Choose one of the four genuine role-specific portals to authenticate:
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[#77727E]">
              4 Dedicated Portals
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PERSONAS.map((p) => {
              const isSelected = selectedPersonaId === p.id;
              const Icon = p.icon;

              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPersona(p)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all relative ${
                    isSelected
                      ? 'border-[#321B35] bg-white ring-2 ring-[#321B35] shadow-md'
                      : 'border-[#D9D8DE] bg-[#F8F9FA] hover:bg-white hover:border-[#321B35]/40 shadow-xs'
                  }`}
                >
                  {/* Persona Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-[#321B35] text-[#F2B544]' : 'bg-[#E9EAEE] text-[#321B35]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-[#27232C]">{p.title}</h3>
                  <p className="text-xs font-semibold text-[#321B35] mt-0.5">{p.name}</p>
                  <p className="text-[11px] text-[#77727E] truncate">{p.designation}</p>

                  <p className="mt-2 text-[11px] text-[#77727E] line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-[#E9EAEE] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#77727E]">{p.email}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickLogin(p);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#321B35] text-white hover:bg-[#46264A]'
                          : 'bg-[#E9EAEE] text-[#321B35] hover:bg-[#321B35] hover:text-white'
                      }`}
                    >
                      Quick Login →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Persona Permissions Preview Box */}
          <div className="bg-white p-4 rounded-xl border border-[#D9D8DE] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#321B35]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#27845A]" /> Authorized Scope for {selectedPersona.title}
              </span>
              <span className="font-mono text-[10px] text-[#77727E]">Target: {selectedPersona.targetRoute}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {selectedPersona.keyPermissions.map((perm, i) => (
                <div key={i} className="flex items-center gap-2 text-[#27232C] text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F2B544] shrink-0" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#D9D8DE] shadow-md p-6 space-y-5">
          <div className="border-b border-[#E9EAEE] pb-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#77727E] block">
              Government Single Sign-On (SSO)
            </span>
            <h2 className="text-lg font-extrabold text-[#27232C] mt-0.5">
              Sign In as {selectedPersona.title}
            </h2>
            <p className="text-xs text-[#77727E] mt-0.5">
              Access the secure {selectedPersona.role.toLowerCase().replace('_', ' ')} workspace
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-[#FDE8E8] border border-[#F8B4B4] rounded-lg text-xs font-semibold text-[#C44949] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            {/* Email Field */}
            <div>
              <label className="block font-bold text-[#27232C] mb-1">
                Authorized Email ID / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#77727E]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#F8F9FA] border border-[#D9D8DE] rounded-lg text-xs font-medium text-[#27232C] focus:ring-1 focus:ring-[#321B35] focus:bg-white"
                />
              </div>
              <span className="text-[10px] text-[#77727E] mt-0.5 block font-mono">
                Pre-configured: {selectedPersona.email}
              </span>
            </div>

            {/* Password Field */}
            <div>
              <label className="block font-bold text-[#27232C] mb-1">
                Password / Security PIN
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#77727E]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 bg-[#F8F9FA] border border-[#D9D8DE] rounded-lg text-xs font-mono text-[#27232C] focus:ring-1 focus:ring-[#321B35] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77727E] hover:text-[#27232C]"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Security Verification Badge */}
            <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E9EAEE] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#27845A]" />
                <div>
                  <span className="font-bold text-[11px] text-[#27232C] block">256-Bit SSL Enforced</span>
                  <span className="text-[10px] text-[#77727E]">Role derived server-side via JWT/Session</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#27845A] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                ACTIVE
              </span>
            </div>

            {/* Login Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#321B35] hover:bg-[#46264A] text-white font-extrabold text-xs rounded-lg transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to {selectedPersona.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin(selectedPersona)}
                disabled={loading}
                className="w-full py-2 px-4 bg-[#F2B544] hover:bg-[#E5A734] text-[#321B35] font-extrabold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Instant 1-Click Evaluation Login</span>
              </button>
            </div>
          </form>

          {/* Persona Switcher Quick Links */}
          <div className="pt-3 border-t border-[#E9EAEE] text-center">
            <span className="text-[11px] text-[#77727E] block mb-2">Or click to switch persona directly:</span>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {PERSONAS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPersona(p)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                    selectedPersonaId === p.id
                      ? 'bg-[#321B35] text-white'
                      : 'bg-[#F4F5F8] text-[#77727E] hover:text-[#27232C] hover:bg-[#E9EAEE]'
                  }`}
                >
                  {p.title.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto w-full text-center text-xs text-[#77727E] pt-6 border-t border-[#D9D8DE] mt-6">
        <p className="font-semibold text-[#27232C]">
          All India Council for Technical Education (AICTE) — Smart India Hackathon Prototype
        </p>
        <p className="text-[11px] text-[#77727E] mt-0.5">
          Role-Based Access Control Enforced • Fictional Demo Accounts for Prototype Validation
        </p>
      </div>
    </div>
  );
};
