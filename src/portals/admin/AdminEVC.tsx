import React, { useState, useEffect } from 'react';
import { CalendarDays, AlertTriangle, CheckCircle2, MapPin, Users, ShieldAlert } from 'lucide-react';
import { ApiService } from '../../services/api';
import { EVCVisit } from '../../types';

export const AdminEVC: React.FC = () => {
  const [visits, setVisits] = useState<EVCVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getEVCVisits();
        setVisits(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-[#27232C]">Expert Visit Committee (EVC) Central Oversight</h2>
        <p className="text-xs text-[#77727E] mt-0.5">
          Monitoring on-site physical infrastructure verifications, committee composition, and conflict-of-interest checks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#D9D8DE] shadow-xs">
          <span className="text-xs text-[#77727E] font-semibold uppercase">Total Visits Scheduled</span>
          <p className="text-2xl font-extrabold text-[#321B35] mt-1">{visits.length}</p>
          <span className="text-[11px] text-[#77727E]">Across active institutions</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[#D9D8DE] shadow-xs">
          <span className="text-xs text-[#77727E] font-semibold uppercase">Committee Conflicts Flagged</span>
          <p className="text-2xl font-extrabold text-[#C44949] mt-1">
            {visits.filter((v) => v.conflictFlag).length}
          </p>
          <span className="text-[11px] text-[#C44949] font-semibold">Immediate re-allocation advised</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[#D9D8DE] shadow-xs">
          <span className="text-xs text-[#77727E] font-semibold uppercase">Reports Verified</span>
          <p className="text-2xl font-extrabold text-[#27845A] mt-1">
            {visits.filter((v) => v.status === 'INSPECTION_CONDUCTED' || v.status === 'REPORT_SUBMITTED').length}
          </p>
          <span className="text-[11px] text-[#27845A] font-semibold">Ready for SAC / Council review</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#D9D8DE] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E9EAEE]">
          <h3 className="text-sm font-bold text-[#27232C]">EVC Scheduled Roster</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] border-b border-[#D9D8DE] text-[#77727E] font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Visit ID & Application</th>
                <th className="py-3 px-4">Institution & Region</th>
                <th className="py-3 px-4">Visit Date</th>
                <th className="py-3 px-4">Committee Leader & Members</th>
                <th className="py-3 px-4">Conflict Status</th>
                <th className="py-3 px-4">Visit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EAEE]">
              {visits.map((v) => (
                <tr key={v.id} className="hover:bg-[#F8F9FA] transition">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-[#321B35] block">{v.id}</span>
                    <span className="font-mono text-[10px] text-[#77727E]">{v.applicationId}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-[#27232C] block">{v.institutionName}</span>
                    <span className="text-[#77727E] text-[11px]">{v.region} Region</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#27232C]">
                    {new Date(v.scheduledDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#27232C] block">{v.committeeLeader}</span>
                    <span className="text-[10px] text-[#77727E] line-clamp-1">{v.committeeMembers?.join(', ')}</span>
                  </td>
                  <td className="py-3 px-4">
                    {v.conflictFlag ? (
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FDE8E8] text-[#C44949] border border-[#F8B4B4] inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Conflict Alert
                        </span>
                        <p className="text-[10px] text-[#C44949] italic mt-0.5 max-w-[200px]">{v.conflictNotes}</p>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#27845A] border border-[#A7F3D0]">
                        No Conflicts
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4F5F8] text-[#321B35] border border-[#D9D8DE]">
                      {v.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
