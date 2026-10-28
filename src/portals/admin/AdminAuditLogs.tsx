import React, { useState, useEffect } from 'react';
import { FileClock, Search, ShieldCheck, Lock, ExternalLink } from 'lucide-react';
import { ApiService } from '../../services/api';
import { AuditLogItem } from '../../types';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getAuditLogs();
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.actorName.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.entityId.toLowerCase().includes(q) ||
      l.remarks.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#27232C]">Immutable System Audit Trail</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#27845A] border border-[#A7F3D0] flex items-center gap-1">
              <Lock className="w-3 h-3" /> Append-Only WORM Storage
            </span>
          </div>
          <p className="text-xs text-[#77727E] mt-0.5">
            Every state transition, officer assignment, deficiency, and council approval generates a permanent record.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#D9D8DE] shadow-xs flex items-center gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#77727E]" />
          <input
            type="text"
            placeholder="Search by actor, action keyword, application ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#F4F5F8] border border-[#D9D8DE] rounded-lg text-xs"
          />
        </div>
        <span className="text-xs text-[#77727E] font-medium">
          Showing <strong>{filtered.length}</strong> events
        </span>
      </div>

      <div className="bg-white rounded-xl border border-[#D9D8DE] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] border-b border-[#D9D8DE] text-[#77727E] font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Event ID & Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4">State Transition</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Official Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EAEE]">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-[#F8F9FA] transition">
                  <td className="py-3 px-4 font-mono">
                    <span className="font-bold text-[#321B35] block">{log.id}</span>
                    <span className="text-[10px] text-[#77727E]">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-[#27232C] block">{log.actorName}</span>
                    <span className="text-[10px] text-[#77727E] uppercase font-mono">{log.actorRole}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#FFF8EB] text-[#8A5B00] border border-[#F7D488]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-[#27232C]">{log.entityId}</td>
                  <td className="py-3 px-4 text-[11px]">
                    <div className="flex items-center gap-1 font-mono">
                      <span className="text-[#77727E]">{log.previousState || 'None'}</span>
                      <span className="text-[#321B35] font-bold">→</span>
                      <span className="font-bold text-[#27845A]">{log.newState}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#77727E] text-[11px]">{log.ipAddress}</td>
                  <td className="py-3 px-4 text-[#27232C] italic max-w-xs truncate">"{log.remarks}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
