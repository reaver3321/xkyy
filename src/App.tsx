/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GlobalHeader } from './components/GlobalHeader';
import { AIWardRound } from './components/AIWardRound';
import { ClinicalDecision } from './components/ClinicalDecision';
import { PatientSidebar } from './components/PatientSidebar';
import { patientsData } from './data/patients';

export default function App() {
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

  const currentPatient =
    patientsData.find((patient) => patient.id === currentPatientId) ?? patientsData[0];

  if (!currentPatient) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Left Sidebar for Patient Switching */}
      <PatientSidebar 
        patients={patientsData} 
        currentPatientId={currentPatient.id}
        onSelectPatient={setCurrentPatientId}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div ref={mainRef} className="flex-1 overflow-y-auto">
          <GlobalHeader patient={currentPatient} isScrolled={isScrolled} />
          
          <main className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col xl:flex-row gap-8">
              {/* Left Column - 60% */}
              <div className="w-full xl:w-3/5 space-y-6">
                <AIWardRound patient={currentPatient} />
              </div>
              
              {/* Right Column - 40% */}
              <div className="w-full xl:w-2/5 space-y-6">
                <ClinicalDecision patient={currentPatient} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
