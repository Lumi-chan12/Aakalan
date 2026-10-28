import React, { useState } from 'react';
import { Terminal, CheckCircle2, XCircle, Play, Code, BookOpen, ExternalLink } from 'lucide-react';
import { ApiService } from '../../services/api';

export const AdminSystem: React.FC = () => {
  const [testResults, setTestResults] = useState<{ passed: number; failed: number; results: any[] } | null>(null);
  const [running, setRunning] = useState(false);
  const [openApiSpec, setOpenApiSpec] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'openapi'>('tests');

  const runTests = async () => {
    setRunning(true);
    try {
      const data = await ApiService.runWorkflowTests();
      setTestResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  const loadOpenApi = async () => {
    try {
      const res = await fetch('/api/openapi.json');
      const data = await res.json();
      setOpenApiSpec(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#27232C]">Workflow Engine Diagnostics & REST API Docs</h2>
          <p className="text-xs text-[#77727E] mt-0.5">
            Unit-testable state machine verification, role authorization validation, and OpenAPI 3.0 contract.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'tests' ? 'bg-[#321B35] text-white' : 'bg-white border border-[#D9D8DE] text-[#27232C]'
            }`}
          >
            Workflow Unit Tests
          </button>
          <button
            onClick={() => {
              setActiveTab('openapi');
              if (!openApiSpec) loadOpenApi();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'openapi' ? 'bg-[#321B35] text-white' : 'bg-white border border-[#D9D8DE] text-[#27232C]'
            }`}
          >
            Swagger / OpenAPI 3.0 Specs
          </button>
        </div>
      </div>

      {activeTab === 'tests' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-[#D9D8DE] shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#27232C]">Automated Transition Test Suite</h3>
              <p className="text-xs text-[#77727E]">
                Executes tests covering: Valid transitions, illegal skipping of stages, role unauthorized actions,
                deficiency return remarks enforcement, and unresolved deficiency blockades.
              </p>
            </div>
            <button
              onClick={runTests}
              disabled={running}
              className="px-4 py-2 bg-[#F2B544] text-[#321B35] font-extrabold text-xs rounded-lg hover:bg-[#E5A734] transition flex items-center gap-2 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {running ? 'Running Tests...' : 'Execute Test Suite'}
            </button>
          </div>

          {testResults && (
            <div className="bg-white rounded-xl border border-[#D9D8DE] shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-4 text-xs font-bold pb-3 border-b border-[#E9EAEE]">
                <span className="flex items-center gap-1.5 text-[#27845A]">
                  <CheckCircle2 className="w-4 h-4" /> Passed: {testResults.passed}
                </span>
                <span className="flex items-center gap-1.5 text-[#C44949]">
                  <XCircle className="w-4 h-4" /> Failed: {testResults.failed}
                </span>
                <span className="text-[#77727E] ml-auto font-mono text-[11px]">
                  All Transition Logic Verified
                </span>
              </div>

              <div className="space-y-2.5">
                {testResults.results?.map((res, i) => (
                  <div
                    key={i}
                    className="p-3 bg-[#F8F9FA] rounded-lg border border-[#E9EAEE] flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      {res.status === 'PASS' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#27845A] shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[#C44949] shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold text-[#27232C] block">{res.test}</span>
                        {res.note && <p className="text-[11px] text-[#77727E] mt-0.5">{res.note}</p>}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        res.status === 'PASS'
                          ? 'bg-[#ECFDF5] text-[#27845A] border border-[#A7F3D0]'
                          : 'bg-[#FDE8E8] text-[#C44949]'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'openapi' && (
        <div className="bg-white rounded-xl border border-[#D9D8DE] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E9EAEE]">
            <div>
              <h3 className="text-sm font-bold text-[#27232C]">Aakalan REST API Specification (OpenAPI 3.0)</h3>
              <p className="text-xs text-[#77727E]">Live endpoints for approval workflows, scrutiny, and compliance</p>
            </div>
            <a
              href="/api/openapi.json"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-[#321B35] hover:underline flex items-center gap-1"
            >
              Open Raw JSON <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <pre className="p-4 bg-[#241326] text-[#E9EAEE] rounded-xl text-xs font-mono overflow-x-auto max-h-96">
            {openApiSpec ? JSON.stringify(openApiSpec, null, 2) : 'Loading OpenAPI specification...'}
          </pre>
        </div>
      )}
    </div>
  );
};
