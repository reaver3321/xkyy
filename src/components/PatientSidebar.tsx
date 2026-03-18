import React, { useState } from 'react';
import { Activity, Clock, Search } from 'lucide-react';
import type { PatientRecord } from '../types/patient';

interface PatientSidebarProps {
  patients: PatientRecord[];
  currentPatientId: string;
  onSelectPatient: (patientId: string) => void;
}

export function PatientSidebar({
  patients,
  currentPatientId,
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
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-20 shrink-0">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-6 h-6 text-blue-600 shrink-0" />
          <h1 className="text-base font-bold text-slate-800 leading-tight">心内科查房病例</h1>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索床位 / 标题 / 标签"
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
          PDF 病例（{filteredPatients.length} / {patients.length}）
        </div>

        {filteredPatients.map((patient) => {
          const isActive = currentPatientId === patient.id;
          return (
            <button
              key={patient.id}
              onClick={() => onSelectPatient(patient.id)}
              className={`w-full text-left p-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm text-slate-700'
              }`}
            >
              <div className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-800'}`}>{patient.bed}</div>
              <div className={`mt-2 text-sm ${isActive ? 'text-blue-50' : 'text-slate-700'}`}>{patient.title}</div>
              <div className={`mt-2 text-xs flex items-center ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                <Clock className="w-3 h-3 mr-1 shrink-0" />
                <span>{patient.roundTime}</span>
              </div>
            </button>
          );
        })}

        {filteredPatients.length === 0 ? (
          <div className="px-3 py-6 text-sm text-slate-500 text-center">没有匹配的病例。</div>
        ) : null}
      </div>
    </div>
  );
}
