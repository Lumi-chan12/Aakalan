import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, AlertTriangle, FileText, Search, Filter } from 'lucide-react';
import { ApiService } from '../../services/api';
import { ComplianceRecord } from '../../types';
import { Badge } from '../../components/common/Badge';

export const AdminCompliance: React.FC = () => {
  const [documents, setDocuments] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getComplianceDocuments();
        setDocuments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = documents.filter((d) => {
    if (statusFilter !== 'ALL' && d.submissionStatus !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && d.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        d.institutionName.toLowerCase().includes(q) ||
        d.documentType.toLowerCase().includes(q) ||
        d.documentNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-[#27232C]">Central Compliance & Document Register</h2>
        <p className="text-xs text-[#77727E] mt-0.5">
          Statutory compliance monitoring: 30-year lease deeds, fire NOC validity, building stability, and cadre undertakings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#D9D8DE] shadow-xs">
          <span className="text-xs text-[#77727E] font-semibold uppercase">Total Tracked Records</span>
          <p className="text-2xl font-extrabold text-[#27232C] mt-1">{documents.length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[#D9D8DE] shadow-xs">
          <span className="text-xs text-[#77727E] font-semibold uppercase">Verified in Order</span>
          <p className="text-2xl font-extrabold text-[#27845A] mt-1">
            {documents.filter((d) => d.submissionStatus === 'VERIFIED').length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[#D9D8DE] shadow-xs">
          <span className="text-xs text-[#77727E] font-semibold uppercase">Expiring in 60 Days</span>
          <p className="text-2xl font-extrabold text-[#C58A16] mt-1">
            {documents.filter((d) => d.submissionStatus === 'EXPIRING_SOON').length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[#D9D8DE] shadow-xs">
          <span className="text-xs text-[#77727E] font-semibold uppercase">Expired / Missing</span>
          <p className="text-2xl font-extrabold text-[#C44949] mt-1">
            {documents.filter((d) => d.submissionStatus === 'EXPIRED' || d.submissionStatus === 'MISSING').length}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#D9D8DE] shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#77727E]" />
          <input
            type="text"
            placeholder="Search document, institution or reg number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#F4F5F8] border border-[#D9D8DE] rounded-lg text-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-1.5 bg-[#F4F5F8] border border-[#D9D8DE] rounded-lg text-xs"
        >
          <option value="ALL">All Statuses</option>
          <option value="VERIFIED">Verified</option>
          <option value="EXPIRING_SOON">Expiring Soon</option>
          <option value="EXPIRED">Expired</option>
          <option value="MISSING">Missing</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-1.5 bg-[#F4F5F8] border border-[#D9D8DE] rounded-lg text-xs"
        >
          <option value="ALL">All Categories</option>
          <option value="Land & Lease">Land & Lease</option>
          <option value="Safety NOC">Safety NOC</option>
          <option value="Affiliation">Affiliation</option>
          <option value="Statutory Undertaking">Statutory Undertaking</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-[#D9D8DE] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] border-b border-[#D9D8DE] text-[#77727E] font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Document Title & Number</th>
                <th className="py-3 px-4">Institution & Region</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Renewal Deadline</th>
                <th className="py-3 px-4">Responsible Person</th>
                <th className="py-3 px-4">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EAEE]">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-[#F8F9FA] transition">
                  <td className="py-3 px-4 font-semibold text-[#27232C]">
                    <div className="font-bold">{d.documentType}</div>
                    <div className="text-[10px] font-mono text-[#77727E]">{d.documentNumber}</div>
                    {d.notes && <p className="text-[10px] text-[#C44949] italic mt-0.5">{d.notes}</p>}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-[#27232C] block">{d.institutionName}</span>
                    <span className="text-[#77727E] text-[10px]">{d.region} Region</span>
                  </td>
                  <td className="py-3 px-4 text-[#77727E]">{d.category}</td>
                  <td className="py-3 px-4 font-mono font-medium text-[#27232C]">{d.expiryDate}</td>
                  <td className="py-3 px-4 font-mono text-[#77727E]">{d.renewalDeadline}</td>
                  <td className="py-3 px-4 text-[#77727E]">{d.responsiblePerson}</td>
                  <td className="py-3 px-4">
                    <Badge variant="compliance">{d.submissionStatus}</Badge>
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
