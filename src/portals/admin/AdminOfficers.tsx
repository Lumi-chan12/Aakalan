import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ApiService } from '../../services/api';
import { OfficerWorkload } from '../../types';

export const AdminOfficers: React.FC = () => {
  const [officers, setOfficers] = useState<OfficerWorkload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getOfficers();
        setOfficers(data);
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
        <h2 className="text-xl font-extrabold text-[#27232C]">Scrutiny Officers & Workload Allocation</h2>
        <p className="text-xs text-[#77727E] mt-0.5">
          Real-time workload distribution, pendency metrics, and SLA turnaround times across regional scrutiny committees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#D9D8DE] shadow-xs">
          <span className="text-xs text-[#77727E] font-semibold uppercase">Total Active Officers</span>
          <p className="text-2xl font-extrabold text-[#27232C] mt-1">{officers.length}</p>
          <span className="text-[11px] text-[#27845A] font-semibold">All bureaus staffed</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[#D9D8DE] shadow-xs">
          <span className="text-xs text-[#77727E] font-semibold uppercase">Active Case Load</span>
          <p className="text-2xl font-extrabold text-[#321B35] mt-1">
            {officers.reduce((acc, o) => acc + o.pendingCount, 0)} Applications
          </p>
          <span className="text-[11px] text-[#77727E]">Currently in desk scrutiny</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[#D9D8DE] shadow-xs">
          <span className="text-xs text-[#77727E] font-semibold uppercase">Avg Turnaround Time</span>
          <p className="text-2xl font-extrabold text-[#27845A] mt-1">5.1 Days</p>
          <span className="text-[11px] text-[#77727E]">SLA target: &lt; 7.0 days</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#D9D8DE] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E9EAEE]">
          <h3 className="text-sm font-bold text-[#27232C]">Officer Performance & Assignment Register</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] border-b border-[#D9D8DE] text-[#77727E] font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Officer Name</th>
                <th className="py-3 px-4">Designation & Region</th>
                <th className="py-3 px-4">Assigned Cases</th>
                <th className="py-3 px-4">Pending Scrutiny</th>
                <th className="py-3 px-4">Completed (Month)</th>
                <th className="py-3 px-4">Overdue</th>
                <th className="py-3 px-4">Avg SLA Days</th>
                <th className="py-3 px-4">Workload Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EAEE]">
              {officers.map((o) => (
                <tr key={o.id} className="hover:bg-[#F8F9FA] transition">
                  <td className="py-3 px-4 font-bold text-[#27232C]">{o.name}</td>
                  <td className="py-3 px-4 text-[#77727E]">{o.region} Region</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#27232C]">{o.assignedCount}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#C58A16]">{o.pendingCount}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#27845A]">{o.completedThisMonth}</td>
                  <td className="py-3 px-4 font-mono">
                    {o.overdueCount > 0 ? (
                      <span className="font-bold text-[#C44949]">{o.overdueCount}</span>
                    ) : (
                      <span className="text-[#77727E]">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#27232C]">{o.avgCompletionDays}d</td>
                  <td className="py-3 px-4">
                    {o.status === 'OVERLOADED' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FDE8E8] text-[#C44949] border border-[#F8B4B4]">
                        OVERLOADED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#27845A] border border-[#A7F3D0]">
                        BALANCED
                      </span>
                    )}
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
