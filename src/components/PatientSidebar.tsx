import React, { useState } from 'react';
import { Activity, Clock, Lightbulb, Search } from 'lucide-react';
import type { PatientRecord } from '../types/patient';

interface PatientSidebarProps {
  patients: PatientRecord[];
  currentPatientId: string;
  activeView: 'patients' | 'insights';
  onSelectInsights: () => void;
  onSelectPatient: (patientId: string) => void;
}

const copy = {
  title: '\u80f8\u79d1\u533b\u9662 AI \u67e5\u623f\u75c5\u4f8b',
  searchPlaceholder: '\u641c\u7d22\u5e8a\u4f4d / \u6807\u9898 / \u6807\u7b7e',
  patientSection: '\u0050\u0044\u0046\u75c5\u4f8b',
  insightsSection: '\u603b\u7ed3\u4e0e\u6d1e\u5bdf',
  insightsTitle: '\u80f8\u79d1\u533b\u9662 AI \u67e5\u623f\u62a5\u544a\u6d1e\u5bdf\u4e0e\u5efa\u8bae',
  insightsDescription: '\u70b9\u51fb\u540e\u5728\u53f3\u4fa7\u663e\u793a PDF \u9644\u4ef6\uff0c\u4fdd\u7559\u53ef\u70b9\u51fb\u8d85\u94fe\u63a5\u3002',
  emptyState: '\u6ca1\u6709\u5339\u914d\u7684\u75c5\u4f8b\u3002',
};

export function PatientSidebar({
  patients,
  currentPatientId,
  activeView,
  onSelectInsights,
  onSelectPatient,
}: PatientSidebarProps) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filteredPatients = normalizedQuery
    ? patients.filter((patient) =>
        [patient.bed, patient.title, patient.roundTime, ...patient.tags].some((field) =>
          field.toLowerCase().includes(normalizedQuery),
        ),
      )
    : patients;

  return (
    <div className="z-20 flex h-full w-80 shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-6 w-6 shrink-0 text-blue-600" />
          <h1 className="text-base font-bold leading-tight text-slate-800">{copy.title}</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchPlaceholder}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-slate-50/50">
        <div className="h-full overflow-y-auto p-3">
          <div className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            {`${copy.patientSection} (${filteredPatients.length} / ${patients.length})`}
          </div>

          <div className="space-y-2">
            {filteredPatients.map((patient) => {
              const isActive = activeView === 'patients' && currentPatientId === patient.id;
              return (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => onSelectPatient(patient.id)}
                  className={`w-full rounded-xl p-3 text-left transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-800'}`}>{patient.bed}</div>
                  <div className={`mt-2 text-sm ${isActive ? 'text-blue-50' : 'text-slate-700'}`}>{patient.title}</div>
                  <div className={`mt-2 flex items-center text-xs ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                    <Clock className="mr-1 h-3 w-3 shrink-0" />
                    <span>{patient.roundTime}</span>
                  </div>
                </button>
              );
            })}

            {filteredPatients.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-slate-500">{copy.emptyState}</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white p-3">
        <div className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">{copy.insightsSection}</div>

        <button
          type="button"
          onClick={onSelectInsights}
          className={`w-full rounded-2xl p-4 text-left transition-all ${
            activeView === 'insights'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
              : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-amber-300 hover:bg-amber-50'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`rounded-xl p-2 ${
                activeView === 'insights' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
              }`}
            >
              <Lightbulb className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className={`text-sm font-bold ${activeView === 'insights' ? 'text-white' : 'text-slate-800'}`}>
                {copy.insightsTitle}
              </div>
              <div className={`mt-2 text-xs leading-5 ${activeView === 'insights' ? 'text-amber-50' : 'text-slate-500'}`}>
                {copy.insightsDescription}
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
