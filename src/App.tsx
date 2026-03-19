/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { AIWardRound } from './components/AIWardRound';
import { ClinicalDecision } from './components/ClinicalDecision';
import { GlobalHeader } from './components/GlobalHeader';
import { InsightsViewer } from './components/InsightsViewer';
import { PatientSidebar } from './components/PatientSidebar';
import { patientsData } from './data/patients';

type SidebarView = 'patients' | 'insights';

const insightsReportSrc = `${import.meta.env.BASE_URL}reports/ai-ward-round-insights.pdf`;

export default function App() {
  const [activeView, setActiveView] = useState<SidebarView>('patients');
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState(patientsData[0]?.id ?? '');
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (mainRef.current) {
        setIsScrolled(mainRef.current.scrollTop > 20);
      }
    };

    const mainEl = mainRef.current;
    if (mainEl) {
      mainEl.addEventListener('scroll', handleScroll);
      return () => mainEl.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const currentPatient = patientsData.find((patient) => patient.id === currentPatientId) ?? patientsData[0];

  if (!currentPatient) {
    return null;
  }

  const handleSelectPatient = (patientId: string) => {
    setCurrentPatientId(patientId);
    setActiveView('patients');
  };

  const handleSelectInsights = () => {
    setActiveView('insights');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
      <PatientSidebar
        patients={patientsData}
        currentPatientId={currentPatient.id}
        activeView={activeView}
        onSelectInsights={handleSelectInsights}
        onSelectPatient={handleSelectPatient}
      />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div ref={mainRef} className="flex-1 overflow-y-auto">
          {activeView === 'patients' ? <GlobalHeader patient={currentPatient} isScrolled={isScrolled} /> : null}

          <main className="px-4 py-8 sm:px-6 lg:px-8">
            {activeView === 'patients' ? (
              <div className="flex flex-col gap-8 xl:flex-row">
                <div className="w-full space-y-6 xl:w-3/5">
                  <AIWardRound patient={currentPatient} />
                </div>

                <div className="w-full space-y-6 xl:w-2/5">
                  <ClinicalDecision patient={currentPatient} />
                </div>
              </div>
            ) : (
              <InsightsViewer reportSrc={insightsReportSrc} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
