import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  MapPin,
  Check,
  Building,
  UserCheck,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import { NotificationItem, Region } from '../../types';

interface NavbarProps {
  pageTitle?: string;
  onSearchChange?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  pageTitle = 'Intelligence Dashboard',
  onSearchChange,
}) => {
  const { user, role, roleKey, switchRole, logout, selectedRegion, setSelectedRegion } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const loadNotifications = async () => {
    try {
      const data = await ApiService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications in Navbar', err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [roleKey]);

  const handleAcknowledge = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await ApiService.acknowledgeNotification(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, acknowledged: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.acknowledged).length;

  const regions: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Regions (India)' },
    { id: 'Western', label: 'Western (Mumbai/Pune)' },
    { id: 'Northern', label: 'Northern (Delhi/NCR)' },
    { id: 'Southern', label: 'Southern (Chennai/TN)' },
    { id: 'Eastern', label: 'Eastern (Kolkata/Bhubaneswar)' },
    { id: 'Central', label: 'Central (Bhopal/MP)' },
    { id: 'South-Western', label: 'South-Western (Bengaluru)' },
  ];

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-[#D9D8DE] shadow-xs">
      {/* SIH Prototype Notice Banner */}
      <div className="bg-[#321B35] text-white px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-[#46264A]">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.2 bg-[#F2B544] text-[#321B35] font-extrabold rounded text-[10px] uppercase tracking-wider">
            SIH Prototype
          </span>
          <span className="text-[#E9EAEE]/90 font-medium">
            Aakalan — AICTE Approval & Compliance Intelligence Platform
          </span>
        </div>
        <div className="text-[11px] text-[#F2B544] font-medium hidden md:flex items-center gap-1.5">
          <span>⚠️ Fictional Institutional Data for Demonstration Purposes. Not an Official AICTE Website.</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="px-4 lg:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Current Page Title */}
        <div className="flex items-center gap-3">
          <h1 className="text-base font-extrabold text-[#27232C] truncate">
            {pageTitle}
          </h1>
          {user?.region && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#FFF8EB] text-[#8A5B00] border border-[#F7D488]">
              <MapPin className="w-3 h-3 text-[#B87D09]" />
              {user.region} Region
            </span>
          )}
        </div>

        {/* Center: Global Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#77727E]" />
            <input
              type="text"
              placeholder="Search application ID, institution, faculty or document..."
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value);
                if (onSearchChange) onSearchChange(e.target.value);
              }}
              className="w-full pl-9 pr-4 py-1.5 bg-[#F4F5F8] border border-[#D9D8DE] rounded-lg text-xs text-[#27232C] placeholder-[#77727E] focus:outline-none focus:ring-1 focus:ring-[#321B35] focus:border-[#321B35] transition"
            />
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Region Selector (Only for Admin or view toggling) */}
          {role === 'ADMIN' && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#77727E] bg-[#F4F5F8] px-2.5 py-1 rounded-lg border border-[#D9D8DE]">
              <MapPin className="w-3.5 h-3.5 text-[#321B35]" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-transparent font-medium text-[#27232C] focus:outline-none text-xs cursor-pointer"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Demo Role Switcher */}
          <div className="relative flex items-center bg-[#F4F5F8] p-1 rounded-lg border border-[#D9D8DE]">
            <span className="text-[10px] uppercase font-bold text-[#77727E] px-2 hidden sm:inline">
              Role:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => switchRole('admin')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  roleKey === 'admin'
                    ? 'bg-[#321B35] text-white shadow-xs'
                    : 'text-[#27232C] hover:bg-[#E9EAEE]'
                }`}
                title="Switch to Administration Portal"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => switchRole('scrutiny')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  roleKey === 'scrutiny'
                    ? 'bg-[#321B35] text-white shadow-xs'
                    : 'text-[#27232C] hover:bg-[#E9EAEE]'
                }`}
                title="Switch to Scrutiny Officer (Dr. Ramesh Iyer)"
              >
                Scrutiny
              </button>
              <button
                type="button"
                onClick={() => switchRole('regional')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  roleKey === 'regional'
                    ? 'bg-[#321B35] text-white shadow-xs'
                    : 'text-[#27232C] hover:bg-[#E9EAEE]'
                }`}
                title="Switch to Regional Officer (Western Region)"
              >
                Regional
              </button>
              <button
                type="button"
                onClick={() => switchRole('institution')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  roleKey === 'institution'
                    ? 'bg-[#321B35] text-white shadow-xs'
                    : 'text-[#27232C] hover:bg-[#E9EAEE]'
                }`}
                title="Switch to Institution (Bharati Vidyapeeth)"
              >
                Institution
              </button>
            </div>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-[#77727E] hover:bg-[#F4F5F8] hover:text-[#27232C] transition border border-[#D9D8DE]"
              title="Alert Centre"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C44949] text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#D9D8DE] overflow-hidden z-50">
                <div className="p-3 bg-[#F8F9FA] border-b border-[#E9EAEE] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-[#27232C]">Alerts & Deadlines</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#F2B544] text-[#321B35] rounded">
                      {unreadCount} New
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-[#77727E] hover:text-[#27232C]"
                  >
                    Close
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#E9EAEE]">
                  {notifications.length > 0 ? (
                    notifications.map((n) => {
                      const isCrit = n.priority === 'CRITICAL';
                      return (
                        <div
                          key={n.id}
                          className={`p-3 text-xs transition hover:bg-[#F4F5F8] ${
                            n.acknowledged ? 'opacity-60' : 'bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                                isCrit ? 'bg-[#FDE8E8] text-[#C44949]' : 'bg-[#FFF8EB] text-[#8A5B00]'
                              }`}
                            >
                              {n.type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] text-[#77727E]">
                              {new Date(n.createdAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <p className="mt-1 font-bold text-[#27232C]">{n.title}</p>
                          <p className="mt-0.5 text-[#77727E]">{n.message}</p>

                          <div className="mt-2 flex items-center justify-between text-[11px]">
                            {n.dueDate && (
                              <span className="text-[#C44949] font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Due: {new Date(n.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            {!n.acknowledged && (
                              <button
                                onClick={(e) => handleAcknowledge(n.id, e)}
                                className="ml-auto text-[#321B35] hover:text-[#46264A] font-semibold underline"
                              >
                                Acknowledge
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-xs text-[#77727E]">No active notifications</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sign Out / Switch Persona Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#D9D8DE] text-xs font-semibold text-[#77727E] hover:text-[#C44949] hover:bg-[#FDE8E8] hover:border-[#F8B4B4] transition"
            title="Sign Out & Switch Persona"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
